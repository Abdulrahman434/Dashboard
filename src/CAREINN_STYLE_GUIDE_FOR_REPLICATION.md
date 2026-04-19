# CareInn Portal Style Guide
## Complete Design System Documentation for Replication

---

## 📋 Overview

This document provides a complete style guide for replicating the CareInn healthcare management portal design system in another Figma Make file. It covers all visual components, patterns, and styling rules used throughout the application.

**Target Resolution:** 1920x1080 (Full HD Desktop)  
**Design Philosophy:** Modern SaaS-inspired (Linear, Vercel, Notion), enterprise-appropriate, clean and functional  
**Framework:** React + Tailwind CSS v4  
**Font System:** Poppins (English), Baloo Bhaijaan 2 (Arabic/RTL)

---

## 🎨 Color Palette

### Primary Brand Color
```css
--brand-primary: #4EBEE3;        /* Main CareInn blue - used for actions, active states */
--brand-primary-hover: #3DA8CC;  /* Hover state for primary buttons */
--brand-primary-light: #4EBEE3/10; /* Light backgrounds, subtle highlights */
--brand-primary-border: #4EBEE3/30; /* Border accents */
```

### Sidebar Colors
```css
--sidebar-bg: #FFFFFF;           /* White sidebar background (NOT dark blue) */
--sidebar-text: #16274D;         /* Dark navy text */
--sidebar-hover: #F3F4F6;        /* Light gray hover (gray-50) */
--sidebar-active-bg: #4EBEE3;    /* Active item background - CareInn blue */
--sidebar-active-text: #FFFFFF;  /* White text on active items */
--sidebar-border: #E5E7EB;       /* Border color (gray-200) */
```

### Main Background Colors
```css
--page-bg: #F8FAFC;              /* Main page background (slate-50) */
--card-bg: #FFFFFF;              /* Card/container background */
--content-bg: #FFFFFF;           /* Content area background */
```

### Text Colors
```css
--text-primary: #0F1729;         /* Primary text (headings, labels) */
--text-secondary: #16274D;       /* Secondary text (body) */
--text-tertiary: #64748B;        /* Tertiary/muted text (slate-500) */
--text-disabled: #94A3B8;        /* Disabled state text (slate-400) */
--text-placeholder: #9CA3AF;     /* Placeholder text (gray-400) */
```

### Border Colors
```css
--border-light: #E5E7EB;         /* Light borders (gray-200) */
--border-medium: #D1D5DB;        /* Medium borders (gray-300) */
--border-dark: #9CA3AF;          /* Dark borders (gray-400) */
--border-focus: #4EBEE3;         /* Focus state borders */
```

### Semantic Colors

#### Success (Green)
```css
--success: #10B981;              /* Success green (emerald-500) */
--success-bg: #D1FAE5;           /* Success background (emerald-100) */
--success-text: #059669;         /* Success text (emerald-600) */
```

#### Warning (Orange/Amber)
```css
--warning: #F59E0B;              /* Warning orange (amber-500) */
--warning-bg: #FEF3C7;           /* Warning background (amber-100) */
--warning-text: #D97706;         /* Warning text (amber-600) */
```

#### Error (Red)
```css
--error: #EF4444;                /* Error red (red-500) */
--error-bg: #FEE2E2;             /* Error background (red-100) */
--error-text: #DC2626;           /* Error text (red-600) */
```

#### Info (Blue)
```css
--info: #3B82F6;                 /* Info blue (blue-500) */
--info-bg: #DBEAFE;              /* Info background (blue-100) */
--info-text: #2563EB;            /* Info text (blue-600) */
```

---

## 📝 Typography System

### Font Families
```css
/* Primary Font (English) */
font-family: 'Poppins', sans-serif;

/* Arabic/RTL Font */
*[lang="ar"], *[dir="rtl"] {
  font-family: 'Baloo Bhaijaan 2', 'Poppins', sans-serif;
}
```

**Import Statement:**
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap');
```

### Font Sizes
```css
--text-page-title: 24px;         /* Main page titles */
--text-section-title: 18px;      /* Section headers */
--text-card-title: 16px;         /* Card titles */
--text-large: 15px;              /* Large body text */
--text-body: 14px;               /* Standard body text */
--text-small: 13px;              /* Small text, labels */
--text-tiny: 12px;               /* Meta info, captions */
--text-micro: 11px;              /* Smallest text */
```

### Font Weights
```css
--weight-light: 300;             /* Rarely used */
--weight-normal: 400;            /* Body text */
--weight-medium: 500;            /* Emphasis, buttons */
--weight-semibold: 600;          /* Headings, important labels */
--weight-bold: 700;              /* Strong emphasis (rare) */
```

### Line Heights
```css
--leading-tight: 1.2;            /* Headings */
--leading-normal: 1.5;           /* Body text, inputs, buttons */
--leading-relaxed: 1.75;         /* Long-form content */
```

### Typography Examples

#### Page Title (with icon)
```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
    <Icon size={20} className="text-[#4EBEE3]" />
  </div>
  <h1 className="text-[24px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
    Page Title
  </h1>
