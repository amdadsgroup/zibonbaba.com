/**
 * Centralized State Machine for Zibonbaba.com
 * Validates legal state transitions for Orders and Delivery Assignments.
 */

import { OrderStatus, DeliveryStatus } from '@/lib/constants/roles';

// Legal transition map for Orders
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.READY_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
  [OrderStatus.FAILED]: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.RETURNED, OrderStatus.CANCELLED],
  [OrderStatus.RETURNED]: [],
  [OrderStatus.CANCELLED]: []
};

// Legal transition map for Delivery Assignments
export const DELIVERY_TRANSITIONS: Record<string, string[]> = {
  [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ACCEPTED, DeliveryStatus.REJECTED],
  [DeliveryStatus.ACCEPTED]: [DeliveryStatus.PICKED_UP, DeliveryStatus.REJECTED],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.FAILED],
  [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED, DeliveryStatus.RETURNED],
  [DeliveryStatus.FAILED]: [DeliveryStatus.IN_TRANSIT, DeliveryStatus.RETURNED],
  [DeliveryStatus.RETURNED]: [],
  [DeliveryStatus.REJECTED]: [DeliveryStatus.ASSIGNED],
  [DeliveryStatus.DELIVERED]: []
};

/**
 * Validates if an Order status transition is legally permitted.
 */
export function isValidOrderTransition(currentStatus: string, targetStatus: string): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = ORDER_TRANSITIONS[currentStatus.toUpperCase()];
  return Boolean(allowed && allowed.includes(targetStatus.toUpperCase()));
}

/**
 * Validates if a Delivery status transition is legally permitted.
 */
export function isValidDeliveryTransition(currentStatus: string, targetStatus: string): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = DELIVERY_TRANSITIONS[currentStatus.toUpperCase()];
  return Boolean(allowed && allowed.includes(targetStatus.toUpperCase()));
}

/**
 * Maps a Delivery Assignment status to the corresponding Order status.
 */
export function mapDeliveryToOrderStatus(deliveryStatus: string): string {
  switch (deliveryStatus.toUpperCase()) {
    case DeliveryStatus.ACCEPTED:
      return OrderStatus.PROCESSING;
    case DeliveryStatus.PICKED_UP:
    case DeliveryStatus.IN_TRANSIT:
      return OrderStatus.SHIPPED;
    case DeliveryStatus.DELIVERED:
      return OrderStatus.DELIVERED;
    case DeliveryStatus.FAILED:
      return OrderStatus.PROCESSING;
    case DeliveryStatus.RETURNED:
      return OrderStatus.CANCELLED;
    default:
      return OrderStatus.PROCESSING;
  }
}
