# UI/UX Design System - Zibonbaba.com

## 1. Grid & Layout System
* **Desktop Breakpoint (1200px+)**: 12-column grid layout with 24px gutters and 80px margins.
* **Tablet Breakpoint (768px - 1024px)**: 8-column grid layout with 16px gutters and 32px margins.
* **Mobile Breakpoint (<768px)**: 4-column grid layout with 12px gutters and 16px margins.
* **Max Content Width**: 1440px to prevent layout stretching on ultra-wide screens.

---

## 2. Spacing Scale (8pt Grid)
All paddings, margins, and gaps must follow the 8pt multiplier scale to establish visual rhythm:
* **4px ($space-1)**: Micro adjustments, thin borders.
* **8px ($space-2)**: Inner element spacing, label to input spacing.
* **12px ($space-3)**: Small card paddings, list items.
* **16px ($space-4)**: Standard body padding, component groups.
* **24px ($space-6)**: Grid spacing, sections, modal margins.
* **32px ($space-8)**: Hero section gutters, page headers.
* **48px ($space-12)**: Large landing page sections.

---

## 3. Elevation & Soft Shadows
Shadows must feel light, soft, and modern, using low-opacity dark tones rather than harsh dark blocks:
* **Shadow-SM (Product Cards)**: `0 1px 3px rgba(31, 41, 55, 0.05), 0 1px 2px rgba(31, 41, 55, 0.03)`
* **Shadow-MD (Mega Menus, Navbars)**: `0 4px 6px -1px rgba(31, 41, 55, 0.08), 0 2px 4px -1px rgba(31, 41, 55, 0.04)`
* **Shadow-LG (Drawers, Modals)**: `0 10px 15px -3px rgba(31, 41, 55, 0.1), 0 4px 6px -2px rgba(31, 41, 55, 0.05)`
* **Hover Accent Shadow**: `0 12px 20px -5px rgba(255, 193, 7, 0.25)` (Yellow glow outline for primary hover items).

---

## 4. Rounded Corners & Radii
Rounded corners reflect a modern, premium SaaS feel:
* **Button & Input Radius**: `12px` ($radius-md) for friendly, tactile controls.
* **Product & Vendor Cards**: `16px` ($radius-lg) to frame items elegantly.
* **Modals & Flyouts**: `24px` ($radius-xl) to establish clear spatial hierarchies.
* **Badges & Tags**: `9999px` ($radius-full) for pills and counts.

---

## 5. Premium Glassmorphism
Used for banners, dashboard sidebar highlights, and top navigation overlays:
* **Backdrop Filter**: `blur(12px)`
* **Background Opacity**: `rgba(255, 255, 255, 0.75)`
* **Border Highlights**: `1px solid rgba(255, 255, 255, 0.4)`
* **Fallback**: Solid White `rgb(255, 255, 255)` for browsers that don't support backdrop filters.

---

## 6. Motion & Micro-Animations
All interactive items must feature smooth transition timings:
* **Fast Ease**: `150ms cubic-bezier(0.4, 0, 0.2, 1)` (Button states, icon changes).
* **Smooth Glide**: `300ms cubic-bezier(0.4, 0, 0.2, 1)` (Mega menu slide-downs, modal scale-ups).
* **Hover Scale**: Subtly scale cards by `scale(1.02)` during mouseover to trigger high-engagement click-throughs.