</div>
```

#### Section Header
```tsx
<h2 className="text-[18px] font-semibold text-[#0F1729] mb-4 font-['Poppins',sans-serif]">
  Section Title
</h2>
```

#### Body Text
```tsx
<p className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
  Standard body text
</p>
```

#### Small/Meta Text
```tsx
<span className="text-[13px] text-[#64748B] font-['Poppins',sans-serif]">
  Meta information
</span>
```

---

## 📐 Layout & Spacing

### Sidebar Dimensions
```css
/* Expanded State */
width: 240px;
background: white;
border-right: 1px solid #E5E7EB;
box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1);

/* Collapsed State */
width: 82px;
```

### Logo Container
```css
/* Logo Area */
height: 100px;
border-bottom: 1px solid #E5E7EB;
display: flex;
align-items: center;
justify-content: center;

/* Logo Sizes */
Expanded: 170px × 85px
Collapsed: 70px × 88px
```

### Toggle Button (Sidebar)
```css
position: absolute;
right: -16px; /* -right-4 */
top: 50%;
transform: translateY(-50%);
width: 32px;
height: 32px;
background: #4EBEE3;
border: 2px solid white;
border-radius: 9999px; /* fully rounded */
box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
```

### Main Content Area
```css
/* Content Container */
margin-left: 240px; /* When sidebar is expanded */
margin-left: 82px;  /* When sidebar is collapsed */
background: #F8FAFC;
min-height: 100vh;
padding: 32px 40px;
```

### Page Container
```css
/* Standard Page Padding */
padding: 32px 40px; /* Desktop */
padding: 24px;      /* Mobile */

/* Maximum Content Width */
max-width: 1600px;
margin: 0 auto;
```

### Spacing Scale
```css
--space-1: 4px;    /* gap-1, p-1 */
--space-2: 8px;    /* gap-2, p-2 */
--space-3: 12px;   /* gap-3, p-3 */
--space-4: 16px;   /* gap-4, p-4 */
--space-5: 20px;   /* gap-5, p-5 */
--space-6: 24px;   /* gap-6, p-6 */
--space-8: 32px;   /* gap-8, p-8 */
--space-10: 40px;  /* gap-10, p-10 */
--space-12: 48px;  /* gap-12, p-12 */
```

### Border Radius
```css
--radius-sm: 6px;     /* Small elements (badges) */
--radius-md: 8px;     /* Inputs, buttons */
--radius-lg: 10px;    /* Cards, sub-navigation items */
--radius-xl: 14px;    /* Main navigation items, large cards */
--radius-2xl: 16px;   /* Modal corners */
--radius-full: 9999px; /* Pills, avatars, toggle buttons */
```

---

## 🧭 Sidebar Navigation

### Sidebar Collapse/Expand Behavior

The sidebar has two states with smooth transitions:

#### **Expanded State (Default)**
- **Width:** 240px
- **Logo:** 170px × 85px (full size)
- **Menu Items:** Text labels visible
- **Sub-Items:** Expand inline below parent item with chevron toggle
- **User Info:** Name and email visible

#### **Collapsed State**
- **Width:** 82px
- **Logo:** 70px × 88px (compact)
- **Menu Items:** Icons only, centered
- **Sub-Items:** Show in hover flyout menu (explained below)
- **User Info:** Hidden (avatar only)

#### **Toggle Button**
```tsx
<button className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#4EBEE3] hover:bg-[#3DA8CC] border-2 border-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-20">
  {isCollapsed ? (
    <ChevronRight size={18} strokeWidth={2.5} className="text-white" />
  ) : (
    <ChevronLeft size={18} strokeWidth={2.5} className="text-white" />
  )}
</button>
```

**Toggle Button Specifications:**
- **Position:** Absolute, -16px from right edge, vertically centered
- **Size:** 32px × 32px (w-8 h-8)
- **Background:** CareInn blue (#4EBEE3)
- **Border:** 2px solid white
- **Icon:** ChevronLeft (expanded) or ChevronRight (collapsed), 18px, white color
- **Shadow:** shadow-lg for depth
- **Hover:** Darker blue (#3DA8CC)
- **Transition:** 200ms smooth transition

#### **Content Area Adjustment**
The main content area automatically adjusts its left margin when sidebar toggles:

```tsx
<main className={`min-h-screen bg-[#F8FAFC] transition-all duration-300 ${
  isCollapsed ? 'ml-[82px]' : 'ml-[240px]'
}`}>
  {/* Page content */}</main>
