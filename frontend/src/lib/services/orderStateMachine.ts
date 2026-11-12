/**
 * Centralized Order State Machine & Role Permission Engine for Zibonbaba.com
 * Single source of truth for all order lifecycle transitions across portals.
 */

import { OrderStatus, DeliveryStatus, UserRole } from '@/lib/constants/roles';

// Legal Transition Graph
export const ORDER_TRANSITION_GRAPH: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.READY_FOR_DELIVERY, OrderStatus.ASSIGNED, OrderStatus.ACCEPTED, OrderStatus.SHIPPED, OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.ASSIGNED, OrderStatus.ACCEPTED, OrderStatus.PICKED_UP, OrderStatus.SHIPPED, OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]: [OrderStatus.ACCEPTED, DeliveryStatus.REJECTED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.ACCEPTED]: [OrderStatus.PICKED_UP, DeliveryStatus.REJECTED, OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.SHIPPED, OrderStatus.FAILED, OrderStatus.DELIVERED],
  [OrderStatus.SHIPPED]: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED],
  [OrderStatus.FAILED]: [OrderStatus.IN_TRANSIT, OrderStatus.PROCESSING, OrderStatus.READY_FOR_DELIVERY, OrderStatus.ASSIGNED, OrderStatus.RETURNED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED, OrderStatus.RETURNED],
  [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURNED, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: []
};

// Platform Admin Roles
const PLATFORM_ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'ACCOUNTANT',
  'CUSTOMER_SUPPORT',
  'WAREHOUSE_MANAGER',
  'INVENTORY_MANAGER',
  'DELIVERY_MANAGER'
];

// Seller Roles
const SELLER_ROLES = [
  'VENDOR_ADMIN',
  'VENDOR_STAFF',
  'SELLER',
  'VENDOR'
];

// Delivery Roles
const COURIER_ROLES = [
  'DELIVERY_MAN',
  'DELIVERYMAN',
  'COURIER',
  'RIDER'
];

export interface RolePermissionContext {
  role: string;
  userId: string;
  isCustomerOwner?: boolean;
  isSellerOwner?: boolean;
  isResellerOwner?: boolean;
  isAssignedCourier?: boolean;
}

/**
 * Validates if a transition is syntactically allowed in the state machine
 */
export function isValidOrderTransition(currentStatus: string, targetStatus: string): boolean {
  const current = (currentStatus || '').toUpperCase().trim();
  const target = (targetStatus || '').toUpperCase().trim();

  if (current === target) return true;
  const allowed = ORDER_TRANSITION_GRAPH[current];
  return Boolean(allowed && allowed.includes(target));
}

/**
 * Checks whether the user with the given context is authorized to perform this transition
 */
export function canUserPerformTransition(
  currentStatus: string,
  targetStatus: string,
  context: RolePermissionContext
): { allowed: boolean; reason?: string } {
  const current = (currentStatus || '').toUpperCase().trim();
  const target = (targetStatus || '').toUpperCase().trim();
  const role = (context.role || '').toUpperCase().trim();

  // 1. Validate basic transition graph
  if (!isValidOrderTransition(current, target)) {
    return {
      allowed: false,
      reason: `Illegal state transition from ${current} to ${target}.`
    };
  }

  // 2. Superadmin & Platform Admins have overarching operational authority
  if (PLATFORM_ADMIN_ROLES.includes(role)) {
    return { allowed: true };
  }

  // 3. Seller Permissions
  if (SELLER_ROLES.includes(role)) {
    if (!context.isSellerOwner) {
      return { allowed: false, reason: 'You can only update orders for your own store.' };
    }

    // Allowed seller transitions:
    // PENDING/CONFIRMED -> PROCESSING
    // PROCESSING -> READY_FOR_DELIVERY
    // PENDING/CONFIRMED/PROCESSING -> CANCELLED
    const allowedSellerTargets: Record<string, string[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.READY_FOR_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.CANCELLED]
    };

    const allowed = allowedSellerTargets[current]?.includes(target);
    if (allowed) return { allowed: true };

    return {
      allowed: false,
      reason: `Sellers are not permitted to transition orders from ${current} to ${target}.`
    };
  }

  // 4. Delivery Courier Permissions
  if (COURIER_ROLES.includes(role)) {
    if (!context.isAssignedCourier) {
      return { allowed: false, reason: 'You can only update delivery tasks assigned to you.' };
    }

    const allowedCourierTargets: Record<string, string[]> = {
      [OrderStatus.PROCESSING]: [OrderStatus.ACCEPTED, OrderStatus.PICKED_UP],
      [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.ACCEPTED, OrderStatus.PICKED_UP],
      [OrderStatus.ASSIGNED]: [OrderStatus.ACCEPTED, DeliveryStatus.REJECTED, OrderStatus.PICKED_UP],
      [OrderStatus.ACCEPTED]: [OrderStatus.PICKED_UP, DeliveryStatus.REJECTED, OrderStatus.IN_TRANSIT],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.SHIPPED, OrderStatus.FAILED, OrderStatus.DELIVERED],
      [OrderStatus.SHIPPED]: [OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED],
      [OrderStatus.FAILED]: [OrderStatus.IN_TRANSIT, OrderStatus.RETURNED]
    };

    const allowed = allowedCourierTargets[current]?.includes(target);
    if (allowed) return { allowed: true };

    return {
      allowed: false,
      reason: `Delivery couriers are not permitted to transition orders from ${current} to ${target}.`
    };
  }

  // 5. Customer Permissions
  if (role === 'CUSTOMER') {
    if (!context.isCustomerOwner) {
      return { allowed: false, reason: 'You can only manage your own orders.' };
    }

    // Customer can cancel early or request a return after delivery
    if ((current === OrderStatus.PENDING || current === OrderStatus.CONFIRMED) && target === OrderStatus.CANCELLED) {
      return { allowed: true };
    }
    if (current === OrderStatus.DELIVERED && target === OrderStatus.RETURN_REQUESTED) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Customers cannot transition order state from ${current} to ${target}.`
    };
  }

  // 6. Reseller Permissions
  if (role === 'RESELLER') {
    if (!context.isResellerOwner) {
      return { allowed: false, reason: 'You can only manage your own reseller orders.' };
    }

    // Reseller can cancel if order is still PENDING
    if (current === OrderStatus.PENDING && target === OrderStatus.CANCELLED) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Resellers cannot transition order state from ${current} to ${target}.`
    };
  }

  return {
    allowed: false,
    reason: `Role '${role}' does not have permission to execute this status update.`
  };
}
