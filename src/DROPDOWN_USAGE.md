# Unified Dropdown Component Usage

## Overview
Use the unified dropdown components from `/components/UnifiedDropdown.tsx` for all dropdowns in CareInn. These components are designed to work consistently across all browsers (Safari, Chrome, Firefox, etc.) and follow the CareInn design system.

## Components

### 1. SingleSelectDropdown
For dropdowns where user selects ONE option (replaces native `<select>`).

```tsx
import { SingleSelectDropdown } from './UnifiedDropdown';

<SingleSelectDropdown
  options={['Option 1', 'Option 2', 'Option 3']}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  placeholder="Select option"
/>
```

**With custom labels:**
```tsx
<SingleSelectDropdown
  options={[
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
/>
```

### 2. MultiSelectDropdown
For dropdowns where user selects MULTIPLE options (with checkboxes).

```tsx
import { MultiSelectDropdown } from './UnifiedDropdown';

<MultiSelectDropdown
  options={['Adults', 'Kids', 'VIP']}
  selectedValues={selectedGroups}
  onChange={(values) => setSelectedGroups(values)}
  placeholder="Select groups"
  showSelectAll={true}
/>
```

## Props

### SingleSelectDropdown Props
- `options`: `string[]` or `{ value: string; label: string }[]` - Available options
- `value`: `string` - Currently selected value
- `onChange`: `(value: string) => void` - Callback when selection changes
- `placeholder?`: `string` - Text shown when no selection (default: "Select option")
- `className?`: `string` - Additional CSS classes
- `disabled?`: `boolean` - Disable the dropdown

### MultiSelectDropdown Props
- `options`: `string[]` or `{ value: string; label: string }[]` - Available options
- `selectedValues`: `string[]` - Array of selected values
- `onChange`: `(values: string[]) => void` - Callback when selection changes
- `placeholder?`: `string` - Text shown when no selection (default: "Select options")
- `className?`: `string` - Additional CSS classes
- `disabled?`: `boolean` - Disable the dropdown
- `showSelectAll?`: `boolean` - Show "Select All" option (default: true)

## Migration Guide

### Before (Native Select)
```tsx
<select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="px-4 py-2.5 border rounded-lg..."
>
  <option value="All">All</option>
  <option value="Active">Active</option>
  <option value="Inactive">Inactive</option>
</select>
```

### After (Unified Dropdown)
```tsx
<SingleSelectDropdown
  options={['All', 'Active', 'Inactive']}
  value={status}
  onChange={(value) => setStatus(value)}
/>
```

## Design Specifications
- **Border**: 1px solid #D1D5DB (gray-300)
- **Border Radius**: 8px (rounded-lg)
- **Padding**: 10px 16px (py-2.5 px-4)
- **Font**: Poppins, 14px
- **Focus**: 2px ring #4EBEE3/50, border #4EBEE3
- **Hover**: Border #9CA3AF (gray-400)
- **Selected Item**: Background #4EBEE3/5, text #4EBEE3
- **Checkbox**: 20px, #4EBEE3 when selected
- **Max Height**: 280px with scroll

## Browser Compatibility
✅ Chrome/Edge (Chromium)
✅ Firefox
✅ Safari (macOS/iOS)
✅ All modern browsers

## Why Not Native Select?
- Native `<select>` elements have inconsistent styling across browsers (especially Safari)
- Cannot fully customize appearance in Safari
- Limited control over dropdown menu appearance
- Inconsistent dropdown arrow styling
- Checkbox support requires custom component anyway
