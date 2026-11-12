# API Documentation - Zibonbaba.com

This document specifies the REST API endpoints, request bodies, success outputs, and authorization scopes for the Zibonbaba platform.

## 1. Authentication & Session Services
All user operations require authorization. We use Bearer JWT headers: `Authorization: Bearer <token>`.

### 1.1 User Login
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "vendor@zibonbaba.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJjNj...",
    "user": {
      "id": "a9b8c7-...",
      "role": "VENDOR_ADMIN",
      "email": "vendor@zibonbaba.com"
    }
  }
  ```

---

## 2. Storefront Catalog & Orders

### 2.1 Get Products (Filtered Search)
* **Method**: `GET`
* **Path**: `/api/products`
* **Query Parameters**:
  * `query`: string (search term)
  * `category`: string (category ID)
  * `minPrice`: number
  * `maxPrice`: number
  * `rating`: number
* **Success Response (200 OK)**:
  ```json
  {
    "products": [
      {
        "id": "e8d7-...",
        "name": "Wireless Noise-Cancelling Headphones Pro",
        "basePrice": 149.00,
        "rating": 4.8,
        "variants": [
          { "id": "v1", "sku": "HP-PRO-WHT", "attributes": { "color": "White" } }
        ]
      }
    ]
  }
  ```

### 2.2 Place Order (Cart Checkout)
* **Method**: `POST`
* **Path**: `/api/orders`
* **Headers**: `Authorization: Bearer <CustomerJWT>`
* **Request Body**:
  ```json
  {
    "items": [
      { "variantId": "v1", "quantity": 1 }
    ],
    "shippingAddress": "123 Main St, Sector 4, Dhaka",
    "paymentMethod": "CARD"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "orderId": "ord-982103",
    "status": "PENDING",
    "total": 149.00
  }
  ```

---

## 3. SaaS ERP & POS (Vendor Scopes)

### 3.1 Fetch Inventory Stock
* **Method**: `GET`
* **Path**: `/api/erp/inventory`
* **Headers**: `Authorization: Bearer <VendorJWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "stock": [
      {
        "sku": "HP-PRO-WHT",
        "productName": "Wireless Headphones",
        "quantity": 4,
        "reorderPoint": 10,
        "warehouse": "Warehouse A",
        "branch": "Dhanmondi Branch"
      }
    ]
  }
  ```

### 3.2 Process POS Order
* **Method**: `POST`
* **Path**: `/api/erp/pos/checkout`
* **Headers**: `Authorization: Bearer <VendorJWT>`
* **Request Body**:
  ```json
  {
    "branchId": "br-dhanmondi",
    "items": [
      { "variantId": "v1", "quantity": 2, "price": 149.00 }
    ],
    "discount": 10.00,
    "paymentMethod": "CASH",
    "amountPaid": 300.00
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "receiptId": "rec-pos-092813",
    "total": 288.00,
    "changeDue": 12.00,
    "timestamp": "2026-07-14T01:45:38Z"
  }
  ```

---

## 4. AI Services

### 4.1 Get AI Inventory Forecast
* **Method**: `GET`
* **Path**: `/api/ai/inventory-forecast`
* **Headers**: `Authorization: Bearer <VendorJWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "sku": "HP-PRO-WHT",
    "forecast": [
      { "month": "Jul 2026", "projectedSales": 120, "confidenceInterval": "92%" },
      { "month": "Aug 2026", "projectedSales": 145, "confidenceInterval": "89%" }
    ],
    "recommendedReorderQty": 150,
    "daysToDepletion": 12
  }
  ```
