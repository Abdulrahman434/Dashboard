# CareInn Visual Style Quick Reference

## Color Swatches & Component Specs

---

## 🎨 COLOR PALETTE

### Primary Brand

```
#4EBEE3 ███████ CareInn Blue (Primary)
#3DA8CC ███████ CareInn Blue Hover
#4EBEE3 (10% opacity) Light Blue Background
```

### Sidebar

```
#FFFFFF ███████ Sidebar Background (White)
#16274D ███████ Sidebar Text (Dark Navy)
#F3F4F6 ███████ Sidebar Hover (Gray-50)
#4EBEE3 ███████ Sidebar Active Background
#E5E7EB ███████ Sidebar Border (Gray-200)
```

### Backgrounds

```
#F8FAFC ███████ Page Background (Slate-50)
#FFFFFF ███████ Card/Content Background
#F9FAFB ███████ Alternative Light Background
```

### Text

```
#0F1729 ███████ Primary Text (Headings)
#16274D ███████ Secondary Text (Body)
#64748B ███████ Tertiary Text (Muted)
#94A3B8 ███████ Disabled Text
#9CA3AF ███████ Placeholder
```

### Borders

```
#E5E7EB ███████ Light Border (Gray-200)
#D1D5DB ███████ Medium Border (Gray-300)
#9CA3AF ███████ Dark Border (Gray-400)
#4EBEE3 ███████ Focus Border
```

### Semantic

```
Success:  #10B981 ███████ Green
Warning:  #F59E0B ███████ Orange/Amber
Error:    #EF4444 ███████ Red
Info:     #3B82F6 ███████ Blue
```

---

## 📏 DIMENSIONS & SPACING

### Sidebar

- **Expanded Width:** 240px
- **Collapsed Width:** 82px
- **Logo Height:** 100px
- **Logo Size (Expanded):** 170px × 85px
- **Logo Size (Collapsed):** 70px × 88px
- **Nav Item Height:** 48px (main), 42px (sub)
- **Nav Item Border Radius:** 14px (main), 10px (sub)
- **Toggle Button:** 32px × 32px, positioned -16px from right edge

### Page Layout

- **Content Padding:** 32px (desktop), 24px (mobile)
- **Max Content Width:** 1600px
- **Page Title Icon:** 40px × 40px
- **Page Title Font:** 24px
- **Page Title Margin Bottom:** 24px

### Cards

- **Standard Padding:** 24px (p-6)
- **Compact Padding:** 16px (p-4)
- **Border Radius:** 8px (rounded-lg)
- **Border Width:** 1px
- **Border Color:** Gray-200

### Spacing Scale

- 4px (gap-1, p-1)
- 8px (gap-2, p-2)
- 12px (gap-3, p-3)
- 16px (gap-4, p-4)
- 20px (gap-5, p-5)
- 24px (gap-6, p-6) ← Most common
- 32px (gap-8, p-8)
- 40px (gap-10, p-10)
- 48px (gap-12, p-12)

### Border Radius Scale

- 6px (rounded-sm)
- 8px (rounded-lg) ← Most common
- 10px (rounded-lg for sub-nav)
- 14px (rounded-[14px] for main nav)
- 16px (rounded-xl for modals)
- 9999px (rounded-full for pills/badges)

---

## 🔤 TYPOGRAPHY SCALE

### Font Families

- **English:** 'Poppins', sans-serif
- **Arabic:** 'Baloo Bhaijaan 2', 'Poppins', sans-serif

### Font Sizes

- **24px** - Page Titles (h1)
- **18px** - Section Headers (h2)
- **16px** - Card Titles (h3)
- **15px** - Large Body Text
- **14px** - Standard Body, Buttons, Inputs ← Most common
- **13px** - Small Text, Labels, Table Headers
- **12px** - Tiny Text, Badges, Meta Info
- **11px** - Micro Text (rare)

### Font Weights

- **300** (Light) - Rarely used
- **400** (Normal) - Body text
- **500** (Medium) - Buttons, emphasis ← Most common
- **600** (Semibold) - Headings, important labels ← Common
- **700** (Bold) - Strong emphasis (rare)

