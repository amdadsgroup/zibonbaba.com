# 🚀 Zibonbaba.com — Production Launch & Operations Guide

This guide documents the final production configuration, domain mapping, security checklist, and external merchant integrations for **Zibonbaba.com**.

---

## 🌐 1. Live Domains & Endpoints

| Environment | URL | Status | Description |
| :--- | :--- | :--- | :--- |
| **Public Production Domain** | [https://zibonbaba.com](https://zibonbaba.com) | Target | Final brand domain with canonical SEO & SSL |
| **Vercel Production Staging** | [https://zibonbaba.vercel.app](https://zibonbaba.vercel.app) | Live Active | Continuous deployment from main repository |
| **Vercel Dashboard** | [vercel.com/amdadsgroup-4131/zibonbaba](https://vercel.com/amdadsgroup-4131/zibonbaba) | Active | Hosting, environment secrets & deployment management (Project ID: `prj_ZpUJIQ3Xnv477mBNIIo9x2Saqpnh`) |
| **Vercel Deployment URL** | [https://zibonbaba-x1k7cqrem-amdadsgroup-4131.vercel.app](https://zibonbaba-x1k7cqrem-amdadsgroup-4131.vercel.app) | Live Active | Immutable production deployment build |
| **Supabase Cloud Database** | [ikocqacatdvhrameqeox.supabase.co](https://ikocqacatdvhrameqeox.supabase.co) | Active Healthy | PostgreSQL 17 cluster (Seoul region `ap-northeast-2`) |

---

## 🔒 2. Security Hardening Completed (P0 Resolved)

1. **Password Reset Token Protection**:
   - Eliminated raw `resetToken` exposure from the `/api/auth/forgot-password` JSON response.
   - Generated tokens now expire after a strict 15-minute window and are dispatched exclusively via encrypted private email/SMS.
   - Generic success messages are returned to prevent user/email enumeration.
2. **API Sliding-Window Rate Limiting**:
   - Implemented [`rateLimit.ts`](file:///d:/Startup/Zibonbaba.com/frontend/src/lib/rateLimit.ts) across sensitive endpoints:
     - `/api/auth/login` (10 requests/min per IP, with 5-attempt account lockout for 15 minutes)
     - `/api/auth/register` (5 registrations/min per IP)
     - `/api/auth/forgot-password` (5 requests/min per IP)
     - `/api/auth/reset-password` (5 requests/min per IP)
     - `/api/orders` (15 requests/min per IP)
     - `/api/payments/initiate` (10 requests/min per IP)
3. **Double-Order Idempotency Engine**:
   - Order submission guards against duplicate charges/clicks within a 15-second collision window for the same cart and buyer.
4. **HTTP Security Headers Configured**:
   - Set in [`next.config.ts`](file:///d:/Startup/Zibonbaba.com/frontend/next.config.ts): HSTS (Strict-Transport-Security), X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Referrer-Policy, and Permissions-Policy.

---

## 💳 3. Payment Gateway Architecture

Integrated via [`paymentService.ts`](file:///d:/Startup/Zibonbaba.com/frontend/src/lib/services/paymentService.ts):

* **Cash on Delivery (COD)**:
  - Immediate order confirmation with phone verification requirement and traceable transaction IDs (`TRX-XXXXXXXX-TIMESTAMP-XXXX`).
* **SSLCommerz (Aggregator for Visa, Mastercard, bKash, Nagad, Rocket, Upay, Cards)**:
  - Supports sandbox and live gateway URLs (`PAYMENT_SANDBOX=false`).
  - IPN callback handler at `/api/payments/callback/sslcommerz` validates status and automatically transitions orders to `CONFIRMED`.
* **bKash Direct Checkout API**:
  - Direct tokenized checkout and verification handler at `/api/payments/callback/bkash`.

---

## 📱 4. Transactional SMS & Email Communication

Integrated via [`communicationService.ts`](file:///d:/Startup/Zibonbaba.com/frontend/src/lib/services/communicationService.ts):

* **Email**: Resend API / SendGrid API / SMTP / Mock fallback.
* **SMS**: Greenweb Bangladesh SMS Gateway (`GREENWEB_SMS_TOKEN`) / Twilio / Mock fallback.
* Automated notification triggers:
  - Password Reset Email
  - Customer Order Confirmation (Email + SMS)
  - OTP Handover SMS for Delivery Couriers

---

## 📜 5. Legal & Regulatory Compliance Pages

Created full, responsive, branded compliance pages:

* [`/privacy-policy`](https://zibonbaba.com/privacy-policy) — Data collection, cookies & Bangladesh Digital Security Act compliance.
* [`/terms`](https://zibonbaba.com/terms) — Marketplace buyer, merchant, and reseller terms.
* [`/return-policy`](https://zibonbaba.com/return-policy) — Category-specific return windows (7-day physical, 24h cosmetic, non-returnable digital).
* [`/delivery-policy`](https://zibonbaba.com/delivery-policy) — Nationwide delivery windows and charges across all 64 districts.
* [`/payment-policy`](https://zibonbaba.com/payment-policy) — Payment security, COD rules, and card encryption standards.
* [`/cancellation-policy`](https://zibonbaba.com/cancellation-policy) — Order cancellation windows prior to dispatch.
* [`/seller-agreement`](https://zibonbaba.com/seller-agreement) — Vendor obligations, commission structures, and weekly payout cycles.
* [`/contact`](https://zibonbaba.com/contact) — Official headquarters address in Gulshan Dhaka, helpline `+880 9612-ZIBONBABA`, and inquiry desk.

All bottom links in [`footer.tsx`](file:///d:/Startup/Zibonbaba.com/frontend/src/components/footer.tsx) connect directly to these pages.

---

## 🔍 6. SEO & Crawler Indexing

* **Robots Configuration**: [`robots.ts`](file:///d:/Startup/Zibonbaba.com/frontend/src/app/robots.ts) exposes public catalog, categories, and stores, while barring private portals (`/admin/`, `/seller/`, `/api/`).
* **Dynamic Sitemap**: [`sitemap.ts`](file:///d:/Startup/Zibonbaba.com/frontend/src/app/sitemap.ts) queries the live Prisma database for published products, categories, and approved stores using canonical `https://zibonbaba.com`.

---

## 🩺 7. System Health Diagnostic Endpoint

Admins can inspect the overall platform health at:  
`GET /api/admin/system-health` (requires Admin JWT authorization)

Monitors:
* Database connection latency in milliseconds.
* User, Order, Product, and Store metrics.
* Unassigned orders awaiting courier delivery.
* Pending seller KYC verification requests.
* Pending withdrawal payouts.
* Security status (checks if JWT secret is hardened).

---

## 🛠️ 8. Steps to Point Custom Domain (`zibonbaba.com`)

1. **In Vercel**:
   - Go to **Project Settings $\rightarrow$ Domains**.
   - Enter `zibonbaba.com` and `www.zibonbaba.com`.
2. **In your DNS Provider (Namecheap, GoDaddy, Cloudflare, etc.)**:
   - **Type A**: Host `@` $\rightarrow$ Value `76.76.21.21`
   - **Type CNAME**: Host `www` $\rightarrow$ Value `cname.vercel-dns.com`
3. **Rotate Production Secrets in Vercel Environment Variables**:
   - Set `JWT_SECRET` to a 64-character random string (`openssl rand -base64 48`).
   - Set `NEXT_PUBLIC_BASE_URL` to `https://zibonbaba.com`.
   - Set `PAYMENT_SANDBOX` to `false` when merchant accounts are activated.
