# Security Architecture - Zibonbaba.com

This document outlines the security controls, data protection policies, and authentication mechanisms built into Zibonbaba.

## 1. Authentication & Session Strategy
* **Double-Token Design**:
  * **Access Token**: Short-lived (15 minutes) JSON Web Token (JWT) containing the user ID, role, and store ID. Passed in the HTTP `Authorization: Bearer <token>` header.
  * **Refresh Token**: Long-lived (7 days) UUID stored inside a secure, `HttpOnly`, `SameSite=Strict`, `Secure` cookie. Enables safe access token regeneration without forcing relogins.
* **Token Invalidation**: Redis keeps a blacklist of revoked tokens to handle immediate sign-outs or forced password updates.

---

## 2. Role-Based Access Control (RBAC) Hierarchy

The platform implements strict route validations based on the user's role:

| Scoped Role | Permitted Areas | Allowed Actions |
| :--- | :--- | :--- |
| **Customer** | Storefront, personal profile, cart, checkout | Read catalogs, write reviews, complete checkouts, view own orders |
| **Vendor Staff** | Scoped branches, selected POS registers, warehouses | Add sales, print receipts, adjust inventory quantities |
| **Vendor Admin** | Store settings, inventory management, CRM, team setup | Edit store info, manage personnel rights, review vendor sales graphs |
| **Platform Admin**| Platform control panel, audit logs, verification center| Approve store applications, set commission rates, deactivate users |

---

## 3. Threat Mitigation Controls

* **SQL Injection**: Parameterized SQL queries using Prisma ORM. Direct raw inputs are prohibited.
* **Cross-Site Scripting (XSS)**: Strict Content Security Policies (CSP), sanitizing HTML contents prior to display, and using framework sanitizers in Next.js.
* **Cross-Site Request Forgery (CSRF)**: Utilizing custom authentication headers for APIs and checking CORS policies strictly against verified domains.
* **API Rate Limiting**: Limit standard endpoints (e.g. login, product search) to 100 requests per minute per IP using Express rate limiters. High-frequency checkout paths are limited to 5 per minute per IP to prevent automated shopping bots.
* **Data Encryption**:
  * *At Rest*: PostgreSQL partitions are encrypted using AES-256. Passwords stored using `bcrypt` (work factor: 12).
  * *In Transit*: TLS 1.3 enforced for all browser connections.
