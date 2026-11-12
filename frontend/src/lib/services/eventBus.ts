/**
 * Centralized Cross-Portal Event & Notification Dispatcher for Zibonbaba.com
 */

import { prisma } from '@/lib/prisma';

export interface DispatchNotificationOptions {
  userId: string;
  title: string;
  body: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  module?: 'MARKETPLACE' | 'ERP' | 'CRM' | 'HRM' | 'FINANCE' | 'SECURITY' | 'SUPPORT' | 'WALLET' | 'DELIVERY';
  link?: string;
  tx?: any; // Optional Prisma transaction client
}

/**
 * Creates an in-app notification for a user.
 */
export async function sendNotification(options: DispatchNotificationOptions): Promise<void> {
  const db = options.tx || prisma;
  try {
    await db.notification.create({
      data: {
        userId: options.userId,
        title: options.title,
        body: options.body,
        type: options.type || 'INFO',
        priority: options.priority || 'MEDIUM',
        module: options.module || 'MARKETPLACE',
        link: options.link || null
      }
    });
  } catch (err) {
    console.error('Failed to dispatch notification:', err);
  }
}

/**
 * Dispatches cross-portal notifications when an order status changes.
 */
export async function dispatchOrderStatusEvents(params: {
  orderId: string;
  newStatus: string;
  customerId?: string | null;
  sellerOwnerId?: string | null;
  resellerId?: string | null;
  deliveryManId?: string | null;
  orderNumber?: string;
  tx?: any;
}): Promise<void> {
  const {
    orderId,
    newStatus,
    customerId,
    sellerOwnerId,
    resellerId,
    deliveryManId,
    orderNumber = orderId.substring(0, 8).toUpperCase(),
    tx
  } = params;

  const db = tx || prisma;
  const statusUpper = newStatus.toUpperCase();

  // 1. Notify Customer
  if (customerId) {
    let customerTitle = `Order #${orderNumber} Status Updated`;
    let customerBody = `Your order is now ${statusUpper.toLowerCase()}.`;

    if (statusUpper === 'SHIPPED') {
      customerTitle = `Order #${orderNumber} is Shipped! 🚚`;
      customerBody = `Your order has been dispatched and is on its way.`;
    } else if (statusUpper === 'DELIVERED') {
      customerTitle = `Order #${orderNumber} Delivered! 🎉`;
      customerBody = `Your order has been successfully delivered. Thank you for shopping with Zibonbaba!`;
    }

    await sendNotification({
      userId: customerId,
      title: customerTitle,
      body: customerBody,
      type: statusUpper === 'DELIVERED' ? 'SUCCESS' : 'INFO',
      priority: statusUpper === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
      module: 'MARKETPLACE',
      link: `/tracking?orderId=${orderId}`,
      tx: db
    });
  }

  // 2. Notify Seller
  if (sellerOwnerId) {
    await sendNotification({
      userId: sellerOwnerId,
      title: `Order #${orderNumber}: ${statusUpper}`,
      body: `Customer order #${orderNumber} is now marked as ${statusUpper}.`,
      type: 'INFO',
      priority: 'MEDIUM',
      module: 'ERP',
      link: `/seller/orders`,
      tx: db
    });
  }

  // 3. Notify Reseller
  if (resellerId) {
    await sendNotification({
      userId: resellerId,
      title: `Reseller Order #${orderNumber}: ${statusUpper}`,
      body: `Your customer order #${orderNumber} is now ${statusUpper}.`,
      type: statusUpper === 'DELIVERED' ? 'SUCCESS' : 'INFO',
      priority: statusUpper === 'DELIVERED' ? 'HIGH' : 'MEDIUM',
      module: 'WALLET',
      link: `/reseller/orders`,
      tx: db
    });
  }

  // 4. Notify Delivery Driver
  if (deliveryManId && statusUpper === 'ASSIGNED') {
    await sendNotification({
      userId: deliveryManId,
      title: `New Delivery Assignment! 🚴`,
      body: `You have been assigned order #${orderNumber}. Tap to view task details.`,
      type: 'INFO',
      priority: 'HIGH',
      module: 'DELIVERY',
      link: `/delivery`,
      tx: db
    });
  }
}