```

#### **Transition Animation**
All sidebar width changes use smooth transitions:

```tsx
className="transition-all duration-300"
```

- **Duration:** 300ms
- **Easing:** Default ease (smooth start and end)
- **Properties:** Width, margin, padding smoothly animate

---

### Hover Flyout Menu Behavior (Collapsed Sidebar Only)

When the sidebar is collapsed and a menu item has sub-items, hovering over the item triggers a flyout menu.

#### **Visual Indicator (Collapsed State)**
Menu items with sub-items show a small chevron arrow:

```tsx
{isCollapsed && hasSubItems && (
  <div className="absolute -right-1 top-1/2 -translate-y-1/2">
    <ChevronRight 
      size={12} 
      strokeWidth={2.5}
      className="text-[#4EBEE3] opacity-70 group-hover:opacity-100 transition-colors"
    />
  </div>
)}
```

**Chevron Indicator:**
- **Position:** Absolute, -4px from right, vertically centered
- **Size:** 12px
- **Color:** CareInn blue with 70% opacity (100% on hover)
- **Purpose:** Signals that hovering will reveal sub-items

#### **Flyout Menu Trigger**
Hovering over a menu item with sub-items triggers the flyout:

```tsx
<button
  onMouseEnter={() => hasSubItems && isCollapsed && handleMouseEnterItem(item.id)}
  onMouseLeave={() => hasSubItems && isCollapsed && handleMouseLeaveItem()}
  {/* button content */}
>
  {/* Icon */}
  <Icon size={20} strokeWidth={1.67} className="text-[#16274D] group-hover:text-[#4EBEE3] transition-colors" />
  {/* Label */}
  <span className="flex-1 text-left text-[13px] font-medium text-[#16274D] group-hover:text-[#4EBEE3] transition-colors">
    Menu Item
  </span>
</button>
```

#### **Flyout Menu Positioning**
The flyout appears to the right of the sidebar with precise positioning:

```tsx
<div 
  className="fixed bg-white rounded-xl shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-200 py-3.5 px-2.5 min-w-[260px] z-[9999]"
  style={{
    top: `${flyoutPosition.top}px`,
    left: `${flyoutPosition.left}px`,
  }}
  onMouseEnter={handleMouseEnterFlyout}
  onMouseLeave={handleMouseLeaveFlyout}
>
  {/* Flyout content */}
</div>
```

**Flyout Menu Specifications:**
- **Position:** Fixed positioning (stays in viewport)
- **Top:** Aligned with the hovered menu item's top edge
- **Left:** 12px gap from sidebar right edge (`sidebarRight + 12`)
- **Min Width:** 260px
- **Background:** White
- **Border:** 1px solid gray-200
- **Border Radius:** rounded-xl (16px)
- **Shadow:** Heavy shadow for depth (shadow-[0px_20px_25px...])
- **Z-index:** 9999 (appears above everything)
- **Padding:** 14px vertical (py-3.5), 10px horizontal (px-2.5)

#### **Flyout Menu Header**
Each flyout includes a header with the parent item's icon and label:

```tsx
<div className="px-3 pb-3 mb-2 border-b border-gray-100">
  <div className="flex items-center gap-3">
    {/* Icon Container */}
    <div className="p-2 bg-[#4EBEE3]/10 rounded-lg shrink-0">
      <Icon size={18} className="text-[#4EBEE3]" strokeWidth={1.8} />
    </div>
    {/* Parent Label */}
    <span className="text-[14.5px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-tight">
      {item.label}
    </span>
  </div>
</div>
```

**Header Specifications:**
- **Padding:** 12px horizontal, 12px bottom
- **Border Bottom:** 1px gray-100
- **Icon Box:** 8px padding, light blue background (10% opacity), rounded-lg
- **Icon Size:** 18px
- **Label Font:** 14.5px Poppins semibold, dark navy color

#### **Flyout Sub-Items**
Sub-items in the flyout follow the same styling as expanded sub-items:

```tsx
<div className="space-y-1">
  {item.subItems.map((subItem) => {
    const SubIcon = subItem.icon;
    const isSubActive = activeItem === subItem.id;
    
    return (
      <button
        key={subItem.id}
        onClick={() => {
          onItemClick(subItem.id);
          setHoveredItem(null);
          setFlyoutPosition(null);
        }}
        className={`w-full h-[44px] rounded-[10px] flex items-center gap-3 px-3.5 transition-all duration-150 group font-['Poppins',sans-serif] ${
          isSubActive 
            ? 'bg-[#4EBEE3]/12 shadow-sm ring-1 ring-[#4EBEE3]/25' 
            : 'hover:bg-gray-50'
        }`}
      >
        <SubIcon 
          size={17} 
          strokeWidth={1.7}
          className={`${isSubActive ? 'text-[#4EBEE3]' : 'text-[#6B7280] group-hover:text-[#4EBEE3]'} transition-colors`}
        />
        <span className={`text-[12.5px] font-medium ${
          isSubActive ? 'text-[#4EBEE3]' : 'text-[#16274D] group-hover:text-[#4EBEE3]'
        } transition-colors`}>
          {subItem.label}
        </span>
      </button>
    );
  })}