### Line Heights

- **1.2** - Headings (tight)
- **1.5** - Body text, inputs, buttons ← Most common
- **1.75** - Long-form content (relaxed)

---

## 🎯 COMPONENT SPECIFICATIONS

### BUTTONS

#### Primary Button

- **Background:** #4EBEE3
- **Text:** White, 14px, font-weight 500
- **Padding:** 20px horizontal (px-5), 8px vertical (py-2)
- **Border Radius:** 8px
- **Hover:** Background #3DA8CC
- **Transition:** 150-200ms

#### Secondary Button

- **Border:** 2px solid #4EBEE3
- **Text:** #4EBEE3, 14px, font-weight 500
- **Padding:** Same as primary
- **Border Radius:** 8px
- **Hover:** Background #4EBEE3/10
- **Transition:** 150-200ms

#### Icon Button

- **Size:** 40px × 40px (w-10 h-10)
- **Background:** #4EBEE3/10
- **Icon Size:** 20px
- **Icon Color:** #4EBEE3
- **Border Radius:** 8px
- **Hover:** Background #4EBEE3/20

### INPUTS

#### Text Input

- **Padding:** 16px horizontal (px-4), 10px vertical (py-2.5)
- **Border:** 1px solid gray-300
- **Border Radius:** 8px
- **Font:** 14px Poppins
- **Placeholder:** Gray-400
- **Focus:** 2px ring #4EBEE3/50, border #4EBEE3
- **Height:** ~42px total

#### Textarea

- **Padding:** 16px horizontal, 12px vertical (py-3)
- **Border:** 1px solid gray-300
- **Border Radius:** 8px
- **Font:** 14px Poppins
- **Focus:** Same as text input
- **Rows:** 4 (default)

#### Label

- **Font:** 13px Poppins, font-weight 500
- **Color:** #16274D
- **Margin Bottom:** 8px (mb-2)

### CHECKBOX

#### Unchecked

- **Size:** 20px × 20px (w-5 h-5)
- **Border:** 2px solid gray-300
- **Border Radius:** 4px
- **Background:** White

#### Checked

- **Size:** 20px × 20px
- **Border:** 2px solid #4EBEE3
- **Background:** #4EBEE3
- **Checkmark:** White SVG icon
- **Focus:** 3px shadow ring #4EBEE3/20

### DROPDOWN

#### Trigger Button

- **Padding:** 12px horizontal (px-3), 6px vertical (py-1.5) for single select
- **Padding:** 16px horizontal (px-4), 10px vertical (py-2.5) for multi-select
- **Border:** 1px solid gray-300
- **Border Radius:** 8px
- **Font:** 14px Poppins
- **Chevron:** 16px, gray-500, rotates 180° when open
- **Hover:** Border gray-400
- **Focus:** 2px ring #4EBEE3/50, border #4EBEE3

#### Dropdown Menu

- **Background:** White
- **Border:** 1px solid gray-200
- **Border Radius:** 8px
- **Shadow:** shadow-lg
- **Max Height:** 280px
- **Margin Top:** 4px (mt-1)
- **Option Padding:** 12px horizontal, 8px vertical
- **Option Hover:** Background gray-50
- **Selected Option:** Background #4EBEE3/5, text #4EBEE3

### MODAL

#### Backdrop

- **Background:** Black with 50% opacity
- **Position:** Fixed, covering full viewport
- **Z-index:** 50

#### Modal Container

- **Background:** White
- **Border Radius:** 16px (rounded-xl)
- **Shadow:** shadow-2xl
- **Max Width:** 672px (max-w-2xl)
- **Max Height:** 90vh
- **Padding (outer):** 16px (p-4)

#### Modal Header

- **Padding:** 24px horizontal, 16px vertical
- **Border Bottom:** 1px solid gray-200
- **Title Font:** 18px Poppins semibold
- **Close Button:** Hover gray-100, rounded-lg

#### Modal Body

