# Component Library Specification - Zibonbaba.com

This document specifies the exact component blueprints, states, properties, and design configurations for the Zibonbaba design library.

## 1. Navbars & Navigation

### 1.1 Sticky Header
* **Structure**: Top bar (system notice / language selector) + Main Navbar + Secondary Category bar.
* **Background**: Pure White (`#FFFFFF`) with `backdrop-filter: blur(12px)` and opacity `0.95`.
* **Left Section**: Brand Logo (`Zibonbaba` in bold dark charcoal with a premium yellow icon).
* **Center Section**: Search bar with dropdown category selector and yellow search button icon.
* **Right Section**: User account flyout trigger, Wishlist counter badge, Cart icon with quantity bubble.
* **Hover Interaction**: Hovering navigation links shows an underbar transition in brand yellow.

### 1.2 Mega Menu
* **Trigger**: Mouse hover on "Shop Categories" button.
* **Layout**: 4-column drop-down overlay.
  * *Column 1-3*: Category lists (e.g., Electronics, Fashion, Home & Kitchen) with bold headings and sub-category lists.
  * *Column 4*: Image promotional banner (yellow card with white text promoting current campaign).
* **Styling**: `shadow-lg`, rounded bottom-corners `16px`, transition timing `300ms ease`.

---

## 2. Card Components

### 2.1 Product Card
* **Elements**: Image container, Vendor link, Product title, Rating stars, Price Tag, and Quick-add button.
* **Visual States**:
  * *Default*: White card, border 1px gray (`#E5E7EB`), soft shadow.
  * *Hover*: 1px yellow accent border (`#FFC107`), hover-scale (`1.02`), yellow outline glow.
  * *Action*: Quick Add overlay button slides up from the card bottom.

### 2.2 Vendor Showcase Card
* **Elements**: Vendor banner, Circular vendor logo, Store name, Verification Badge, Rating/Review summary, and CTA link.
* **Visual Style**: Soft gray banner with glassmorphism logo badge overlay. Yellow border outline on hover.

---

## 3. Dashboard Widgets

### 3.1 Analytics Widget (Value Cards)
* **Elements**: Indicator icon (e.g. Dollar, Box, Users), Numeric total, Period comparator percentage (e.g., `+12.4% last week`), Mini-trend sparkline.
* **Colors**: White background, dark charcoal text. Success green for positive changes, error red for negative, yellow highlighting for primary indicators (e.g. pending items).

### 3.2 Live Charts (Recharts Layout)
* **Structure**: Line, Bar, or Area charts plotting monthly sales, orders, or visitor metrics.
* **Fill Colors**: Gradient transitions from Yellow `#FFB800` (opacity 0.4) fading to White, dark charcoal gridlines.

---

## 4. Tables & Data Management
* **Elements**: Table Header, Action menus, Search bar, Filters, Item Rows, Pagination.
* **Styling**: Large paddings, rounded corners, clean dividers. Hover states on row entries.
* **Status Badges**:
  * `Active`/`Approved`: Green border + light green background.
  * `Pending`: Yellow border + light yellow background.
  * `Cancelled`/`Suspended`: Red border + light red background.

---

## 5. POS Register & ERP Interface

### 5.1 POS Checkout Column
* **Left Panel (Product Grid)**: Fast select category filters, search input, quick select product grid.
* **Right Panel (Cart & Total)**: Item list with quantity selector, barcode number input, discount coupon field, tax calc line, Grand Total block, and a primary Yellow pay button.
* **States**: Empty state showing placeholder prompt; populated state listing total totals.