</div>
```

**Flyout Sub-Item Specifications:**
- **Height:** 44px
- **Border Radius:** 10px (rounded-[10px])
- **Padding:** 14px horizontal (px-3.5)
- **Gap:** 12px between icon and text
- **Icon Size:** 17px
- **Font:** 12.5px Poppins medium
- **Active State:** Light blue background (12% opacity), subtle shadow, 1px ring (25% opacity)
- **Hover State:** Gray-50 background (when not active)
- **Transitions:** 150ms duration

#### **Hover Delay Logic**
The flyout uses a timeout to prevent accidental closes:

```tsx
const handleMouseLeaveItem = () => {
  // Set a timeout before closing - allows moving to flyout
  hoverTimeoutRef.current = setTimeout(() => {
    setHoveredItem(null);
    setFlyoutPosition(null);
  }, 100);
};

const handleMouseEnterFlyout = () => {
  // Clear any pending timeout when entering flyout
  if (hoverTimeoutRef.current) {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
  }
};

const handleMouseLeaveFlyout = () => {
  // Close immediately when leaving flyout
  setHoveredItem(null);
  setFlyoutPosition(null);
};
```

**Hover Behavior:**
1. **Mouse enters menu item:** Flyout appears immediately (if item has sub-items)
2. **Mouse leaves menu item:** 100ms delay before closing (allows moving to flyout)
3. **Mouse enters flyout:** Cancel any pending close timeout
4. **Mouse leaves flyout:** Close immediately

This creates a smooth UX where users can move from the menu item to the flyout without it disappearing.

#### **Click Behavior**
- **Expanded Sidebar:** Clicking parent item toggles inline sub-items (chevron rotates)
- **Collapsed Sidebar:** Clicking parent item does nothing (hover reveals flyout)
- **Sub-Item Click (either state):** Navigates to page and closes flyout (if open)

---

### Main Navigation Item
```tsx
/* Default State */
<button className="w-full h-[48px] rounded-[14px] flex items-center gap-3 px-3 hover:bg-gray-50 transition-all duration-200 group font-['Poppins',sans-serif]">
  <Icon size={20} strokeWidth={1.67} className="text-[#16274D] group-hover:text-[#4EBEE3] transition-colors" />
  <span className="flex-1 text-left text-[13px] font-medium text-[#16274D] group-hover:text-[#4EBEE3] transition-colors">
    Menu Item
  </span>
</button>

/* Active State */
<button className="w-full h-[48px] rounded-[14px] flex items-center gap-3 px-3 bg-[#4EBEE3] shadow-[0px_10px_15px_-3px_rgba(78,190,227,0.3),0px_4px_6px_-4px_rgba(78,190,227,0.3)] font-['Poppins',sans-serif]">
  <Icon size={20} strokeWidth={1.67} className="text-white" />
  <span className="flex-1 text-left text-[13px] font-medium text-white">
    Active Item
  </span>
</button>
```

### Sub-Navigation Item
```tsx
/* Default State */
<button className="w-full h-[42px] rounded-[10px] flex items-center gap-3 px-3 pl-4 hover:bg-gray-50/80 transition-all duration-150 font-['Poppins',sans-serif]">
  <Icon size={17} strokeWidth={1.7} className="text-[#6B7280] group-hover:text-[#4EBEE3] transition-colors" />
  <span className="text-[12.5px] font-medium text-[#16274D] group-hover:text-[#4EBEE3] transition-colors">
    Sub Item
  </span>
</button>

/* Active State */
<button className="w-full h-[42px] rounded-[10px] flex items-center gap-3 px-3 pl-4 bg-[#4EBEE3]/12 shadow-sm ring-1 ring-[#4EBEE3]/25 font-['Poppins',sans-serif]">
  <Icon size={17} strokeWidth={1.7} className="text-[#4EBEE3]" />
  <span className="text-[12.5px] font-medium text-[#4EBEE3]">
    Active Sub Item
  </span>
</button>
```

### User Profile Card (Bottom of Sidebar)
```tsx
<div className="border-t border-gray-200 px-4 py-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors">
  {/* Avatar */}
  <div className="w-10 h-10 rounded-full bg-[#4EBEE3] flex items-center justify-center">
    <User size={20} className="text-white" strokeWidth={2} />
  </div>
  
  {/* User Info (expanded state only) */}
  <div className="flex-1">
    <p className="text-[13px] text-[#16274D] font-semibold font-['Poppins',sans-serif]">
      Admin
    </p>
    <p className="text-[11px] text-[#16274D]/60 font-['Poppins',sans-serif]">
      admin@careinn.com
    </p>
  </div>
  
  {/* Chevron */}
  <ChevronUp size={16} className="text-[#16274D]/40" />
</div>
```

---

## 📑 Pill Tabs Design Pattern

This is the **signature navigation pattern** used on most pages in CareInn.

### Implementation
```tsx
<div className="border-b-2 border-gray-200 px-2 pt-2 flex gap-1 overflow-x-auto">
  {/* Active Tab */}
  <button className="px-6 py-3 font-['Poppins',sans-serif] text-[14px] font-medium rounded-t-lg bg-[#4EBEE3] text-white transition-all">
    Active Tab
  </button>
  
  {/* Inactive Tab */}
  <button className="px-6 py-3 font-['Poppins',sans-serif] text-[14px] font-medium rounded-t-lg text-[#16274D] hover:bg-gray-50 transition-all">
    Inactive Tab
  </button>
