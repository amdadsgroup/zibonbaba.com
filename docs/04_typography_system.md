# Typography System - Zibonbaba.com

We use **Inter** as our core typeface for all interface text, product titles, dashboard widgets, and administrative systems.

## 1. Type Scale Hierarchy
All sizes are defined in rems (where 1rem = 16px default browser sizing) to support flexible user agent scaling:

| Token | Size (px) | Size (rem) | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-1` | 48px | 3.0rem | 1.15 | 800 (ExtraBold) | Hero main heading |
| `h1` | 36px | 2.25rem | 1.2 | 700 (Bold) | Main page titles, landing sections |
| `h2` | 28px | 1.75rem | 1.25 | 700 (Bold) | Section headers, card groups |
| `h3` | 20px | 1.25rem | 1.3 | 600 (SemiBold) | Product titles, widget headings |
| `lead` | 18px | 1.125rem | 1.5 | 400 (Regular) | Intro paragraphs, subtitles |
| `body` | 16px | 1.0rem | 1.5 | 500 (Medium) | Standard body, form descriptions |
| `body-sm` | 14px | 0.875rem | 1.45 | 500 (Medium) | Product listings, table lists |
| `caption` | 12px | 0.75rem | 1.4 | 400 (Regular) | Time stamps, badges, input helpers |

---

## 2. Font Weights
To optimize load times and maintain readability, we bundle three specific weights of the Inter variable font:
* **Inter Regular (400)**: Descriptive paragraphs, helper text, tables.
* **Inter Medium (500)**: Interface controls, button labels, form inputs, metadata.
* **Inter SemiBold/Bold (600/700)**: Dashboard statistics, product titles, headers.
* **Inter ExtraBold (800)**: Hero page headlines.

---

## 3. Responsive Typography Rules
Typography must adapt dynamically across device sizes:
* **H1 Scale**:
  * Desktop: `36px (2.25rem)`
  * Mobile: `28px (1.75rem)`
* **Hero Heading**:
  * Desktop: `48px (3.0rem)`
  * Mobile: `32px (2.0rem)`
* **Body Sizing**: Keep consistent at `16px` for readability, with `14px` options for sidebars, product grids, and secondary listings.

---

## 4. Letter Spacing (Tracking)
* **Titles/Headings (`display-1`, `h1`, `h2`)**: Apply negative tracking (`tracking-tight`, `-0.025em`) to make large text feel compact and premium.
* **Body & Small Text**: Standard tracking (`tracking-normal`, `0em`).
* **All-Caps Badges / Tiny Headers**: Apply expanded tracking (`tracking-widest`, `0.1em`) to improve letter separation.
