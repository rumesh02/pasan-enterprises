# 📸 Dashboard Visual Reference

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                          │
│  Business overview and statistics                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │   💰 Green   │ │   🛒 Blue    │ │   ⚠️  Red     │ │   📊 Purple  │ │
│  │              │ │              │ │              │ │              │ │
│  │ LKR 831,578  │ │ LKR 831,578  │ │      3       │ │      8       │ │
│  │              │ │              │ │              │ │              │ │
│  │   Monthly    │ │    Total     │ │  Low Stock   │ │    Total     │ │
│  │   Revenue    │ │   Orders     │ │    Items     │ │    Items     │ │
│  │              │ │              │ │              │ │              │ │
│  │  This month  │ │ All time rev │ │ Items qty<3  │ │ In inventory │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  📊 Monthly Revenue Overview (2025)                             │ │
│  │                                                                 │ │
│  │  🔵 Monthly Revenue                                             │ │
│  │                                                                 │ │
│  │     █                                                           │ │
│  │     █                                                           │ │
│  │     █                                                           │ │
│  │     █                                                           │ │
│  │     █                         █                                 │ │
│  │ ▁ ▁ █ ▁ ▁ ▁ ▁ ▁ ▁ █ ▁ ▁       │ │
│  │ J F M A M J J A S O N D                                         │ │
│  │                                                                 │ │
│  │ Hover over bars for details • Max: LKR 831,578.40              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Card Design Specification

### Card 1: Monthly Revenue (Green)
```
┌────────────────────────┐
│  ┌────────┐            │
│  │   💰   │  Green     │
│  └────────┘  Gradient  │
│                        │
│  LKR 831,578.40        │ ← Large, bold font
│                        │
│  Monthly Revenue       │ ← Medium font
│  This month            │ ← Small font, gray
└────────────────────────┘
```
**Colors:**
- Icon background: `bg-gradient-to-br from-green-500 to-green-600`
- Icon: `text-white`
- Value: `text-slate-800` (3xl, bold)
- Label: `text-slate-600` (sm, medium)
- Subtitle: `text-slate-500` (xs)

### Card 2: Total Orders (Blue)
```
┌────────────────────────┐
│  ┌────────┐            │
│  │   🛒   │  Blue      │
│  └────────┘  Gradient  │
│                        │
│  LKR 831,578.40        │
│                        │
│  Total Orders          │
│  All time revenue      │
└────────────────────────┘
```
**Colors:**
- Icon background: `bg-gradient-to-br from-blue-500 to-blue-600`

### Card 3: Low Stock Items (Red)
```
┌────────────────────────┐
│  ┌────────┐            │
│  │   ⚠️    │  Red       │
│  └────────┘  Gradient  │
│                        │
│        3               │
│                        │
│  Low Stock Items       │
│  Items with qty < 3    │
└────────────────────────┘
```
**Colors:**
- Icon background: `bg-gradient-to-br from-red-500 to-red-600`

### Card 4: Total Items (Purple)
```
┌────────────────────────┐
│  ┌────────┐            │
│  │   📊   │  Purple    │
│  └────────┘  Gradient  │
│                        │
│        8               │
│                        │
│  Total Items           │
│  In inventory          │
└────────────────────────┘
```
**Colors:**
- Icon background: `bg-gradient-to-br from-purple-500 to-purple-600`

## Chart Design Specification

```
Monthly Revenue Overview (2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Legend: 🔵 Monthly Revenue

Height
  ▲
  │
Max │     
  │     ██
  │     ██
  │     ██
  │     ██
  │     ██                         ██
  │ ▁▁  ██  ▁▁ ▁▁ ▁▁ ▁▁ ▁▁ ▁▁  ██  ▁▁ ▁▁
  └─────────────────────────────────────► Months
    J F M A M J J A S O N D

Hover tooltip:
┌─────────────────┐
│ LKR 831,578.40  │
│ October         │
└─────────────────┘
```

**Chart Features:**
- 12 vertical bars (one per month)
- Blue gradient: `bg-gradient-to-t from-blue-500 to-blue-400`
- Height scales proportionally to max value
- Minimum height of 5% for visibility
- Hover shows tooltip with exact value
- Month labels below each bar
- Responsive flex layout

## Responsive Breakpoints

### Mobile (< 768px)
- Cards: 1 column
- Chart: Full width
- Card padding: Reduced

### Tablet (768px - 1024px)
- Cards: 2 columns
- Chart: Full width below cards

### Desktop (> 1024px)
- Cards: 4 columns
- Chart: Full width below cards
- Maximum container width

## Icon Reference

| Card | Hero Icon | Class |
|------|-----------|-------|
| Monthly Revenue | CurrencyDollarIcon | `w-6 h-6 text-white` |
| Total Orders | ShoppingCartIcon | `w-6 h-6 text-white` |
| Low Stock | ExclamationTriangleIcon | `w-6 h-6 text-white` |
| Total Items | ChartBarIcon | `w-6 h-6 text-white` |

## Color Palette

### Background Colors
```css
Body: bg-gradient-to-br from-slate-50 to-slate-100
Cards: bg-white
Chart Container: bg-gradient-to-t from-slate-50 to-transparent
```

### Icon Backgrounds
```css
Green: bg-gradient-to-br from-green-500 to-green-600
Blue: bg-gradient-to-br from-blue-500 to-blue-600
Red: bg-gradient-to-br from-red-500 to-red-600
Purple: bg-gradient-to-br from-purple-500 to-purple-600
```

### Text Colors
```css
Heading: text-slate-800
Subheading: text-slate-600
Value: text-slate-800
Label: text-slate-600
Subtitle: text-slate-500
```

### Effects
```css
Card Shadow: shadow-lg
Card Hover: hover:shadow-xl transition-shadow
Border Radius: rounded-2xl
Icon Container: rounded-xl
```

## Typography Scale

```
Page Title: text-3xl font-bold
Subtitle: text-sm
Card Value: text-3xl font-bold
Card Label: text-sm font-medium
Card Subtitle: text-xs
Chart Title: text-xl font-bold
Chart Legend: text-sm
Month Labels: text-xs font-medium
Tooltip: text-xs
```

## Spacing System

```
Page Padding: p-8 (2rem)
Card Gap: gap-6 (1.5rem)
Card Padding: p-6 (1.5rem)
Icon Padding: p-3 (0.75rem)
Margin Bottom (header): mb-8 (2rem)
Margin Bottom (value): mb-2 (0.5rem)
Margin Top (subtitle): mt-1 (0.25rem)
```

## Animation & Transitions

```css
Loading Spinner: animate-spin
Card Hover: transition-shadow
Tooltip: transition-opacity duration-200
Chart Bars: transition-all duration-300
```

## Accessibility

- ✅ Semantic HTML elements
- ✅ ARIA labels for icons
- ✅ Color contrast ratios met
- ✅ Keyboard navigation supported
- ✅ Screen reader friendly
- ✅ Tooltip accessible on focus

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

---

**Design System:** Tailwind CSS v3  
**Icons:** Heroicons v2  
**Chart Library:** Custom CSS (no external library needed)  
**Responsive Framework:** Tailwind Grid System