</div>
```

### Visual Style
- **Container:** 2px bottom border (gray-200), 2px top padding, 8px horizontal padding
- **Active Tab:** CareInn blue (#4EBEE3) background, white text, rounded top corners (8px)
- **Inactive Tab:** No background, dark navy text, hover gray-50 background
- **Tab Padding:** 24px horizontal, 12px vertical
- **Font:** 14px Poppins, font-weight 500

---

## 🎯 Page Title Pattern

Every page should start with this consistent header pattern:

```tsx
<div className="flex items-center gap-3 mb-6">
  {/* Icon Container */}
  <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
    <Icon size={20} className="text-[#4EBEE3]" />
  </div>
  
  {/* Page Title */}
  <h1 className="text-[24px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
    Page Title
  </h1>
</div>
```

### Specifications
- **Icon Container:** 40px × 40px, rounded-lg (8px), light blue background (10% opacity)
- **Icon:** 20px size, CareInn blue color
- **Title:** 24px Poppins, font-weight 600, dark navy color
- **Spacing:** 12px gap between icon and title, 24px margin bottom

---

## 📋 Form Components

### Text Input
```tsx
<input 
  type="text"
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all bg-white"
  placeholder="Enter value..."
/>
```

**Specifications:**
- **Padding:** 16px horizontal, 10px vertical (py-2.5)
- **Border:** 1px solid gray-300, rounded-lg (8px)
- **Font:** 14px Poppins
- **Focus State:** 2px ring with 50% opacity CareInn blue, border changes to full blue
- **Placeholder:** gray-400 color

### Textarea
```tsx
<textarea 
  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] resize-none transition-all"
  rows={4}
  placeholder="Enter description..."
/>
```

### Label
```tsx
<label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
  Field Label
</label>
```

---

## ✅ Checkbox (Safari-Friendly)

CareInn uses a custom checkbox style that works perfectly in Safari:

```tsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="w-5 h-5 border-2 border-gray-300 rounded text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/50 transition-all cursor-pointer"
  />
  <span className="text-[14px] text-[#0F1729] font-['Poppins',sans-serif]">
    Checkbox label
  </span>