- **Padding:** 24px horizontal, 16px vertical
- **Overflow:** overflow-y-auto
- **Flex:** flex-1

#### Modal Footer

- **Padding:** 24px horizontal, 16px vertical
- **Border Top:** 1px solid gray-200
- **Button Gap:** 12px (gap-3)
- **Alignment:** Right-aligned (justify-end)

### TABLE

#### Table Container

- **Background:** White
- **Border:** 1px solid gray-200
- **Border Radius:** 8px
- **Overflow:** hidden

#### Table Header

- **Background:** Gray-50
- **Border Bottom:** 1px solid gray-200
- **Cell Padding:** 24px horizontal, 12px vertical
- **Font:** 13px Poppins semibold
- **Text Color:** #0F1729
- **Alignment:** Left (most columns)

#### Table Body Row

- **Background:** White
- **Hover:** Gray-50
- **Border:** divide-y with gray-200
- **Cell Padding:** 24px horizontal, 16px vertical
- **Font:** 14px Poppins normal
- **Text Color:** #0F1729
- **Transition:** 150ms

#### Action Buttons (in table)

- **Padding:** 6px (p-1.5)
- **Border Radius:** 4px (rounded)
- **Hover:** Gray-100 (edit), Red-50 (delete)
- **Icon Size:** 16px

### PILL TABS

#### Container

- **Border Bottom:** 2px solid gray-200
- **Padding:** 8px horizontal (px-2), 8px top (pt-2)
- **Gap:** 4px (gap-1)

#### Active Tab

- **Background:** #4EBEE3
- **Text:** White, 14px, font-weight 500
- **Padding:** 24px horizontal (px-6), 12px vertical (py-3)
- **Border Radius:** 8px (top only, rounded-t-lg)

#### Inactive Tab

- **Background:** Transparent
- **Text:** #16274D, 14px, font-weight 500
- **Padding:** Same as active
- **Border Radius:** Same as active
- **Hover:** Gray-50

### PAGE TITLE

#### Icon Container

- **Size:** 40px × 40px
- **Background:** #4EBEE3/10
- **Border Radius:** 8px
- **Icon Size:** 20px
- **Icon Color:** #4EBEE3

#### Title Text

- **Font:** 24px Poppins semibold
- **Color:** #0F1729
- **Gap from Icon:** 12px (gap-3)
- **Margin Bottom:** 24px (mb-6)

### BADGES

#### Status Badge

- **Padding:** 12px horizontal (px-3), 4px vertical (py-1)
- **Border Radius:** Full (rounded-full)
- **Font:** 13px Poppins medium
- **Dot Size:** 8px (w-2 h-2)
- **Gap:** 6px (gap-1.5)

#### Color Variants

