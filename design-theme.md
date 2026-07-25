# Bookings & Travel — Design Theme

## Overview

A **monochromatic, minimal, editorial** design. Zero brand color — the accent is simply the foreground color inverted against the background. Visual hierarchy comes from weight, size, and spacing, not color. Think high-end travel magazine: bold typography, full-bleed imagery, restrained motion, premium restraint.

Supports **light and dark modes** via a stone-based neutral palette that inverts cleanly.

---

## Color System

### CSS Custom Properties (globals.css)

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#ffffff` | `#0c0a09` |
| `--bg-muted` | `#f5f5f4` | `#1c1917` |
| `--fg` | `#0c0a09` | `#fafaf9` |
| `--fg-muted` | `#78716c` | `#a8a29e` |
| `--border` | `#e7e5e4` | `#292524` |
| `--accent` | `#0c0a09` | `#fafaf9` |
| `--accent-fg` | `#ffffff` | `#0c0a09` |

### Semantic Colors (same both modes)

- `success`: `#16a34a` (green-600)
- `error`: `#dc2626` (red-600)
- `warning`: `#d97706` (amber-600)

### Principles

- **The accent IS the foreground color** — no separate brand hue
- All backgrounds and text are derived from the same monochrome scale
- Dark mode is a perfect inversion (light fg → dark bg, dark fg → light bg)
- Color is never used decoratively; only functionally (status, interactive states)

---

## Typography

- **Font:** Inter (`next/font/google`, `--font-inter` variable)
- **Body class:** `font-sans antialiased`
- **Logo wordmark:** `text-xl font-bold tracking-tight` (`bookings.`)

### Font Scale (actual usage)

| Context | Classes | Example |
|---|---|---|
| Hero heading | `text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]` | "Book stays, rent wheels, fly anywhere." |
| Section heading | `text-4xl md:text-5xl font-bold tracking-tight` | "Destinations" |
| Subheading label | `text-xs font-medium uppercase tracking-widest` | "Explore", "Stay", "Drive", "Live" |
| Card title | `text-xl/2xl/3xl font-bold text-white` (over image) | Hotel name on card |
| Body | `text-base md:text-lg text-fg-muted` | Descriptive text |
| Price | `text-lg font-bold` + `/night` in `text-sm font-normal text-fg-muted` | "$299/night" |
| Muted label | `text-xs font-bold uppercase tracking-widest text-fg-muted` | Section headers in search results |
| Filter header | `text-sm font-medium text-fg` | Price range, star rating |
| Tag/badge | `text-xs border border-current px-2 py-0.5` | "SUV", "Auto", "5 seats" |

### Weights Used

- `font-bold` (700) — primary headings, card titles, prices
- `font-medium` (500) — secondary headings, nav links, section labels
- `font-normal` (400) — body text, descriptions

---

## Spacing & Layout

- **Base unit:** 4px (Tailwind default)
- **Grid max-width:** `max-w-7xl` (1280px) with `px-6` gutters
- **Section padding:** `py-16` (64px) on listing pages; `py-20` on confirmation pages
- **Navbar height:** `h-16` (64px)
- **Footer height:** `h-14` (56px) regular; `h-screen` homepage footer
- **Breakpoint behavior:** Mobile-first; grids become `sm:grid-cols-2 lg:grid-cols-3`

---

## Component Patterns

### The 1px Border Grid (signature pattern)

Grid layouts use `gap-px bg-border` as the container and `bg-bg` on child items. This creates fine 1px border lines between cards without actual border properties on the cards themselves. Used on **every listing page** (hotels, cars, properties, destinations).

### Listing Cards

- Full-bleed background image
- `h-80` fixed height, `object-cover` on image
- `bg-gradient-to-t from-black/80 via-black/20 to-transparent` overlay for text readability
- Text is always white, positioned at `absolute bottom-0 left-0 p-6`
- Image zooms on hover: `transition-all duration-700 group-hover:scale-110`
- Tags use `border border-white/30 text-white/80`
- Wishlist button positioned `absolute right-3 top-3`

### Buttons

| Variant | Classes |
|---|---|
| Primary | `bg-accent text-accent-fg hover:opacity-90` |
| Secondary | `bg-bg-muted text-fg hover:bg-border` |
| Ghost | `text-fg-muted hover:text-fg hover:bg-bg-muted` |
| Outline | `border border-border text-fg hover:bg-bg-muted` |
| Danger | `bg-error text-white hover:opacity-90` |

All buttons: `rounded-md font-medium transition-colors`, `disabled:pointer-events-none disabled:opacity-50`, focus ring `focus:ring-2 focus:ring-fg-muted focus:ring-offset-2`.

Sizes: `sm: h-8 px-3 text-sm`, `md: h-10 px-4 text-sm`, `lg: h-12 px-6 text-base`.

### Navbar

- Sticky, `backdrop-blur-xl bg-bg/80`
- `border-b border-border`
- Nav links: `text-sm`, muted → bold on active, with spring-animated underline (`motion.span layoutId="nav-indicator"`)
- Mega-menu: enters with `opacity: 0 → 1, y: -4 → 0` over 180ms
- Search dropdown: `shadow-xl`, enters `opacity: 0 → 1, y: 8 → 0` over 150ms
- Hamburger on mobile at `md` breakpoint

### Forms

