/**
 * Centralized Order Transition Service for Zibonbaba.com
 * Handles atomic status updates, optimistic concurrency, status history logging,
 * financial ledgers, outbox persistence, and cross-portal real-time broadcast.
 */

import { prisma } from '@/lib/prisma';
import { canUserPerformTransition } from '@/lib/services/orderStateMachine';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';
import { logAdminAction } from '@/lib/auth';

export interface OrderTransitionInput {
  orderId: string;
  targetStatus: string;
  user: {
    id: string;
    role: string;
    fullName?: string;
    email?: string;
  };
  expectedVersion?: number;
  reason?: string;
  otp?: string;
  proofNotes?: string;
  codCollected?: boolean;
  failedReason?: string;
}

export interface TransitionResult {
  success: boolean;
  message: string;
  order?: any;
  previousStatus?: string;
  newStatus?: string;
  version?: number;
}

export async function executeOrderStatusTransition(input: OrderTransitionInput): Promise<TransitionResult> {
  const {
    orderId,
    targetStatus,
    user,
    expectedVersion,
    reason,
    otp,
    proofNotes,
    codCollected,
    failedReason
  } = input;

  const normalizedTarget = (targetStatus || '').toUpperCase().trim();
  if (!normalizedTarget) {
    throw new Error('Target order status is required.');
  }

  // 1. Fetch current order with all associated ecosystem relationships
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      store: true,
      customer: true,
      resellerOrder: true,
      deliveryAssignment: true,
      items: {
        include: {
          variant: true
        }
      }
    }
  });

  if (!order) {
    throw new Error(`Order #${orderId} not found.`);
  }

  const currentStatus = order.status.toUpperCase();

  // 2. Validate user relationship context & permissions
  const context = {
    role: user.role,
    userId: user.id,
    isCustomerOwner: Boolean(order.customerId && order.customerId === user.id),
    isSellerOwner: Boolean(order.store && order.store.ownerId === user.id),
    isResellerOwner: Boolean(order.resellerOrder && order.resellerOrder.resellerId === user.id),
    isAssignedCourier: Boolean(order.deliveryAssignment && order.deliveryAssignment.deliveryManId === user.id)
  };

  const permCheck = canUserPerformTransition(currentStatus, normalizedTarget, context);
  if (!permCheck.allowed) {
    throw new Error(permCheck.reason || `Unauthorized to transition order to ${normalizedTarget}.`);
  }

  // 3. Optimistic Concurrency Control / Stale update protection
  if (expectedVersion !== undefined && expectedVersion !== null) {
    if (order.version !== expectedVersion) {
      throw new Error(`Conflict: Order #${orderId} was updated by another user (Current version: ${order.version}, Submitted: ${expectedVersion}). Please refresh.`);
    }
  }

  // 4. Verify OTP for delivery completion if configured
  if (normalizedTarget === 'DELIVERED' && order.deliveryAssignment?.deliveryOtp && otp) {
    if (otp.toString().trim() !== order.deliveryAssignment.deliveryOtp.toString().trim()) {
      throw new Error('Invalid delivery OTP entered. Please verify with customer.');
    }
  }

  const nextVersion = (order.version || 1) + 1;
  const now = new Date();
  const shortOrderCode = order.id.substring(0, 8).toUpperCase();

  // 5. Atomic DB Transaction: Order + Assignment + Reseller + History + Outbox + Ledgers
  const result = await prisma.$transaction(async (tx) => {
    // A. Update Main Order State
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: normalizedTarget,
        version: nextVersion,
        updatedAt: now
      }
    });

    // B. Synchronize Delivery Assignment if present
    if (order.deliveryAssignment) {
      let mappedDeliveryStatus = normalizedTarget;
      if (normalizedTarget === 'PROCESSING') mappedDeliveryStatus = 'ACCEPTED';
      else if (normalizedTarget === 'SHIPPED') mappedDeliveryStatus = 'IN_TRANSIT';
      else if (normalizedTarget === 'READY_FOR_DELIVERY') mappedDeliveryStatus = 'ASSIGNED';

      const deliveryUpdate: any = {
        status: mappedDeliveryStatus,
        updatedAt: now,
        ...(proofNotes ? { proofNotes } : {}),
        ...(codCollected !== undefined ? { codCollected: Boolean(codCollected) } : {})
      };

      if (normalizedTarget === 'ACCEPTED') deliveryUpdate.acceptedAt = now;
      if (normalizedTarget === 'PICKED_UP') deliveryUpdate.pickedUpAt = now;
      if (normalizedTarget === 'DELIVERED') deliveryUpdate.deliveredAt = now;
      if (normalizedTarget === 'FAILED') {
        deliveryUpdate.failedAt = now;
        deliveryUpdate.failedReason = failedReason || 'Delivery attempt failed';
      }

      await tx.deliveryAssignment.update({
        where: { id: order.deliveryAssignment.id },
        data: deliveryUpdate
      });

      // Credit Delivery Driver Wallet on DELIVERED
      if (normalizedTarget === 'DELIVERED') {
        const driverId = order.deliveryAssignment.deliveryManId;
        const deliveryFee = order.deliveryAssignment.deliveryFee || 120.0;
        const codAmount = order.deliveryAssignment.codAmount || 0.0;

        const driverUser = await tx.user.findUnique({ where: { id: driverId } });
        const newDriverBal = (driverUser?.walletBalance || 0) + deliveryFee;

        await tx.user.update({
          where: { id: driverId },
          data: { walletBalance: newDriverBal }
        });

        await tx.deliveryProfile.updateMany({
          where: { userId: driverId },
          data: {
            completedDeliveries: { increment: 1 },
            totalEarnings: { increment: deliveryFee },
            ...(Boolean(codCollected) ? { cashInHand: { increment: codAmount } } : {})
          }
        });

        await tx.walletTransaction.create({
          data: {
            userId: driverId,
            type: 'CREDIT',
            amount: deliveryFee,
            balance: newDriverBal,
            description: `Delivery fee payout for completed order #${shortOrderCode}`,
            reference: order.id
          }
        });
      }
    }

    // C. Synchronize Reseller Order if present
    if (order.resellerOrder) {
      const ro = order.resellerOrder;
      await tx.resellerOrder.update({
        where: { id: ro.id },
        data: {
          status: normalizedTarget,
          updatedAt: now,
          ...(normalizedTarget === 'DELIVERED' ? { payoutStatus: 'AVAILABLE' } : {})
        }
      });

      // Credit Reseller Wallet on DELIVERED
      if (normalizedTarget === 'DELIVERED' && ro.resellerProfit > 0) {
        const resellerUser = await tx.user.findUnique({ where: { id: ro.resellerId } });
        const newResellerBal = (resellerUser?.walletBalance || 0) + ro.resellerProfit;

        await tx.user.update({
          where: { id: ro.resellerId },
          data: { walletBalance: newResellerBal }
        });

        await tx.walletTransaction.create({
          data: {
            userId: ro.resellerId,
            type: 'CREDIT',
            amount: ro.resellerProfit,
            balance: newResellerBal,
            description: `Profit commission for delivered order #${shortOrderCode}`,
            reference: order.id
          }
        });
      }
    }

    // D. Credit Seller Wallet on DELIVERED
    if (normalizedTarget === 'DELIVERED' && order.store?.ownerId) {
      const sellerId = order.store.ownerId;
      const commissionRate = order.store.commissionRate || 10.0;
      const platformCut = (order.total * commissionRate) / 100.0;
      const resellerProfit = order.resellerOrder?.resellerProfit || 0.0;
      const netSellerRevenue = Math.max(0, order.total - platformCut - resellerProfit);

      if (netSellerRevenue > 0) {
        const sellerUser = await tx.user.findUnique({ where: { id: sellerId } });
        const newSellerBal = (sellerUser?.walletBalance || 0) + netSellerRevenue;

        await tx.user.update({
          where: { id: sellerId },
          data: { walletBalance: newSellerBal }
        });

        await tx.walletTransaction.create({
          data: {
            userId: sellerId,
            type: 'CREDIT',
            amount: netSellerRevenue,
            balance: newSellerBal,
            description: `Net sales revenue payout for delivered order #${shortOrderCode}`,
            reference: order.id
          }
        });
      }
    }

    // E. Record Immutable Status History Timeline
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: currentStatus,
        newStatus: normalizedTarget,
        changedById: user.id,
        changedByRole: user.role,
        changedByName: user.fullName || user.email || 'User',
        reason: reason || failedReason || null,
        version: nextVersion
      }
    });

    // F. Create Cross-Portal Notification Records
    // Customer
    if (order.customerId) {
      await tx.notification.create({
        data: {
          userId: order.customerId,
          title: `Order #${shortOrderCode} Status Updated: ${normalizedTarget}`,
          body: `Your order is now ${normalizedTarget.toLowerCase().replace(/_/g, ' ')}.`,
          type: normalizedTarget === 'DELIVERED' ? 'SUCCESS' : normalizedTarget === 'CANCELLED' ? 'WARNING' : 'INFO',
          priority: normalizedTarget === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
          module: 'MARKETPLACE',
          link: `/tracking?orderId=${order.id}`
        }
      });
    }

    // Seller
    if (order.store?.ownerId && order.store.ownerId !== user.id) {
      await tx.notification.create({
        data: {
          userId: order.store.ownerId,
          title: `Order #${shortOrderCode}: ${normalizedTarget}`,
          body: `Order #${shortOrderCode} is now marked as ${normalizedTarget}.`,
          type: 'INFO',
          priority: 'MEDIUM',
          module: 'ERP',
          link: `/seller/orders`
        }
      });
    }

    // Reseller
    if (order.resellerOrder && order.resellerOrder.resellerId !== user.id) {
      await tx.notification.create({
        data: {
          userId: order.resellerOrder.resellerId,
          title: `Reseller Order #${shortOrderCode}: ${normalizedTarget}`,
          body: `Customer order #${shortOrderCode} is now ${normalizedTarget}.`,
          type: normalizedTarget === 'DELIVERED' ? 'SUCCESS' : 'INFO',
          priority: normalizedTarget === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
          module: 'WALLET',
          link: `/reseller/orders`
        }
      });
    }

    // Delivery Driver
    if (order.deliveryAssignment && order.deliveryAssignment.deliveryManId !== user.id) {
      await tx.notification.create({
        data: {
          userId: order.deliveryAssignment.deliveryManId,
          title: `Delivery Task #${shortOrderCode} Updated`,
          body: `Task status is now ${normalizedTarget}.`,
          type: 'INFO',
          priority: 'HIGH',
          module: 'DELIVERY',
          link: `/delivery`
        }
      });
    }

    return updatedOrder;
  });

  // 6. Broadcast Real-Time Event Across Authorized Channels
  const channels: string[] = [
    `order:${order.id}`,
    'role:ADMIN',
    'role:SUPER_ADMIN',
    'role:MANAGER',
    'role:DELIVERY_MANAGER'
  ];

  if (order.customerId) channels.push(`user:${order.customerId}`);
  if (order.store?.ownerId) channels.push(`user:${order.store.ownerId}`, `store:${order.storeId}`);
  if (order.resellerOrder?.resellerId) channels.push(`user:${order.resellerOrder.resellerId}`);
  if (order.deliveryAssignment?.deliveryManId) channels.push(`user:${order.deliveryAssignment.deliveryManId}`);

  await realtimeEngine.broadcast({
    eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventType: PlatformEventType.ORDER_STATUS_UPDATED,
    aggregateType: 'ORDER',
    aggregateId: order.id,
    timestamp: now.toISOString(),
    version: nextVersion,
    channels,
    data: {
      orderId: order.id,
      orderCode: shortOrderCode,
      previousStatus: currentStatus,
      newStatus: normalizedTarget,
      version: nextVersion,
      total: order.total,
      changedBy: {
        id: user.id,
        role: user.role,
        name: user.fullName || user.email || 'User'
      },
      reason: reason || failedReason || null,
      updatedAt: now.toISOString()
    }
  });

  await logAdminAction(
    user.id,
    `ORDER_TRANSITION: Order #${shortOrderCode} [${currentStatus} -> ${normalizedTarget}] v${nextVersion}`
  );

  return {
    success: true,
    message: `Order #${shortOrderCode} successfully transitioned to ${normalizedTarget}.`,
    order: result,
    previousStatus: currentStatus,
    newStatus: normalizedTarget,
    version: nextVersion
  };
}
