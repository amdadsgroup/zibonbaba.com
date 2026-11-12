# Color Palette Guide - Zibonbaba.com

This document establishes the color palette tokens to be used across CSS variables, Tailwind configurations, and design systems.

## 1. Core Palette Tokens

### Primary Yellow (Brand Accent)
The primary identifier of the brand, symbolizing warmth, speed, and premium service.
* **Primary Brand Yellow**: `#FFC107` / `hsl(45, 100%, 51%)`
  * Use: Core highlights, active navigation markers, interactive buttons, loader animations.
* **Alternative Accent Yellow**: `#FFB800` / `hsl(43, 100%, 50%)`
  * Use: High-converting CTA buttons, promo highlights, prices.
* **Dark Brand Yellow (Hover state)**: `#E0A800` / `hsl(45, 100%, 44%)`

### Neutral Light (Canvas & Backgrounds)
Maintains the clean, open, white-space focus of Zibonbaba.
* **Pure White**: `#FFFFFF` / `hsl(0, 0%, 100%)`
  * Use: Main page backgrounds, cards, navigation panels, content panels.
* **Alternative Light Gray**: `#F8F9FA` / `hsl(210, 17%, 98%)`
  * Use: Page shell backgrounds, inactive input boxes, borders.
* **Border Gray**: `#E5E7EB` / `hsl(220, 13%, 91%)`
  * Use: Dividers, card borders, form outlines.

### Neutral Dark (Text & SaaS Interfaces)
Ensures high readability and professional layout.
* **Charcoal Slate**: `#1F2937` / `hsl(215, 28%, 17%)`
  * Use: Main headings, system sidebars, primary text, buttons labels.
* **Body Gray**: `#4B5563` / `hsl(215, 16%, 34%)`
  * Use: Standard body text, descriptive labels, secondary headers.
* **Muted Gray**: `#9CA3AF` / `hsl(218, 11%, 65%)`
  * Use: Input placeholders, breadcrumbs, helper footnotes.

---

## 2. Semantic & Alert Colors
Colors indicating status must meet accessibility contrast requirements (WCAG 2.1 AA) when paired with dark text:

* **Success Green**: `#22C55E` / `hsl(142, 70%, 45%)`
  * Use: Active indicators, completed orders, successful transactions, stock additions.
* **Warning Orange**: `#F59E0B` / `hsl(38, 92%, 50%)`
  * Use: Low stock notices, pending items, offline status alerts.
* **Error Red**: `#EF4444` / `hsl(0, 84%, 60%)`
  * Use: Cancelled orders, transaction declines, deleted records, stock depletions, security warnings.

---

## 3. Contrast Ratios & Accessibility Compliance
To remain inclusive, all text elements on light backgrounds must comply with the following targets:
* **Large Text (18px+ Bold)**: Minimum contrast ratio of **3:1** against `#FFFFFF`.
* **Standard Body Text**: Minimum contrast ratio of **4.5:1** against `#FFFFFF`.
* **Yellow Highlights**: When using `#FFC107` as a background for primary buttons, text must be a dark slate `#1F2937` (contrast ratio of ~4.8:1). Do not use white text on a yellow background to prevent contrast failures.
* **Dark Themes**: Sidebars and headers using `#1F2937` will use `#FFFFFF` or `#FFC107` text overlays.
