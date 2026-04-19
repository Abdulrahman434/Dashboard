# CareInn Sidebar Styling Reference

**PROTECTED COMPONENT - DO NOT MODIFY WITHOUT EXPLICIT APPROVAL**

## Overview
This document serves as the definitive reference for the CollapsibleSidebar component styling. The sidebar should NEVER be modified when deleting pages or making other changes to the application.

## File Location
`/components/CollapsibleSidebar.tsx`

## Key Styling Properties

### Colors
- **Background**: White (`bg-white`)
- **Border**: Gray-200 (`border-gray-200`)
- **Active Item Background**: CareInn Blue (`#4ebee3`) with shadow
- **Active Item Text**: White (`text-white`)
- **Inactive Item Text**: Dark Blue (`#16274D`)
- **Hover Background**: Light Gray (`bg-gray-50`)
- **Hover Text**: CareInn Blue (`#4ebee3`)
- **Toggle Button**: CareInn Blue (`#4ebee3`) with white border
- **Logout**: Red (`#EF4444`)

### Logo Dimensions
- **Expanded State**: 170px × 85px
- **Collapsed State**: 70px × 88px
- **Logo Asset**: `figma:asset/1527704e7ade377192f897bbb5d87c3293623da3.png`

### Sidebar Dimensions
- **Expanded Width**: 255px
- **Collapsed Width**: 82px
- **Logo Container Height**: 100px
- **Logout Section Height**: 77px

### Navigation Items
- **Item Height**: 48px
- **Sub-item Height**: 40px
- **Border Radius**: 14px (main items), 10px (sub-items)
- **Icon Size**: 20px (main), 16px (sub-items)
- **Font Size**: 14px (main items), 13px (sub-items)

### Toggle Button
- **Size**: 32px × 32px (w-8 h-8)
- **Position**: Absolute, -16px from right edge (`-right-4`)
- **Style**: Circular with white border
- **Icon**: ChevronLeft/ChevronRight, size 18px

### Shadow Effects
- **Sidebar Shadow**: `0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)`
- **Active Item Shadow**: `0px_10px_15px_-3px_rgba(78,190,227,0.3),0px_4px_6px_-4px_rgba(78,190,227,0.3)`
- **Flyout Shadow**: `0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_10px_10px_-5px_rgba(0,0,0,0.04)`

### Flyout Menu (Collapsed State)
- **Minimum Width**: 260px
- **Border Radius**: 12px (`rounded-xl`)
- **Padding**: 14px (py-3.5) × 10px (px-2.5)
- **Z-Index**: 9999
- **Gap from Sidebar**: 12px

## Protected Features
1. **Logo always visible** in both collapsed and expanded states
2. **Smooth transitions** between collapsed/expanded states (300ms)
3. **Blue accent colors** for all interactive elements
4. **Flyout menus** appear on hover when collapsed
5. **External links** show ExternalLink icon
6. **Chevron indicators** show in blue for expandable items

## DO NOT
- ❌ Change the background from white to dark colors
- ❌ Modify logo dimensions or visibility
- ❌ Change the blue accent color (#4ebee3)
- ❌ Remove the circular toggle button
- ❌ Alter shadow effects
- ❌ Modify the flyout menu behavior
- ❌ Change border colors from gray-200
- ❌ Remove smooth transitions

## Navigation Items Structure
The navigation items array should only be modified to:
- ✅ Add new navigation items
- ✅ Remove deprecated pages
- ✅ Update labels or icons
- ✅ Add/modify sub-items

## Version History
- **v2.0** (2024-12-10): Stable version with protected styling
  - Light theme with white background
  - Blue toggle button on right edge
  - Logo visible in all states
  - Smooth transitions and flyout menus

## Emergency Recovery
If the sidebar styling is accidentally modified:
1. Restore from this reference document
2. Ensure all color values match the specifications above
3. Verify logo dimensions and visibility
4. Check toggle button styling and position
5. Test collapsed/expanded state transitions
6. Verify flyout menu functionality

## Contact
For any sidebar modifications or questions, please consult the design system documentation and obtain explicit approval before making changes.
