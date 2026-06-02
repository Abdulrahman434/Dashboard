# CareInn Design System Guide
## Complete Brand Identity & Style Guidelines

---

## 📋 Table of Contents
1. [Brand Philosophy](#brand-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Design Principles](#design-principles)
7. [UI Patterns](#ui-patterns)
8. [Iconography](#iconography)
9. [Forms & Inputs](#forms--inputs)
10. [Tables & Data Display](#tables--data-display)
11. [Modals & Overlays](#modals--overlays)
12. [States & Feedback](#states--feedback)
13. [Animation & Motion](#animation--motion)
14. [Accessibility](#accessibility)
15. [Responsive Design](#responsive-design)
16. [Do's and Don'ts](#dos-and-donts)

---

## 🎯 Brand Philosophy

### Design Spirit
CareInn embodies a **modern, professional healthcare management platform** inspired by best-in-class SaaS products like Linear, Vercel, and Notion.

**Core Values:**
- **Clarity over complexity** - Clean, uncluttered interfaces
- **Consistency over creativity** - Predictable, familiar patterns
- **Function over decoration** - Every element serves a purpose
- **Efficiency over aesthetics** - Fast, productive workflows

**Visual Personality:**
- Modern & minimal
- Professional & trustworthy
- Efficient & focused
- Clean & organized
- Enterprise-grade quality

---

## 🎨 Color System

### Primary Colors

#### Brand Primary: Sky Blue
```css
--primary: #4EBEE3;           /* Main brand color */
--primary-hover: #3DA8CC;     /* Hover states */
--primary-light: #4EBEE3/10;  /* Backgrounds */
--primary-border: #4EBEE3/30; /* Borders */
```

**Usage:**
- Primary actions (buttons, links)
- Active states
- Focus indicators
- Brand elements
- Icons (selectively)

#### Sidebar Dark: Navy Blue
```css
--sidebar-bg: #0F1729;        /* Sidebar background */
--sidebar-text: #FFFFFF;      /* Sidebar text */
--sidebar-hover: #1A2332;     /* Sidebar hover */
--sidebar-active: #4EBEE3;    /* Active sidebar item */
```

### Neutral Colors

#### Text Colors
```css
--text-primary: #0F1729;      /* Primary text */
--text-secondary: #16274D;    /* Secondary text */
--text-tertiary: #64748B;     /* Tertiary/muted text */
--text-disabled: #94A3B8;     /* Disabled text */
```

#### Background Colors
```css
--bg-primary: #FFFFFF;        /* Main background */
--bg-secondary: #F8FAFC;      /* Secondary background */
--bg-tertiary: #F1F5F9;       /* Tertiary background */
--bg-hover: #F1F5F9;          /* Hover backgrounds */
```

#### Border Colors
```css
--border-light: #E2E8F0;      /* Light borders */
--border-medium: #CBD5E1;     /* Medium borders */
--border-dark: #94A3B8;       /* Dark borders */
```

### Semantic Colors

#### Success
```css
--success: #10B981;           /* Success green */
--success-bg: #D1FAE5;        /* Success background */
--success-border: #6EE7B7;    /* Success border */
```

#### Warning
```css
--warning: #F59E0B;           /* Warning orange */
--warning-bg: #FEF3C7;        /* Warning background */
--warning-border: #FCD34D;    /* Warning border */
```

#### Error
```css
--error: #EF4444;             /* Error red */
--error-bg: #FEE2E2;          /* Error background */
--error-border: #FCA5A5;      /* Error border */
```

#### Info
```css
--info: #3B82F6;              /* Info blue */
--info-bg: #DBEAFE;           /* Info background */
--info-border: #93C5FD;       /* Info border */
```

### ❌ PROHIBITED ELEMENTS

**NEVER USE:**
- ❌ Gradients (explicitly forbidden)
- ❌ Shadows on text
- ❌ Multiple brand colors
- ❌ Neon colors
- ❌ Color overlays

**ALWAYS USE:**
- ✅ Solid colors only
- ✅ Subtle box shadows for elevation
- ✅ Single primary brand color (#4EBEE3)

---

## 📝 Typography

### Font Family
```css
font-family: 'Poppins', sans-serif;
```

**Poppins** is used exclusively across the entire application.

### Font Sizes

#### Headings
```css
--text-page-title: 24px;      /* Page titles */
--text-section-title: 18px;   /* Section headers */
--text-card-title: 16px;      /* Card titles */
--text-subsection: 14px;      /* Subsection headers */
```

#### Body Text
```css
--text-body: 14px;            /* Standard body text */
--text-small: 13px;           /* Small text */
--text-tiny: 12px;            /* Captions, labels */
--text-micro: 11px;           /* Meta info */
```

### Font Weights
```css
--weight-normal: 400;         /* Body text */
--weight-medium: 500;         /* Emphasis */
--weight-semibold: 600;       /* Headings, buttons */
--weight-bold: 700;           /* Strong emphasis (rare) */
```

### Line Heights
```css
--leading-tight: 1.2;         /* Headings */
--leading-normal: 1.5;        /* Body text */
--leading-relaxed: 1.75;      /* Long-form content */
```

### Typography Hierarchy

#### Page Title
```css
font-size: 24px;
font-weight: 600;
color: #0F1729;
line-height: 1.2;
```

#### Section Header
```css
font-size: 18px;
font-weight: 600;
color: #0F1729;
line-height: 1.3;
```

#### Card Title
```css
font-size: 16px;
font-weight: 600;
color: #0F1729;
line-height: 1.4;
```

#### Body Text
```css
font-size: 14px;
font-weight: 400;
color: #0F1729;
line-height: 1.5;
```

#### Small/Meta Text
```css
font-size: 13px;
font-weight: 400;
color: #64748B;
line-height: 1.5;
```

### ⚠️ IMPORTANT TYPOGRAPHY RULES

**DO NOT override typography unless explicitly requested:**
- ❌ Do not add custom font-size classes
- ❌ Do not add custom font-weight classes
- ❌ Do not add custom line-height classes

**Default HTML typography is configured in `/styles/globals.css`**

---

## 📐 Spacing & Layout

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Standard Spacing Patterns

#### Card Padding
```css
padding: 24px;                /* Standard card padding */
padding: 20px;                /* Compact card padding */
```

#### Section Spacing
```css
margin-bottom: 32px;          /* Between major sections */
margin-bottom: 24px;          /* Between subsections */
margin-bottom: 16px;          /* Between elements */
```

#### Grid Gaps
```css
gap: 24px;                    /* Card grids */
gap: 16px;                    /* Form fields */
gap: 12px;                    /* Inline elements */
gap: 8px;                     /* Tight groups */
```

### Layout Dimensions

#### Viewport
- **Target Resolution:** 1920x1080 (Full HD)
- **Minimum Width:** 1280px
- **Content Width:** Fluid with max-width constraints

#### Sidebar
```css
width: 280px;                 /* Expanded sidebar */
width: 64px;                  /* Collapsed sidebar */
```

#### Content Area
```css
margin-left: 280px;           /* With expanded sidebar */
padding: 32px 40px;           /* Content padding */
max-width: 1600px;            /* Maximum content width */
```

### Border Radius
```css
--radius-sm: 4px;             /* Small elements */
--radius-md: 8px;             /* Buttons, inputs */
--radius-lg: 12px;            /* Cards, modals */
--radius-xl: 16px;            /* Large containers */
--radius-full: 9999px;        /* Pills, badges */
```

---

## 🧩 Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="px-5 py-2 bg-[#4EBEE3] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-[#3DA8CC] transition-colors">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="px-5 py-2 border-2 border-[#4EBEE3] text-[#4EBEE3] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-[#4EBEE3]/10 transition-colors">
  Secondary Action
</button>
```

#### Tertiary Button
```tsx
<button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors">
  Tertiary Action
</button>
```

#### Icon Button
```tsx
<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
  <Icon size={20} className="text-gray-600" />
</button>
```

### Cards

#### Standard Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <h3 className="text-[18px] font-semibold text-[#0F1729] mb-4">
    Card Title
  </h3>
  {/* Card content */}
</div>
```

#### Hover Card
```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#4EBEE3] hover:shadow-md transition-all cursor-pointer">
  {/* Card content */}
</div>
```

### Badges

#### Status Badge
```tsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[13px] font-medium font-['Poppins',sans-serif]">
  Active
</span>
```

#### Count Badge
```tsx
<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#4EBEE3] text-white text-[12px] font-semibold font-['Poppins',sans-serif]">
  5
</span>
```

---

## 🎯 Design Principles

### 1. Consistency First
- Use the same patterns across all pages
- Reuse existing components
- Follow established conventions

### 2. Clean & Minimal
- Remove unnecessary elements
- Use whitespace generously
- Avoid visual clutter

### 3. Hierarchy Through Typography
- Use size to indicate importance
- Limit font weights (normal, medium, semibold)
- Maintain consistent spacing

### 4. Functional Color Use
- Color communicates meaning
- Primary blue for actions
- Semantic colors for states
- Neutral colors for content

### 5. Predictable Interactions
- Hover states on interactive elements
- Consistent transition timing
- Clear focus indicators
- Obvious clickable areas

### 6. Information Density
- Balance whitespace and content
- Group related information
- Use cards to separate sections
- Progressive disclosure for complex data

---

## 🎨 UI Patterns

### Pill Tabs (Signature Pattern)

```tsx
<div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
  <button className="px-4 py-2 rounded-md bg-white shadow-sm text-[14px] font-medium text-[#0F1729] font-['Poppins',sans-serif]">
    Active Tab
  </button>
  <button className="px-4 py-2 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#0F1729] font-['Poppins',sans-serif] transition-colors">
    Inactive Tab
  </button>
  <button className="px-4 py-2 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#0F1729] font-['Poppins',sans-serif] transition-colors">
    Another Tab
  </button>
</div>
```

**Usage:**
- Page-level navigation
- Filter toggles
- View switchers
- Category selection

### Page Title with Icon

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

### Inline Editing Pattern

```tsx
// View Mode
<div className="group relative">
  <span className="text-[14px] text-[#0F1729]">
    Editable Value
  </span>
  <button className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
    <Edit2 size={14} className="text-gray-400" />
  </button>
</div>

// Edit Mode
<input 
  className="px-3 py-1.5 border border-[#4EBEE3] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent"
  autoFocus
/>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12">
  <Icon size={48} className="text-gray-300 mb-4" />
  <h3 className="text-[16px] font-semibold text-[#0F1729] mb-2 font-['Poppins',sans-serif]">
    No data yet
  </h3>
  <p className="text-[14px] text-gray-500 mb-6 font-['Poppins',sans-serif]">
    Get started by creating your first item
  </p>
  <button className="px-5 py-2 bg-[#4EBEE3] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium">
    Create Item
  </button>
</div>
```

### Dropdown/Select Pattern

```tsx
<div className="relative">
  <button className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-[14px] font-['Poppins',sans-serif] flex items-center justify-between hover:border-[#4EBEE3] focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent transition-colors">
    <span>Selected Option</span>
    <ChevronDown size={16} className="text-gray-400" />
  </button>
  {/* Dropdown menu */}
</div>
```

### Stats/KPI Display

```tsx
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
      Metric Name
    </span>
    <TrendingUp size={16} className="text-green-500" />
  </div>
  <div className="text-[32px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
    1,234
  </div>
  <div className="flex items-center gap-1 mt-2">
    <ArrowUp size={14} className="text-green-500" />
    <span className="text-[13px] text-green-600 font-medium font-['Poppins',sans-serif]">
      +12.5%
    </span>
    <span className="text-[13px] text-gray-500 font-['Poppins',sans-serif]">
      vs yesterday
    </span>
  </div>
</div>
```

---

## 🎭 Iconography

### Icon Library
**Use Lucide React exclusively:**
```tsx
import { Icon } from 'lucide-react';
```

### Icon Sizes
```tsx
size={16}  // Small (inline with text)
size={20}  // Standard (buttons, UI elements)
size={24}  // Large (page titles, emphasis)
size={32}  // Extra large (empty states)
size={48}  // Huge (major empty states)
```

### Icon Colors
```tsx
className="text-[#4EBEE3]"      // Primary actions
className="text-gray-600"        // Neutral
className="text-gray-400"        // Muted
className="text-green-500"       // Success
className="text-red-500"         // Error
className="text-orange-500"      // Warning
```

### Icon Usage Patterns

#### With Text
```tsx
<div className="flex items-center gap-2">
  <Icon size={20} className="text-[#4EBEE3]" />
  <span>Label</span>
</div>
```

#### Icon Button
```tsx
<button className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center hover:bg-[#4EBEE3]/20 transition-colors">
  <Icon size={20} className="text-[#4EBEE3]" />
</button>
```

#### Status Indicators
```tsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
    <Check size={16} className="text-green-600" />
  </div>
  <span>Completed</span>
</div>
```

---

## 📋 Forms & Inputs

### Text Input

```tsx
<div className="space-y-2">
  <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
    Label
  </label>
  <input
    type="text"
    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent transition-all"
    placeholder="Enter value..."
  />
</div>
```

### Textarea

```tsx
<textarea
  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent resize-none transition-all"
  rows={4}
  placeholder="Enter description..."
/>
```

### Select/Dropdown

```tsx
<select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] bg-white focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent transition-all">
  <option>Option 1</option>
  <option>Option 2</option>
  <option>Option 3</option>
</select>
```

### Checkbox

```tsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="w-5 h-5 border-2 border-gray-300 rounded text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3] focus:ring-offset-0 transition-all"
  />
  <span className="text-[14px] text-[#0F1729] font-['Poppins',sans-serif]">
    Checkbox label
  </span>
</label>
```

### Radio Button

```tsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="radio"
    name="group"
    className="w-5 h-5 border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3] focus:ring-offset-0 transition-all"
  />
  <span className="text-[14px] text-[#0F1729] font-['Poppins',sans-serif]">
    Radio label
  </span>
</label>
```

### Toggle/Switch

```tsx
<button 
  className="relative w-11 h-6 bg-gray-300 rounded-full transition-colors"
  aria-checked="false"
>
  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
</button>

// Active state
<button 
  className="relative w-11 h-6 bg-[#4EBEE3] rounded-full transition-colors"
  aria-checked="true"
>
  <span className="absolute left-6 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
</button>
```

### Form Validation States

#### Error
```tsx
<div className="space-y-2">
  <input
    className="w-full px-4 py-2.5 border-2 border-red-500 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-red-500"
  />
  <p className="text-[13px] text-red-600 font-['Poppins',sans-serif] flex items-center gap-1">
    <AlertCircle size={14} />
    This field is required
  </p>
</div>
```

#### Success
```tsx
<div className="space-y-2">
  <input
    className="w-full px-4 py-2.5 border-2 border-green-500 rounded-lg text-[14px] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-green-500"
  />
  <p className="text-[13px] text-green-600 font-['Poppins',sans-serif] flex items-center gap-1">
    <CheckCircle size={14} />
    Looks good!
  </p>
</div>
```

---

## 📊 Tables & Data Display

### Table Structure

```tsx
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-[13px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
          Column Name
        </th>
        {/* More columns */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 text-[14px] text-[#0F1729] font-['Poppins',sans-serif]">
          Cell content
        </td>
        {/* More cells */}
      </tr>
    </tbody>
  </table>
</div>
```

### Table Patterns

#### With Actions
```tsx
<td className="px-6 py-4">
  <div className="flex items-center gap-2">
    <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
      <Edit2 size={16} className="text-gray-600" />
    </button>
    <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
      <Trash2 size={16} className="text-red-600" />
    </button>
  </div>
</td>
```

#### With Status Badge
```tsx
<td className="px-6 py-4">
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-[13px] font-medium font-['Poppins',sans-serif]">
    <div className="w-2 h-2 rounded-full bg-green-500" />
    Active
  </span>
</td>
```

### Pagination

```tsx
<div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
  <div className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
    Showing 1-10 of 100 results
  </div>
  <div className="flex items-center gap-2">
    <button className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
      Previous
    </button>
    <button className="px-3 py-1.5 bg-[#4EBEE3] text-white rounded-md text-[13px] font-medium">
      1
    </button>
    <button className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50 transition-colors">
      2
    </button>
    <button className="px-3 py-1.5 border border-gray-300 rounded-md text-[13px] font-medium hover:bg-gray-50 transition-colors">
      Next
    </button>
  </div>
</div>
```

---

## 🪟 Modals & Overlays

### Modal Structure

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/30" onClick={onClose} />
  
  {/* Modal */}
  <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
    {/* Header */}
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
    
    {/* Body */}
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {/* Modal content */}
    </div>
    
    {/* Footer */}
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
```

### Confirmation Dialog

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 bg-black/30" onClick={onClose} />
  
  <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
    <div className="flex items-start gap-3 p-6">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle size={20} className="text-red-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-[18px] font-semibold text-[#0F1729] font-['Poppins',sans-serif] mb-2">
          Confirm Action
        </h3>
        <p className="text-[14px] text-gray-600 font-['Poppins',sans-serif]">
          Are you sure you want to proceed? This action cannot be undone.
        </p>
      </div>
    </div>
    
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
      <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors">
        Cancel
      </button>
      <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-red-700 transition-colors">
        Delete
      </button>
    </div>
  </div>
</div>
```

### Toast Notification

```tsx
<div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-[#4EBEE3] rounded-lg shadow-lg p-4 max-w-md">
  <div className="flex items-start gap-3">
    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
    <div className="flex-1">
      <h4 className="text-[14px] font-semibold text-[#0F1729] font-['Poppins',sans-serif]">
        Success
      </h4>
      <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif] mt-1">
        Your changes have been saved successfully.
      </p>
    </div>
    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
      <X size={16} className="text-gray-400" />
    </button>
  </div>
</div>
```

---

## ⚡ States & Feedback

### Loading States

#### Spinner
```tsx
<div className="flex items-center justify-center py-12">
  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4EBEE3] rounded-full animate-spin" />
</div>
```

#### Skeleton Loader
```tsx
<div className="space-y-3 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
  <div className="h-4 bg-gray-200 rounded w-5/6" />
</div>
```

#### Loading Button
```tsx
<button className="px-5 py-2 bg-[#4EBEE3] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium flex items-center gap-2 opacity-75 cursor-not-allowed">
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  Loading...
</button>
```

### Disabled States

```tsx
<button className="px-5 py-2 bg-gray-300 text-gray-500 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium cursor-not-allowed" disabled>
  Disabled Button
</button>

<input
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[14px] font-['Poppins',sans-serif] bg-gray-50 text-gray-500 cursor-not-allowed"
  disabled
  value="Disabled input"
/>
```

### Hover States

**All interactive elements must have hover states:**
```css
transition-colors         /* For color changes */
transition-all           /* For multiple properties */
hover:bg-[#3DA8CC]       /* Buttons */
hover:bg-gray-50         /* Table rows, cards */
hover:border-[#4EBEE3]   /* Inputs, selects */
```

### Focus States

```tsx
focus:outline-none
focus:ring-2
focus:ring-[#4EBEE3]
focus:border-transparent
```

---

## 🎬 Animation & Motion

### Transition Timing
```css
transition-all duration-200 ease-in-out    /* Standard */
transition-colors duration-150             /* Color only */
transition-transform duration-300          /* Movement */
```

### Hover Animations

#### Scale on Hover
```tsx
<div className="hover:scale-105 transition-transform cursor-pointer">
  {/* Content */}
</div>
```

#### Shadow on Hover
```tsx
<div className="hover:shadow-lg transition-shadow">
  {/* Content */}
</div>
```

#### Border Highlight
```tsx
<div className="border border-gray-200 hover:border-[#4EBEE3] transition-colors">
  {/* Content */}
</div>
```

### Entrance Animations

```tsx
// Fade in
<div className="animate-in fade-in duration-300">
  {/* Content */}
</div>

// Slide in from right
<div className="animate-in slide-in-from-right duration-300">
  {/* Content */}
</div>
```

### ⚠️ Animation Guidelines

**DO:**
- ✅ Use subtle transitions (200-300ms)
- ✅ Apply to interactive elements
- ✅ Maintain 60fps performance

**DON'T:**
- ❌ Overuse animations
- ❌ Use slow animations (>500ms)
- ❌ Animate on page load (except modals)
- ❌ Auto-play animations

---

## ♿ Accessibility

### Semantic HTML
```tsx
<main>          {/* Main content */}
<nav>           {/* Navigation */}
<header>        {/* Page header */}
<section>       {/* Content sections */}
<article>       {/* Independent content */}
<aside>         {/* Sidebar content */}
```

### ARIA Labels
```tsx
<button aria-label="Close modal">
  <X size={20} />
</button>

<input
  type="text"
  aria-describedby="helper-text"
  aria-invalid={hasError}
/>

<div role="alert" aria-live="polite">
  {/* Alert content */}
</div>
```

### Keyboard Navigation

**All interactive elements must be keyboard accessible:**
```tsx
tabIndex={0}              // Focusable
onKeyDown={handleKey}     // Keyboard handler
```

**Focus indicators must be visible:**
```css
focus:outline-none
focus:ring-2
focus:ring-[#4EBEE3]
```

### Color Contrast

**WCAG AA Compliance (minimum 4.5:1):**
- ✅ #0F1729 on #FFFFFF (15.3:1)
- ✅ #16274D on #FFFFFF (12.1:1)
- ✅ #4EBEE3 on #FFFFFF (2.8:1) ⚠️ Use for non-text only
- ✅ #FFFFFF on #4EBEE3 (3.5:1) ⚠️ Large text only

### Screen Readers

```tsx
<span className="sr-only">
  Hidden text for screen readers
</span>

<img src="..." alt="Descriptive alt text" />

<button>
  <Edit2 size={20} />
  <span className="sr-only">Edit</span>
</button>
```

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px    /* Small tablets */
md: 768px    /* Tablets */
lg: 1024px   /* Small laptops */
xl: 1280px   /* Laptops */
2xl: 1536px  /* Desktop */
```

### Design Target
**Primary:** 1920x1080 (Full HD Desktop)
**Minimum:** 1280px width

### Responsive Patterns

#### Grid Layouts
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

#### Flexible Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>
```

#### Responsive Typography
```tsx
<h1 className="text-[20px] md:text-[24px] lg:text-[28px]">
  Responsive Heading
</h1>
```

### Mobile Considerations

**For CareInn:**
- Desktop-first approach
- Minimum width: 1280px
- Sidebar collapses on smaller screens
- Tables scroll horizontally if needed

---

## ✅ Do's and Don'ts

### Layout & Structure

#### ✅ DO
- Use consistent card-based layouts
- Maintain generous whitespace
- Group related information
- Use clear visual hierarchy
- Keep content width reasonable (<1600px)

#### ❌ DON'T
- Cram content without spacing
- Mix different layout patterns
- Create overly complex grids
- Use full viewport width for content
- Stack too many cards vertically

### Colors

#### ✅ DO
- Use #4EBEE3 for primary actions
- Use semantic colors for status
- Maintain high contrast for text
- Use neutral backgrounds
- Apply colors consistently

#### ❌ DON'T
- ❌ Use gradients (forbidden!)
- ❌ Use multiple brand colors
- ❌ Use color as only indicator
- ❌ Use low-contrast combinations
- ❌ Overuse bright colors

### Typography

#### ✅ DO
- Use Poppins font family
- Follow font size hierarchy
- Maintain consistent line heights
- Use semibold for emphasis
- Keep line length readable

#### ❌ DON'T
- Mix multiple fonts
- Use bold unless necessary
- Use very small text (<11px)
- Use ALL CAPS extensively
- Override default typography

### Components

#### ✅ DO
- Reuse existing components
- Follow established patterns
- Maintain consistent spacing
- Use hover states
- Add loading states

#### ❌ DON'T
- Create one-off components
- Mix different button styles
- Forget hover states
- Ignore disabled states
- Skip error handling

### Interactions

#### ✅ DO
- Provide immediate feedback
- Use subtle transitions
- Show loading indicators
- Confirm destructive actions
- Enable keyboard navigation

#### ❌ DON'T
- Leave users guessing
- Use slow animations
- Hide loading states
- Delete without confirmation
- Block keyboard users

### Accessibility

#### ✅ DO
- Use semantic HTML
- Add ARIA labels
- Maintain focus indicators
- Support keyboard navigation
- Provide alt text

#### ❌ DON'T
- Use divs for buttons
- Remove focus outlines
- Forget screen readers
- Rely only on color
- Skip alt attributes

---

## 🎨 Quick Reference: Common Components

### Standard Page Structure

```tsx
export default function PageName() {
  return (
    <div className="p-10">
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
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <button className="px-4 py-2 rounded-md bg-white shadow-sm text-[14px] font-medium text-[#0F1729]">
          Tab 1
        </button>
        <button className="px-4 py-2 rounded-md text-[14px] font-medium text-gray-600 hover:text-[#0F1729]">
          Tab 2
        </button>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-[18px] font-semibold text-[#0F1729] mb-4">
            Card Title
          </h3>
          {/* Card content */}
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 Additional Resources

### Design Inspiration
- **Linear** - Clean, minimal UI patterns
- **Vercel** - Modern dashboard design
- **Notion** - Flexible content layouts

### Tools
- **Figma** - Design source
- **Tailwind CSS v4** - Styling framework
- **Lucide React** - Icon library
- **Poppins Font** - Typography

### Code Standards
- Use TypeScript (.tsx files)
- Use functional components
- Use Tailwind for all styling
- Use inline styles only for dynamic values
- Follow accessibility guidelines

---

## 🎯 Design Checklist

Before considering a page complete, verify:

**Visual Design:**
- [ ] Poppins font used throughout
- [ ] Primary color #4EBEE3 used correctly
- [ ] No gradients used
- [ ] Solid colors only
- [ ] Consistent spacing (24px cards, etc.)
- [ ] Proper visual hierarchy

**Components:**
- [ ] Pill tabs for navigation (if applicable)
- [ ] Page title with icon
- [ ] Consistent button styles
- [ ] Proper card structure
- [ ] Empty states included

**Interactions:**
- [ ] Hover states on all interactive elements
- [ ] Focus indicators visible
- [ ] Loading states implemented
- [ ] Disabled states styled correctly
- [ ] Transitions are subtle (200-300ms)

**Accessibility:**
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on images

**Responsiveness:**
- [ ] Works at 1920x1080
- [ ] Works at 1280px minimum
- [ ] No horizontal scroll
- [ ] Content readable at all sizes

**Code Quality:**
- [ ] Reused existing components
- [ ] No inline Tailwind font sizes/weights
- [ ] No custom CSS files created
- [ ] TypeScript types used
- [ ] Clean, readable code

---

## 💡 Final Notes

**CareInn is enterprise healthcare software.** Every design decision should reflect:
- **Professionalism** - This is used in hospital environments
- **Reliability** - Users depend on this system
- **Clarity** - Medical staff need quick, accurate information
- **Efficiency** - Minimize clicks and cognitive load

**When in doubt:**
1. Look at existing pages for patterns
2. Keep it simple and clean
3. Maintain consistency over creativity
4. Follow this design system strictly

**Remember:**
> "The best design is invisible. Users should focus on their tasks, not the interface."

---

**Document Version:** 1.0  
**Last Updated:** December 14, 2025  
**Maintained By:** CareInn Design Team
