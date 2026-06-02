# CareInn - Naming Decision for Survey/Feedback Components

## Decision: Keep Current File Names (DO NOT RENAME)

### Status: **FROZEN - DO NOT MODIFY**

---

## Background

We identified a naming inconsistency where:
- **Menu Items** say "Survey Manager" and "Survey Report"
- **Component Files** are named `FeedbackManagerPage.tsx` and `FeedbackReportPage.tsx`

---

## Why We're NOT Renaming

### 1. **Risk to Design**
`FeedbackReportPage.tsx` contains a **beautiful analytics design** that the user loves. When we previously deleted "old code" during cleanup, the design accidentally changed - this caused significant issues. We cannot risk this again.

### 2. **File Size**
- `FeedbackManagerPage.tsx` is **1,615 lines** of complex code
- Contains survey builder with drag-and-drop, multi-step forms, preview system
- Risk of breaking functionality is HIGH

### 3. **Data Persistence**
Both components use localStorage with specific keys:
```typescript
localStorage.getItem('feedback-surveys')
localStorage.getItem('feedback-surveys-version')
```
Renaming could break data persistence logic.

### 4. **Working Code = Don't Touch**
These components are fully functional and tested. "If it ain't broke, don't fix it."

---

## Developer Guidelines

### For Future Developers:

When you see menu items that say **"Survey"**, remember:

| Menu Label | Component File | Why Different? |
|------------|----------------|----------------|
| **Survey Manager** | `FeedbackManagerPage.tsx` | Legacy naming - DO NOT RENAME |
| **Survey Report** | `FeedbackReportPage.tsx` | Legacy naming - DO NOT RENAME |

### Quick Reference Mapping:

```typescript
// In Dashboard.tsx
case 'feedback-manager-sub':
  return <FeedbackManagerPage />;  // Shows "Survey Manager" in menu

case 'feedback-report':
  return <FeedbackReportPage />;   // Shows "Survey Report" in menu
```

### Why "Feedback" in code but "Survey" in menu?

**Historical Evolution:**
1. Originally designed as "Feedback Manager" system
2. Later rebranded to "Survey" for better user understanding
3. Menu labels were updated
4. Component files were NOT renamed to avoid risks
5. System works perfectly - naming is cosmetic

---

## What To Do Instead

### ✅ DO:
- **Document the mapping** (this file)
- **Add code comments** explaining the discrepancy
- **Train new developers** on this quirk
- **Keep design frozen** - especially FeedbackReportPage

### ❌ DON'T:
- **Rename files** without extreme caution
- **Modify FeedbackReportPage design** without explicit approval
- **Change localStorage keys**
- **Assume naming is a "bug"** - it's intentional now

---

## Technical Details

### Component File: `FeedbackManagerPage.tsx`
- **Lines:** 1,615
- **Purpose:** Survey builder with multi-step form
- **Features:** Drag-drop questions, inline editing, preview, localization (EN/AR)
- **Storage:** `localStorage` with version control
- **Status:** ✅ Working perfectly

### Component File: `FeedbackReportPage.tsx`
- **Purpose:** Beautiful analytics dashboard
- **Features:** Charts, statistics, filters, patient type distribution
- **Design:** **LOVED BY USER** - touch at your own risk!
- **Storage:** Reads from `localStorage` feedback surveys
- **Status:** ✅ Working perfectly

---

## Lesson Learned

During a recent codebase cleanup, we:
1. Removed "old/duplicate code"  
2. Accidentally changed `FeedbackReportPage.tsx` design
3. User immediately noticed and was upset
4. Had to restore previous version
5. **Lesson:** Some designs are precious - document instead of "fixing"

---

## For New Developers

If you're confused by this naming:

1. **It's intentional** - not a mistake
2. **Don't "fix" it** - risk > reward
3. **Use this mapping:**
   - Menu says "Survey" → Look for "Feedback" in code
   - `feedback-manager-sub` → `FeedbackManagerPage.tsx`
   - `feedback-report` → `FeedbackReportPage.tsx`

4. **When in doubt:** Check this document!

---

## Alternative Considered

**Option A: Rename components to match menu** ❌ REJECTED
- Too risky
- Large files
- Working code
- Beloved design could break

**Option B: Rename menu to match components** ❌ REJECTED
- Confuses users
- "Survey" is better UX than "Feedback"
- User-facing changes are more disruptive

**Option C: Document the quirk** ✅ CHOSEN
- Zero risk
- Preserves working code
- Helps future developers
- Best practice for stable systems

---

## Summary

**The "Survey"/"Feedback" naming difference is now OFFICIALLY DOCUMENTED as intentional.**

✅ Both components work perfectly  
✅ Design is loved by users  
✅ Data persistence is stable  
✅ This is NOT a bug to fix  

**DO NOT RENAME THESE FILES.**

---

**Last Updated:** December 2025  
**Decision By:** Development Team  
**Status:** FINAL - No further action needed
