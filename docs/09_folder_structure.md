# Project Folder Structure - Zibonbaba.com

This document describes the directories and file patterns inside the Zibonbaba monorepo workspace.

## 1. Directory Tree Overview

```
Zibonbaba.com/
├── docs/                             # Architecture and Design manuals
│   ├── 01_prd.md
│   ├── 02_ui_ux_design_system.md
│   ├── ...
├── frontend/                         # Next.js 15 Client Project
│   ├── src/
│   │   ├── app/                      # Next.js App Router Page modules
│   │   │   ├── layout.tsx            # HTML Root wrapper and body tag
│   │   │   ├── globals.css           # Tailwind custom imports and root utilities
│   │   │   ├── page.tsx              # E-commerce Homepage
│   │   │   ├── product/
│   │   │   │   ├── page.tsx          # Product listing with filters
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Product detailed specifications page
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          # Shopping cart overview
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx          # Payment process checkouts
│   │   │   ├── tracking/
│   │   │   │   └── page.tsx          # Live delivery milestone page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Customer dashboard base
│   │   │   ├── vendor/
│   │   │   │   └── page.tsx          # Vendor dashboard base
│   │   │   ├── admin/
│   │   │   │   └── page.tsx          # Admin dashboard base
│   │   │   └── erp/
│   │   │       ├── page.tsx          # ERP Home
│   │   │       └── pos/
│   │   │           └── page.tsx      # POS Interface page
│   │   ├── components/               # Custom UI Component Library
│   │   │   ├── ui/                   # Modular blocks: Buttons, Inputs, Dialogs
│   │   │   ├── navbar.tsx            # Sticky premium navbar
│   │   │   ├── mega-menu.tsx         # Categories navigation dropdown
│   │   │   ├── product-card.tsx      # Product thumbnail display item
│   │   │   └── footer.tsx            # Structured customer footer
│   │   ├── store/
│   │   │   └── useStore.ts           # State machine (Zustand) for Cart, Wishlist, Auth
│   │   └── types/
│   │       └── index.ts              # Common interfaces
│   ├── tailwind.config.ts            # Palette mappings & style setups
│   ├── next.config.ts                # Next.js options
│   ├── tsconfig.json                 # TypeScript rules
│   └── package.json                  # Next dependencies
└── backend/                          # Express.js API project
    ├── prisma/
    │   └── schema.prisma             # DB schemas definition
    ├── src/
    │   ├── server.ts                 # Main startup file
    │   ├── controllers/              # Request handlers
    │   ├── middlewares/              # JWT validations and RBAC checks
    │   ├── routes/                   # Routing configuration
    │   └── utils/                    # Password crypt, string helpers
    ├── tsconfig.json                 # TypeScript rules
    └── package.json                  # Node backend packages
```

---

## 2. File Guidelines

* **Page Routing**: The Next.js client uses file-based app routing. Folders inside `src/app/` correspond to browser URLs. Dynamic routes are represented with brackets `[id]`.
* **State Management**: `frontend/src/store/` contains Zustand slices to manage cross-component parameters like the shopping cart status, user profile details, and active POS items.
* **Database Access**: `backend/prisma/` specifies database connections, models, and migrations, translating schemas automatically into Javascript/TypeScript clients.
