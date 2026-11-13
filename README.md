# 🛍️ Zibonbaba.com — Enterprise Multi-Vendor E-Commerce & SaaS ERP Platform

[![Production Status](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=vercel)](https://zibonbaba.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2017-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

**Zibonbaba.com** is a production-grade, multi-vendor e-commerce marketplace and SaaS enterprise resource planning (ERP & POS) platform built for Bangladesh (a "Daraz-style" ecosystem). It connects shoppers, merchant vendors, independent resellers, delivery couriers, and platform administrators through a real-time, event-driven architecture.

---

## 🌐 Live Production Deployments

* **Live Marketplace URL**: [https://zibonbaba.vercel.app](https://zibonbaba.vercel.app)
* **Target Custom Domain**: [https://zibonbaba.com](https://zibonbaba.com)
* **Vercel Project Dashboard**: [vercel.com/amdadsgroup-4131/zibonbaba](https://vercel.com/amdadsgroup-4131/zibonbaba)
* **Supabase Cloud Database**: PostgreSQL 17 cluster (Seoul region `ap-northeast-2`)

---

## 🧩 Core Ecosystem Subsystems

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    ZIBONBABA.COM                       │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
          ┌───────────────────────┬───────────────────────┼───────────────────────┬───────────────────────┐
          ▼                       ▼                       ▼                       ▼                       ▼
  🛒 Shopper Portal       🏪 Vendor ERP & POS    📦 Reseller Dropship     🚴 Courier Logistics    🛡️ Admin & Superadmin
  • Responsive Storefront • POS Cashier Grid      • Custom Margins        • Rider Availability    • 22 Unified Modules
  • Native Mobile PWA     • Barcode Scanning      • Order Forwarding      • OTP Handover Verify   • Vendor KYC Approval
  • 64-District Checkout  • Multi-Warehouse Sync  • Commission Wallet     • Parcel Hub Dispatch   • Commission Engine
  • Live Order Tracker    • Staff Permissions     • Payout Withdrawals    • Rider Earnings Wallet • RBAC Role Matrix
```

### 1. Customer Marketplace Storefront (`frontend/src/app`)
* **Dynamic Search & Filtering**: Multi-attribute filtering (Brand, Rating, Price Slider, In-Stock, Category Hierarchy).
* **Multi-Vendor Cart & Checkout**: Automatic per-store cart grouping, local tax (5% VAT), and dynamic shipping fee calculations across all 64 districts of Bangladesh.
* **Native Mobile PWA Experience**: Auto-detects mobile devices to render a native app experience with bottom navigation (`Home`, `Categories`, `Cart`, `Orders`, `Account`).
* **Live Shipment Tracking**: 5-step visual tracking roadmap from order placement to final courier handover.

### 2. Vendor SaaS ERP & Point of Sale (`frontend/src/app/erp`)
* **POS Cashier Register**: Fast barcode scanning, customer loyalty linking, automated discount engine, and instant receipt printing.
* **Multi-Warehouse & Branch Inventory**: Real-time stock reservation upon sale, inter-branch stock transfers, and automated reorder threshold alerts.
* **Supplier & Expense Ledgers**: Vendor purchase orders, supplier profiles, and operational expense tracking.

### 3. Reseller & Dropshipping Hub (`frontend/src/app/reseller`)
* **Margin Pricing Engine**: Resellers set custom retail prices above wholesale vendor prices.
* **Escrow Commission Settlement**: Once customer delivery is verified via OTP, reseller profit is automatically credited to their wallet.

### 4. Delivery & Courier Logistics (`frontend/src/app/delivery`)
* **Rider Task View**: Availability duty toggle (Online/Offline), turn-by-turn customer address routing, and customer calling shortcuts.
* **OTP Handover Verification**: Secure customer-received SMS OTP required to transition orders to `DELIVERED` status and release escrow.
* **Hub Routing**: District hub receiving and bulk rider parcel assignments (`/api/hubs`).

### 5. Unified Admin Console (`frontend/src/app/admin`, `/superadmin`)
* **22 Enterprise Modules**: Products, Orders, KYC Approvals, Resellers, Logistics, Inventory, Finance, HRM, Audit Logs, and AI Forecasting.
* **Role-Based Access Control (RBAC)**: Fine-grained permissions across 14 platform roles.

---

## 📁 Repository Directory Structure

```
Zibonbaba.com/
├── frontend/                     # Primary Full-Stack Application (Next.js 15)
│   ├── prisma/                   # PostgreSQL schema & migration history
│   │   ├── schema.prisma         # 48 relational data models
│   │   └── seed.ts               # Complete system seed dataset
│   ├── public/                   # Static assets, PWA manifests, icons
│   ├── scripts/                  # Diagnostics, verification & audit tools
│   │   └── archive/              # Archived migration batch payloads
│   ├── src/
│   │   ├── app/                  # Next.js App Router (Storefront, Portals & APIs)
│   │   │   ├── (storefront)/     # Customer pages (cart, checkout, product, tracking)
│   │   │   ├── admin/            # 22-module Admin dashboard
│   │   │   ├── api/              # RESTful API route handlers
│   │   │   ├── delivery/         # Courier delivery rider interface
│   │   │   ├── erp/              # Vendor SaaS ERP & POS register
│   │   │   ├── reseller/         # Reseller dropshipping dashboard
│   │   │   ├── seller/           # Merchant store management portal
│   │   │   └── superadmin/       # Platform superadmin governance
│   │   ├── components/           # Reusable UI & mobile-first components
│   │   ├── hooks/                # Custom React hooks (usePlatformSync, useIsMobile)
│   │   ├── lib/                  # Core services, auth, state machine, rate limits
│   │   ├── store/                # Global state store (Zustand useStore)
│   │   └── utils/                # Localization (EN/BN) and helpers
│   ├── next.config.ts            # Security headers, rewrites & image domains
│   ├── package.json              # Frontend scripts & dependencies
│   └── vercel.json               # Vercel build command specifications
│
├── backend/                      # Optional Standalone Microservice (Express.js)
│   ├── prisma/                   # Backend database models
│   ├── scripts/                  # Standalone maintenance scripts
│   ├── src/
│   │   ├── server.ts             # Express & WebSocket monolithic server (~3000 lines)
│   │   └── tests/                # System integration test suites
│   ├── Dockerfile                # Backend container definition
│   └── package.json              # Backend scripts & dependencies
│
├── docs/                         # Platform Documentation & Specifications
│   ├── accounts/                 # Seed accounts & default credentials
│   ├── prompts/                  # System prompts & UX architecture briefs
│   ├── proposals/                # Client proposals & platform specification PDFs/DOCXs
│   ├── 01_prd.md                 # Product Requirement Document (PRD)
│   ├── 07_database_schema.md     # Relational database schema reference
│   ├── 08_api_documentation.md   # API endpoint catalog & request/response specs
│   └── 10_development_roadmap.md # Development milestones & delivery roadmap
│
├── .gitignore                    # Root Git ignore rules
├── DEPLOYMENT_GUIDE.md           # Production launch, domain mapping & security checklist
├── docker-compose.yml            # Local PostgreSQL, Backend & Frontend multi-container
├── mcp_config.json               # MCP server integrations config
├── package.json                  # Root monorepo workspace task runner
└── README.md                     # Project master documentation
```

---

## 👥 Demo Accounts & Roles

All demo accounts use password: `Password123!`

| Role Type | Email / Username | Direct Portal URL |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Platform Admin** | `admin@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Operations Manager** | `manager@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Senior Accountant** | `accountant@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Customer Support** | `support@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Marketing Lead** | `marketing@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Warehouse Manager** | `warehouse@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Inventory Manager** | `inventory@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Delivery Manager** | `delivery@zibonbaba.com` | [`/admin/login`](https://zibonbaba.vercel.app/admin/login) |
| **Merchant Store Owner** | `vendor@zibonbaba.com` | [`/seller/login`](https://zibonbaba.vercel.app/seller/login) |
| **Seller Store Staff** | `staff@zibonbaba.com` | [`/seller/login`](https://zibonbaba.vercel.app/seller/login) |
| **End Shopper / Customer** | `customer@zibonbaba.com` | [`/customer/login`](https://zibonbaba.vercel.app/customer/login) |
| **Reseller PRO** | `reseller@zibonbaba.com` | [`/reseller`](https://zibonbaba.vercel.app/reseller) |
| **Delivery Courier (Rider)**| `courier@zibonbaba.com` | [`/delivery`](https://zibonbaba.vercel.app/delivery) |

---

## 🚀 Quick Start & Development

### 1. Prerequisites
* **Node.js**: `v20.x` or `v24.x`
* **npm** or **pnpm**
* **PostgreSQL** instance or active Supabase project

### 2. Setup Environment
In `frontend/`:
```bash
cp .env.example .env.local
```
Fill in your database connection string and Supabase credentials.

### 3. Run the Next.js Frontend (Full-Stack Mode)
```bash
cd frontend
npm install
npm run build    # Generates Prisma client and compiles Next.js
npm run dev      # Starts local development server on http://localhost:3000
```

### 4. Optional: Run Backend Microservice
```bash
cd backend
npm install
npm run dev      # Starts Express & WebSocket server on http://localhost:5000
```

### 5. Multi-Container Docker Environment
```bash
docker-compose up -d
```

---

## 🔒 Security Hardening

* **Sliding-Window Rate Limiting**: Dynamic IP rate-limiting applied across `/api/auth/*`, `/api/orders`, and `/api/payments/*`.
* **Idempotency Protection**: 15-second collision window preventing duplicate charges or accidental double checkout clicks.
* **HTTP Security Headers**: HSTS (`max-age=63072000`), X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`), Referrer-Policy, and Permissions-Policy configured in `next.config.ts`.
* **Outbox Event Consistency**: Transactional `OutboxEvent` table decouples business events from asynchronous notification deliveries and inventory deductions.

---

## 📄 License & Ownership

Copyright © 2026 Zibonbaba.com. All Rights Reserved.  
Proprietary multi-vendor e-commerce and SaaS ERP platform.
