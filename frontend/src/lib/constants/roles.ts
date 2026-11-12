/**
 * Centralized Roles, Permissions & Status Enums for Zibonbaba.com
 * Single Source of Truth across Customer, Seller, Reseller, Delivery, and Admin portals.
 */

// User Roles
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  MARKETING = 'MARKETING',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  DELIVERY_MANAGER = 'DELIVERY_MANAGER',
  VENDOR_ADMIN = 'VENDOR_ADMIN',
  VENDOR_STAFF = 'VENDOR_STAFF',
  CUSTOMER = 'CUSTOMER',
  RESELLER = 'RESELLER',
  DELIVERY_MAN = 'DELIVERY_MAN'
}

// User Account Statuses
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
  DEACTIVATED = 'DEACTIVATED'
}

// Product Lifecycle Statuses
export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ARCHIVED = 'ARCHIVED'
}

// Universal Order Statuses
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// Universal Delivery Assignment Statuses
export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED'
}

// Payment Statuses
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

// Wallet Transaction Types
export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

// Universal Withdrawal Request Statuses
export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

// Grouped Role Check Helpers
export const ADMIN_ROLES: string[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.ACCOUNTANT,
  UserRole.CUSTOMER_SUPPORT,
  UserRole.MARKETING,
  UserRole.WAREHOUSE_MANAGER,
  UserRole.INVENTORY_MANAGER,
  UserRole.DELIVERY_MANAGER
];

export const SELLER_ROLES: string[] = [
  UserRole.VENDOR_ADMIN,
  UserRole.VENDOR_STAFF,
  'SELLER'
];

export const RESELLER_ROLES: string[] = [
  UserRole.RESELLER
];

export const DELIVERY_ROLES: string[] = [
  UserRole.DELIVERY_MAN,
  'DELIVERYMAN',
  'COURIER',
  UserRole.DELIVERY_MANAGER
];