- **Standard input:** `h-10 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg`
- **Hero/search input:** `h-14 w-full border-0 border-b-2 border-border bg-transparent px-0 text-lg focus:border-fg`
- **Textarea:** `min-h-[100px] w-full rounded-md border border-border bg-bg px-3 py-2 text-sm`
- **Select:** same styling as standard input
- **Date inputs:** same as standard input, `mr-2` for inline pairs
- **Focus:** `focus:outline-none focus:ring-2 focus:ring-fg-muted focus:ring-offset-1`
- **Placeholder:** `placeholder:text-fg-muted/50`

### Homepage Sections (sticky-stacked)

- Each section: `sticky top-0 h-screen` with increasing `z-index` (z-10 through z-60)
- No spacer divs — sections overlay each other naturally
- Container: `snap-y snap-mandatory`
- Footer: last stacked section at z-60
- `SectionDots`: floating dot navigation, spring animation, hidden on mobile

### Filters / Utility Bars

- `flex flex-wrap items-center gap-4` layout
- Filters use the standard input/select styling
- "Clear filters" link: `underline hover:text-fg`
- Empty state: `border border-border p-8 text-center text-sm text-fg-muted`

---

## Animation & Motion

| Pattern | Details |
|---|---|
| **Scroll reveal** | `opacity: 0, y: 20` → `1, 0`; 500ms; `ease [0.16, 1, 0.3, 1]`; `once: true, margin: -80px` |
| **Stagger** | `delay={i * 0.03}` to `i * 0.1` |
| **Nav underline** | Spring `stiffness: 500, damping: 30`, `layoutId` for AnimatePresence |
| **Mega-menu** | 180ms ease-out; `opacity 0→1, y -4→0` |
| **Search dropdown** | 150ms; `opacity 0→1, y 8→0` |
| **Explore drawer** | Spring `damping: 28, stiffness: 300`; slides `x: 100% → 0` |
| **Mobile menu** | 200ms; `height: 0, auto` + opacity |
| **Image hover zoom** | CSS `duration-700 group-hover:scale-110` |
| **Button hover** | `transition-colors` (150ms default) |
| **Skeleton** | `shimmer` keyframes — 1.5s ease-in-out infinite, `background-position: -200% → 200%` |
| **Parallax** | Framer Motion `useScroll` + `useTransform`; maps -15% to +15% translateY |
| **Staggered mount (SectionDots)** | `scale: 0, opacity: 0` → `1, 1`; 300ms; stagger `i * 0.06` |

---

## Shadows

Used sparingly. Only on floating/modals:
- Mega-menu dropdown: none (uses `border-b`)
- Search panel: `shadow-xl`
- Navbar: none (uses `backdrop-blur-xl`)
- Cards: **no shadows** — visual separation comes from the 1px border grid

---

## Icons

- Simple inline SVGs (lucide-style)
- `strokeWidth="1.5"` or `"2"`
- Sizes: 14–28px
- Always `currentColor`

---

## Interactive States

- **Hover:** opacity shift or color change only (no scale, no lift, no shadow)
- **Active nav:** bold text + spring underline (no color change)
- **Focus:** symmetrical 2px ring via `focus:ring-2 focus:ring-fg-muted`
- **Disabled:** `opacity-50 pointer-events-none`
- **Loading:** skeleton shimmer or `animate-spin` spinner

---

## Loading States

- **Skeleton:** `.skeleton` class — gradient shifts via `shimmer` keyframes, `rounded-md`
- **Spinner:** `h-5 w-5 animate-spin border-2 border-fg-muted border-t-fg`
- **Content:** `animate-pulse bg-bg-muted` for pulsing placeholders

---

## Print Styles

- Hides all UI: `body > *:not(.print-only) { display: none }`
- Shows `.print-only` content centered on white page
- `@page { margin: 0.5in; size: auto }`

---

## Responsive Strategy

- **Mobile-first** (base styles are mobile)
- **`sm` (640px):** grids become 2 columns
- **`md` (768px):** navbar expands to desktop, mobile menu hidden
- **`lg` (1024px):** grids become 3 columns
- **`md`/`lg`:** text scales up (e.g., `text-6xl md:text-8xl lg:text-9xl`)
- Mobile = hamburger menu, single-column layouts, compact padding

---

## Key Design Decisions

1. **No brand color** — the entire palette is stone neutrals. The "accent" IS the foreground. This creates a stark, high-contrast, typography-forward look that ages well and doesn't compete with photography.

2. **1px border grid** — the signature visual pattern. Grid items are separated by a hairline gap with the border color, creating a subtle grid structure without traditional card borders or shadows.

3. **Gradient overlays** — every image card uses `from-black/80 via-black/20 to-transparent` to guarantee white text readability regardless of image content.

4. **Sticky-stacked homepage** — sections overlay each other as you scroll (increasing z-index), creating a layered, magazine-like reveal without spacer divs.

5. **Understated interactivity** — hover states are subtle color/opacity changes only. No scale transforms on cards (only the image inside). No shadows on hover. The interface stays calm and doesn't compete with content.

6. **Typography as hierarchy** — without color to differentiate, the design relies entirely on font size, weight, letter-spacing, and case to establish visual hierarchy (e.g., `text-xs font-medium uppercase tracking-widest` for labels above `text-4xl font-bold tracking-tight` for headings).