</label>
```

### Custom Checkbox Styling (in globals.css)
```css
input[type="checkbox"] {
  accent-color: #4EBEE3;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

input[type="checkbox"]:checked {
  background-color: #4EBEE3 !important;
  border-color: #4EBEE3 !important;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='%23FFFFFF' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e") !important;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

input[type="checkbox"]:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(78, 190, 227, 0.2) !important;
  border-color: #4EBEE3 !important;
}
```

**Specifications:**
- **Size:** 20px × 20px (w-5 h-5)
- **Border:** 2px solid gray-300, rounded (4px)
- **Checked State:** CareInn blue background with white checkmark SVG
- **Focus State:** 3px shadow ring with 20% opacity blue

---

## 📝 Dropdown/Select (Safari-Friendly)

### Single Select Dropdown

```tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

function SingleSelectDropdown({ options, value, onChange, placeholder = "Select option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all bg-white flex items-center justify-between font-['Poppins',sans-serif] text-[14px] cursor-pointer hover:border-gray-400 ${!value ? 'text-gray-400' : 'text-[#16274D]'}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[280px] overflow-hidden font-['Poppins',sans-serif]">
          <div className="overflow-y-auto max-h-[280px]">
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${isSelected ? 'bg-[#4EBEE3]/5' : ''}`}
                >
                  <span className={`text-[14px] ${isSelected ? 'text-[#4EBEE3] font-medium' : 'text-[#16274D]'}`}>
                    {option.label}
                  </span>
                  {isSelected && <Check size={16} className="text-[#4EBEE3]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Multi-Select Dropdown (with checkboxes)

```tsx
function MultiSelectDropdown({ options, selectedValues, onChange, placeholder = "Select options" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const handleToggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : normalizedOptions
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label)
        .join(', ');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] bg-white flex items-center justify-between font-['Poppins',sans-serif] cursor-pointer hover:border-gray-400 ${selectedValues.length === 0 ? 'text-gray-400' : 'text-[#16274D]'}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[280px] overflow-hidden font-['Poppins',sans-serif]">
          <div className="overflow-y-auto max-h-[280px]">
            {normalizedOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggleOption(option.value)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Custom Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#4EBEE3] border-[#4EBEE3]' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[14px] text-[#16274D]">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Specifications:**
- **Trigger Button:** Full width, 14px text, gray-300 border, rounded-lg
- **Padding:** Single select: py-1.5 px-3, Multi select: py-2.5 px-4
- **Dropdown Menu:** White background, gray-200 border, rounded-lg, shadow-lg
- **Max Height:** 280px with overflow-y-auto
- **Selected Item:** Light blue background (#4EBEE3/5), blue text, checkmark icon
- **Hover State:** Gray-50 background
- **Checkbox:** 20px × 20px, CareInn blue when checked, white checkmark

---

## 🪟 Modal Style

```tsx
<>
  {/* Backdrop */}
  <div 
    className="fixed inset-0 bg-black/50 z-50"
    onClick={onClose}
  />
  
  {/* Modal Container */}
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div 
      className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-[18px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
          Modal Title
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      {/* Modal Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Modal content goes here */}
      </div>
      
      {/* Modal Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
        <button className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors">
          Cancel
        </button>
        <button className="px-5 py-2 bg-[#4EBEE3] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-[#3DA8CC] transition-colors">
          Confirm
        </button>
      </div>
    </div>
  </div>
</>
```

**Specifications:**
- **Backdrop:** Fixed position, black with 50% opacity, z-index 50
- **Modal Container:** Centered with flexbox, 4rem padding
- **Modal:** White background, rounded-xl (16px), shadow-2xl, max-width 672px (2xl)
- **Max Height:** 90vh with flex column layout
- **Header:** 24px horizontal padding, 16px vertical, bottom border
- **Body:** Scrollable (overflow-y-auto), 24px horizontal padding, 16px vertical
- **Footer:** Right-aligned buttons with 12px gap, top border
- **Title:** 18px Poppins semibold, dark navy color
- **Close Button:** Hover gray-100 background, rounded-lg

---

## 📊 Table Style

```tsx
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <table className="w-full">
    {/* Table Header */}
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-[13px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
          Column Name
        </th>
        <th className="px-6 py-3 text-left text-[13px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
          Another Column
        </th>
        <th className="px-6 py-3 text-right text-[13px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
          Actions
        </th>
      </tr>
    </thead>
    
    {/* Table Body */}
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-[14px] text-[#0F1729] font-['Poppins',sans-serif]">
          Cell content
        </td>
        <td className="px-6 py-4 text-[14px] text-[#0F1729] font-['Poppins',sans-serif]">
          More content
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
              <Edit2 size={16} className="text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
              <Trash2 size={16} className="text-red-600" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Specifications:**
- **Container:** White background, gray-200 border, rounded-lg, overflow hidden
- **Header Row:** Gray-50 background, bottom border gray-200
- **Header Cell:** 24px horizontal padding, 12px vertical, 13px font semibold, left-aligned
- **Body Row:** Hover gray-50 background, divide-y with gray-200
- **Body Cell:** 24px horizontal padding, 16px vertical, 14px font normal
- **Action Buttons:** 6px padding, hover background, rounded

### Table with Status Badge
```tsx
<td className="px-6 py-4">
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[13px] font-medium font-['Poppins',sans-serif]">
    <div className="w-2 h-2 rounded-full bg-green-500" />
    Active
  </span>
</td>
```

---

## 🔘 Button Styles

### Primary Button
```tsx
<button className="px-5 py-2 bg-[#4EBEE3] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-[#3DA8CC] transition-colors">
  Primary Action
</button>
```

### Secondary Button (Outline)
```tsx
<button className="px-5 py-2 border-2 border-[#4EBEE3] text-[#4EBEE3] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-[#4EBEE3]/10 transition-colors">
  Secondary Action
</button>
```

### Tertiary Button (Ghost)
```tsx
<button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors">
  Tertiary Action
</button>
```

### Icon Button
```tsx
<button className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center hover:bg-[#4EBEE3]/20 transition-colors">
  <Icon size={20} className="text-[#4EBEE3]" />
</button>
```

### Danger Button
```tsx
<button className="px-5 py-2 bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-red-700 transition-colors">
  Delete
</button>
```

**Button Specifications:**
- **Primary:** CareInn blue background, white text, hover darker blue
- **Secondary:** 2px blue border, blue text, hover light blue background
- **Tertiary:** No border/background, gray text, hover gray background
- **Icon:** 40px square, light blue background, centered icon
- **Padding:** 20px horizontal (primary/secondary), 16px horizontal (tertiary), 8px vertical
- **Font:** 14px Poppins, font-weight 500
- **Border Radius:** 8px (rounded-lg)
- **Transition:** Color transitions with 150-200ms duration

---

## 🎴 Card Containers

### Standard Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-[18px] font-semibold text-[#0F1729] mb-4 font-['Poppins',sans-serif]">
    Card Title
  </h3>
  {/* Card content */}
</div>
```

### Hover Card (Interactive)
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#4EBEE3] hover:shadow-md transition-all cursor-pointer">
  {/* Card content */}
</div>
```

### Card with Header
```tsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  {/* Card Header */}
  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
    <h3 className="text-[16px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
      Card Title
    </h3>
  </div>
  
  {/* Card Body */}
  <div className="p-6">
    {/* Card content */}
  </div>
</div>
```

**Card Specifications:**
- **Background:** White (#FFFFFF)
- **Border:** 1px solid gray-200
- **Border Radius:** 8px (rounded-lg)
- **Padding:** 24px (p-6) standard, 16px (p-4) compact
- **Hover State:** Border changes to CareInn blue, subtle shadow appears
- **Title:** 18px font-semibold for standalone cards, 16px for cards with headers

---

## 🎨 Page Content Container

The standard wrapper for page content:

```tsx
<div className="min-h-screen bg-[#F8FAFC]">
  {/* Page Content Container */}
  <div className="p-8 max-w-[1600px] mx-auto">
    {/* Page Title */}
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
        <Icon size={20} className="text-[#4EBEE3]" />
      </div>
      <h1 className="text-[24px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
        Page Title
      </h1>
    </div>
    
    {/* Pill Tabs (if needed) */}
    <div className="border-b-2 border-gray-200 px-2 pt-2 flex gap-1 overflow-x-auto mb-6">
      {/* Tabs here */}
    </div>
    
    {/* Main Content Area */}
    <div className="space-y-6">
      {/* Cards, tables, forms go here */}
    </div>
  </div>
</div>
```

**Container Specifications:**
- **Outer Container:** Full viewport height, light gray background (#F8FAFC)
- **Content Container:** 32px padding (p-8), max-width 1600px, centered
- **Page Title:** 24px margin bottom (mb-6)
- **Content Spacing:** 24px gap between sections (space-y-6)

---

## 🔍 Search Input

```tsx
<div className="relative">
  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
  <input 
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all"
  />
</div>
```

**Specifications:**
- **Icon:** 18px search icon, positioned absolute left with 12px padding
- **Input:** 40px left padding (to accommodate icon), 16px right padding
- **Placeholder:** Gray-400 color
- **Focus:** Same as standard input (ring + border color change)

---

## 🏷️ Badge/Tag Components

### Status Badge
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[13px] font-medium font-['Poppins',sans-serif]">
  <div className="w-2 h-2 rounded-full bg-green-500" />
  Active
</span>
```

### Count Badge
```tsx
<span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-[#4EBEE3] text-white text-[12px] font-semibold font-['Poppins',sans-serif]">
  5
</span>
```

### Color Variants
```tsx
/* Success */
bg-green-100 text-green-700

/* Warning */
bg-amber-100 text-amber-700

/* Error */
bg-red-100 text-red-700

/* Info */
bg-blue-100 text-blue-700

/* Primary */
bg-[#4EBEE3]/10 text-[#4EBEE3]
```

**Badge Specifications:**
- **Padding:** 12px horizontal, 4px vertical (status badges)
- **Border Radius:** Full (rounded-full, 9999px)
- **Font:** 13px medium weight for status, 12px semibold for counts
- **Dot Indicator:** 8px circle (w-2 h-2) with darker shade of badge color
- **Minimum Width:** 24px for count badges to maintain circular shape

---

## ⚡ Loading & Empty States

### Spinner (Loading)
```tsx
<div className="flex items-center justify-center py-12">
  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4EBEE3] rounded-full animate-spin" />
</div>
```

### Skeleton Loader
```tsx
<div className="space-y-3 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
  <div className="h-4 bg-gray-200 rounded w-5/6" />
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <Icon size={48} className="text-gray-300 mb-4" />
  <h3 className="text-[16px] font-semibold text-[#0F1729] mb-2 font-['Poppins',sans-serif]">
    No data yet
  </h3>
  <p className="text-[14px] text-gray-500 mb-6 font-['Poppins',sans-serif]">
    Get started by creating your first item
  </p>
  <button className="px-5 py-2 bg-[#4EBEE3] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-[#3DA8CC] transition-colors">
    Create Item
  </button>
</div>
```

---

## 🎭 Icon Usage

**Icon Library:** Lucide React  
**Import:** `import { IconName } from 'lucide-react';`

### Icon Sizes
```tsx
size={16}  // Small (inline with small text, sub-nav)
size={18}  // Medium-small (search icon, smaller UI elements)
size={20}  // Standard (sidebar, buttons, page title icons)
size={24}  // Large (emphasis, section headers)
size={32}  // Extra large (empty states)
size={48}  // Huge (major empty states)
```

### Icon Colors
```tsx
className="text-[#4EBEE3]"      // Primary actions, active states
className="text-[#16274D]"      // Default neutral (sidebar items)
className="text-[#6B7280]"      // Secondary neutral (gray-500)
className="text-gray-400"       // Muted/placeholder
className="text-white"          // On colored backgrounds
className="text-green-500"      // Success
className="text-red-600"        // Error/delete
className="text-amber-500"      // Warning
```

### Stroke Width
```tsx
strokeWidth={1.67}  // Sidebar main items
strokeWidth={1.7}   // Sidebar sub-items
strokeWidth={2}     // Standard buttons, general use
strokeWidth={2.5}   // Emphasis (toggle buttons, checkmarks)
strokeWidth={3}     // Strong emphasis (very rare)
```

---

## 📱 Bilingual Notifications (English + Arabic)

CareInn supports bilingual toast notifications with RTL support:

```tsx
import { toast } from 'sonner@2.0.3';

// English Notification
toast.success('Item created successfully');

// Bilingual Notification (English + Arabic)
toast.success(
  <div className="space-y-1">
    <div>Item created successfully</div>
    <div dir="rtl" className="text-sm opacity-80">تم إنشاء العنصر بنجاح</div>
  </div>
);
```

**Arabic Text Styling:**
- **Font:** Baloo Bhaijaan 2 (automatically applied with dir="rtl")
- **Direction:** RTL (dir="rtl" attribute)
- **Opacity:** Slightly reduced (80%) for secondary language
- **Font Size:** Slightly smaller (text-sm) than primary language

---

## ⚠️ Design Rules & Restrictions

### ❌ PROHIBITED
- **NO gradients** - Use solid colors only
- **NO text shadows** - Keep text clean
- **NO multiple brand colors** - Only #4EBEE3 as primary
- **NO neon/bright colors** - Maintain professional palette
- **NO custom font sizes** unless explicitly needed - Use defined scale

### ✅ REQUIRED
- **Poppins font** for all English text
- **Baloo Bhaijaan 2 font** for all Arabic/RTL text
- **Consistent spacing** using the spacing scale
- **Hover states** on all interactive elements
- **Focus states** with CareInn blue ring
- **Transition animations** (150-300ms duration)
- **Safari compatibility** for all form elements

---

## 🔧 Technical Implementation Notes

### Tailwind CSS Classes
The design uses Tailwind CSS v4 with the following common patterns:

```css
/* Layout */
flex, items-center, justify-between, gap-3

/* Spacing */
p-6 (padding: 24px)
px-4 py-2 (padding: 16px 8px)
mb-6 (margin-bottom: 24px)
space-y-6 (vertical gap: 24px between children)

/* Colors */
bg-white, bg-gray-50, bg-[#4EBEE3]
text-[#0F1729], text-[#16274D], text-gray-500
border-gray-200, border-[#4EBEE3]

/* Typography */
text-[14px] (14px font size)
font-medium (font-weight: 500)
font-semibold (font-weight: 600)
font-['Poppins',sans-serif]

/* Borders & Radius */
border, border-2
rounded-lg (8px), rounded-xl (16px), rounded-full (9999px)

/* Effects */
hover:bg-gray-50
focus:ring-2 focus:ring-[#4EBEE3]/50
transition-colors, transition-all
shadow-lg, shadow-2xl
```

### Custom CSS Variables (in globals.css)
```css
:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: #212121;
  /* ... other variables */
}
```

### Responsive Behavior
```css
/* Mobile First Approach */
.page-container {
  padding: 24px; /* Mobile */
}

@media (min-width: 768px) {
  .page-container {
    padding: 32px; /* Tablet+ */
  }
}

/* Sidebar Responsive */
.sidebar {
  /* Hidden on mobile, shown as overlay when menu is open */
  max-lg:hidden
  
  /* Fixed overlay on mobile when open */
  fixed left-0 top-0 z-50 (when isMobileMenuOpen)
}
```

---

## 📝 Quick Reference Checklist

When building a new page, ensure you have:

- [ ] **Page container** with light gray background (#F8FAFC)
- [ ] **Content padding** of 32px (p-8) with max-width 1600px
- [ ] **Page title** with icon (40px container, 24px title)
- [ ] **Pill tabs** if navigation is needed (border-b-2, rounded-t-lg)
- [ ] **White cards** with gray-200 borders and 24px padding
- [ ] **Consistent spacing** using the spacing scale (mb-6, space-y-6)
- [ ] **Poppins font** applied to all text elements
- [ ] **Form inputs** with focus ring (#4EBEE3 with 50% opacity)
- [ ] **Buttons** with hover states and transitions
- [ ] **Icons** from Lucide React with correct sizes (20px standard)
- [ ] **Checkboxes** with custom CareInn blue styling
- [ ] **Dropdowns** that close on outside click
- [ ] **Modals** with backdrop, proper z-index, and rounded corners
- [ ] **Tables** with hover row effect and proper padding
- [ ] **Empty states** for no-data scenarios
- [ ] **Safari-friendly** form elements

---

## 🎯 Design System Summary

**Core Identity:**
- **Primary Color:** #4EBEE3 (CareInn Blue)
- **Sidebar:** White background with blue active states
- **Page Background:** #F8FAFC (Light gray)
- **Font:** Poppins (English), Baloo Bhaijaan 2 (Arabic)
- **Border Radius:** 8px standard, 14px for nav items, 16px for modals
- **Spacing:** 24px (cards), 32px (page padding), 12px (gaps)

**Key Patterns:**
- **Pill Tabs:** Blue active tab, rounded top corners
- **Page Title:** Icon + 24px text, 24px bottom margin
- **Cards:** White background, gray border, 24px padding
- **Forms:** Gray borders, blue focus ring, 14px text
- **Buttons:** Primary blue, hover darker, 14px text, rounded-lg
- **Modals:** White, rounded-xl, shadow-2xl, max-w-2xl
- **Tables:** Gray-50 header, hover row, 24px cell padding
- **Sidebar:** 240px expanded, 82px collapsed, blue active state

---

This guide provides everything needed to replicate the CareInn design system in a new Figma Make file. Follow these specifications exactly to maintain design consistency across the entire application.