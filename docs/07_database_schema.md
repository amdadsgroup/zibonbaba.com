# Database Schema Architecture - Zibonbaba.com

This document describes the PostgreSQL database schema modeled for the multi-vendor e-commerce marketplace and SaaS ERP business management software.

## 1. Entity Relationship Overview
The database uses Prisma ORM to map relational tables. The main blocks of the system include:
1. **User & Auth Context**: `User`, `Profile`, `Session`, `ActivityLog`.
2. **Storefront & Marketplace**: `Store` (Vendor), `Product`, `ProductVariant`, `Category`, `Review`.
3. **Inventory & Warehouse**: `Warehouse`, `Inventory`, `StockMovement`, `Branch`.
4. **Order Management & Transactions**: `Order`, `OrderItem`, `Transaction`, `Payment`.
5. **ERP & POS Operations**: `POSSession`, `Customer`, `Supplier`, `PurchaseOrder`, `Expense`.
6. **AI Intelligence Modules**: `RecommendationCache`, `StockForecast`.

---

## 2. Table Specifications

### 2.1 User Table (Core Auth)
Stores login credentials, roles, and profiles.
* `id`: `UUID` (Primary Key)
* `email`: `VARCHAR(100)` (Unique, Indexed)
* `passwordHash`: `VARCHAR(255)`
* `role`: `ENUM('CUSTOMER', 'VENDOR_STAFF', 'VENDOR_ADMIN', 'ADMIN')`
* `status`: `ENUM('ACTIVE', 'PENDING', 'SUSPENDED')`
* `createdAt`: `TIMESTAMP` (Default `NOW()`)

### 2.2 Store Table (Vendors)
Stores vendor shop identities and platform configurations.
* `id`: `UUID` (Primary Key)
* `name`: `VARCHAR(100)` (Unique)
* `logo`: `VARCHAR(255)`
* `banner`: `VARCHAR(255)`
* `commissionRate`: `DECIMAL(5, 2)` (Default `10.00`)
* `ownerId`: `UUID` (Foreign Key -> `User.id`)
* `isApproved`: `BOOLEAN` (Default `false`)

### 2.3 Product & Variant Tables
Supports multi-attribute items (e.g. Size, Color).
* **Product Table**:
  * `id`: `UUID` (Primary Key)
  * `storeId`: `UUID` (Foreign Key -> `Store.id`, Indexed)
  * `categoryId`: `UUID` (Foreign Key -> `Category.id`, Indexed)
  * `name`: `VARCHAR(255)`
  * `description`: `TEXT`
  * `basePrice`: `DECIMAL(12, 2)`
  * `status`: `ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')`
* **ProductVariant Table**:
  * `id`: `UUID` (Primary Key)
  * `productId`: `UUID` (Foreign Key -> `Product.id`, Cascade Delete)
  * `sku`: `VARCHAR(100)` (Unique, Indexed)
  * `attributes`: `JSONB` (e.g. `{"color": "Red", "size": "XL"}`)
  * `priceAdjustment`: `DECIMAL(12, 2)` (Default `0.00`)

### 2.4 Inventory Table
Tracks quantity levels across various warehouses and branches.
* `id`: `UUID` (Primary Key)
* `variantId`: `UUID` (Foreign Key -> `ProductVariant.id`)
* `warehouseId`: `UUID` (Foreign Key -> `Warehouse.id`)
* `branchId`: `UUID` (Foreign Key -> `Branch.id`)
* `quantity`: `INTEGER` (Default `0`)
* `reorderPoint`: `INTEGER` (Default `10`)

### 2.5 Orders & OrderItems Tables
Tracks marketplace and POS purchases.
* **Order Table**:
  * `id`: `UUID` (Primary Key)
  * `customerId`: `UUID` (Foreign Key -> `User.id`, Nullable for Guest POS checkouts)
  * `storeId`: `UUID` (Foreign Key -> `Store.id`)
  * `branchId`: `UUID` (Foreign Key -> `Branch.id`, Nullable for online sales)
  * `source`: `ENUM('ONLINE', 'POS')`
  * `subTotal`: `DECIMAL(12, 2)`
  * `tax`: `DECIMAL(12, 2)`
  * `discount`: `DECIMAL(12, 2)`
  * `total`: `DECIMAL(12, 2)`
  * `status`: `ENUM('PENDING', 'PROCESSING', 'DISPATCHED', 'SHIPPED', 'DELIVERED', 'CANCELLED')`
* **OrderItem Table**:
  * `id`: `UUID` (Primary Key)
  * `orderId`: `UUID` (Foreign Key -> `Order.id`)
  * `variantId`: `UUID` (Foreign Key -> `ProductVariant.id`)
  * `quantity`: `INTEGER`
  * `price`: `DECIMAL(12, 2)`

---

## 3. Database Performance Indexes
To maintain sub-second latency under high loads, the database schema implements these index rules:
1. `CREATE INDEX idx_product_store_cat ON "Product" ("storeId", "categoryId");`
2. `CREATE INDEX idx_inventory_variant_warehouse ON "Inventory" ("variantId", "warehouseId");`
3. `CREATE INDEX idx_order_customer_store ON "Order" ("customerId", "storeId");`
4. `CREATE INDEX idx_sku_lookup ON "ProductVariant" ("sku");`
5. `CREATE INDEX idx_audit_log_timestamp ON "AuditLog" ("createdAt" DESC);`