- **Success:** bg-green-100, text-green-700, dot: bg-green-500
- **Warning:** bg-amber-100, text-amber-700, dot: bg-amber-500
- **Error:** bg-red-100, text-red-700, dot: bg-red-500
- **Info:** bg-blue-100, text-blue-700, dot: bg-blue-500
- **Primary:** bg-[#4EBEE3]/10, text-[#4EBEE3]

---

## 🎭 ICON SPECIFICATIONS

### Icon Library

- **Source:** Lucide React
- **Import:** `import { IconName } from 'lucide-react';`

### Icon Sizes

- **16px** - Small inline, sub-navigation
- **18px** - Search icons, smaller UI
- **20px** - Standard (sidebar, buttons, page titles) ← Most common
- **24px** - Large emphasis
- **32px** - Empty states
- **48px** - Major empty states

### Stroke Widths

- **1.67** - Sidebar main items
- **1.7** - Sidebar sub-items
- **2** - Standard buttons, general use ← Most common
- **2.5** - Emphasis (toggles, checkmarks)
- **3** - Strong emphasis (rare)

### Icon Colors

- **#4EBEE3** - Primary actions, active states
- **#16274D** - Default neutral (sidebar)
- **#6B7280** - Secondary neutral (gray-500)
- **Gray-400** - Muted/placeholder
- **White** - On colored backgrounds
- **Green-500** - Success
- **Red-600** - Error/delete
- **Amber-500** - Warning

---

## 📐 LAYOUT GRID

### Desktop (1920×1080)

```
┌─────────────┬────────────────────────────────────────┐
│             │                                        │
│   SIDEBAR   │         MAIN CONTENT AREA             │
│   240px     │         (Fluid, max 1600px)           │
│             │         Background: #F8FAFC           │
│   White     │         Padding: 32px                 │
│   bg        │                                        │
│             │                                        │
│   Logo      │  ┌──────────────────────────────┐     │
│   100px h   │  │  Page Title (24px)          │     │
│             │  │  Icon (40×40) + Text        │     │
│   Nav       │  └──────────────────────────────┘     │
│   Items     │                                        │
│   (48px)    │  ┌──────────────────────────────┐     │
│             │  │  Pill Tabs                   │     │
│   Sub-Nav   │  │  Active: Blue, Inactive: Gray│     │
│   (42px)    │  └──────────────────────────────┘     │
│             │                                        │
│   User      │  ┌──────────────────────────────┐     │
│   Profile   │  │  Card (White, p-6)          │     │
│   (Bottom)  │  │  Border: Gray-200           │     │
│             │  │  Rounded: 8px               │     │
└─────────────┴────────────────────────────────────────┘
```

### Sidebar Collapsed (82px)

```
┌──┬──────────────────────────────────────────────────┐
│  │                                                  │
│  │                                                  │
│  │              MAIN CONTENT AREA                  │
│  │              (More horizontal space)            │
│  │                                                  │
└──┴──────────────────────────────────────────────────┘
```

---

## ✅ QUICK CHECKLIST

When building a new page, verify:

### Colors

- [ ] Primary brand color is #4EBEE3
- [ ] Page background is #F8FAFC (slate-50)
- [ ] Cards are white with gray-200 borders
- [ ] Text uses defined color palette (no custom colors)

### Typography

- [ ] All text uses Poppins font
- [ ] Page title is 24px semibold
- [ ] Body text is 14px normal
- [ ] Labels are 13px medium

### Layout

- [ ] Content padding is 32px (p-8)
- [ ] Max content width is 1600px
- [ ] Page title has icon + 24px margin bottom
- [ ] Cards have 24px padding (p-6)

### Components

- [ ] Buttons are 14px with proper padding
- [ ] Inputs have focus ring (#4EBEE3/50)
- [ ] Checkboxes use custom blue styling
- [ ] Dropdowns close on outside click
- [ ] Modals have backdrop and proper z-index
- [ ] Tables have hover states

### Interactions

- [ ] All interactive elements have hover states
- [ ] Focus states use CareInn blue ring
- [ ] Transitions are 150-200ms
- [ ] Icons are from Lucide React

### Spacing

- [ ] Consistent gaps (24px most common)
- [ ] Proper margins between sections
- [ ] Whitespace is generous and intentional

---

## 🎨 EXAMPLE COLOR COMBINATIONS

### Primary Action Button

- Background: #4EBEE3
- Text: #FFFFFF
- Hover: #3DA8CC
- Border: None

### Input Focus

- Background: #FFFFFF
- Border: #4EBEE3
- Ring: #4EBEE3 (50% opacity, 2px)
- Text: #0F1729

### Card

- Background: #FFFFFF
- Border: #E5E7EB (gray-200)
- Title: #0F1729
- Body text: #16274D

### Sidebar Active Item

- Background: #4EBEE3
- Text: #FFFFFF
- Icon: #FFFFFF
- Shadow: rgba(78,190,227,0.3)

### Table Header

- Background: #F9FAFB (gray-50)
- Text: #0F1729
- Border: #E5E7EB (gray-200)

### Success Badge

- Background: #D1FAE5 (green-100)
- Text: #059669 (green-600)
- Dot: #10B981 (green-500)

---

This quick reference provides all the essential visual specifications needed to maintain consistency across the CareInn application. Use this alongside the main style guide for complete coverage.