# CareInn - Menu to Component Naming Audit

## ✅ DECISION: Keep Current Naming (DO NOT RENAME)

**See `/NAMING_DECISION.md` for full rationale.**

**TL;DR:** Files are too large (1,615 lines), design is beloved by user, risk > reward. We're documenting this quirk instead of fixing it.

---

## 🚨 DOCUMENTED NAMING QUIRKS (Intentional)

### **Survey Section** ⚠️ CRITICAL ISSUE
| Menu Item | Menu ID | Component File | Status |
|-----------|---------|----------------|--------|
| **"Survey Manager"** | `feedback-manager-sub` | `FeedbackManagerPage.tsx` | ❌ MISMATCH |
| **"Survey Report"** | `feedback-report` | `FeedbackReportPage.tsx` | ❌ MISMATCH |

**Problem:** 
- Menu says "Survey" but components say "Feedback"
- This will confuse developers looking at the code
- Parent menu item uses ID `feedback-manager` but label is "Survey"

**Recommendation:**
Rename files to match menu items:
- `FeedbackManagerPage.tsx` → `SurveyManagerPage.tsx`
- `FeedbackReportPage.tsx` → `SurveyReportPage.tsx`

---

### **Features Manager Section** ⚠️ MINOR ISSUE
| Menu Item | Menu ID | Component File | Status |
|-----------|---------|----------------|--------|
| **"Welcome Note"** | `greeting-message` | `WelcomeNotePage.tsx` | ⚠️ ID MISMATCH |

**Problem:** 
- Menu ID is `greeting-message` but component is `WelcomeNotePage`
- Menu label is "Welcome Note" but component says "WelcomeNote"
- Not critical but could be clearer

**Recommendation:**
Either:
- Change menu ID: `greeting-message` → `welcome-note`
- OR change component: `WelcomeNotePage.tsx` → `GreetingMessagePage.tsx`

---

## ✅ CONSISTENT NAMING (Perfect)

| Menu Item | Menu ID | Component File | Status |
|-----------|---------|----------------|--------|
| **Dashboard** | `dashboard` | `DashboardPage.tsx` | ✅ PERFECT |
| **Wallpaper** | `wallpaper-library` | `WallpaperPage.tsx` | ✅ GOOD |
| **News Feed** | `news-feed` | `NewsFeedPage.tsx` | ✅ PERFECT |
| **Notifications** | `alerts` | `NotificationsPage.tsx` | ✅ GOOD |
| **Accreditation** | `accreditation` | `AccreditationPage.tsx` | ✅ PERFECT |
| **Content Library** | `content-library` | `ContentLibraryPage.tsx` | ✅ PERFECT |
| **Engagement Hub** | `engagement-hub` | `EngagementHubPage.tsx` | ✅ PERFECT |
| **Patient Services** | `patient-services` | `PatientServicesPage.tsx` | ✅ PERFECT |
| **Shortcuts** | `shortcuts` | `ShortcutsPage.tsx` | ✅ PERFECT |
| **Channels** | `channels` | `ChannelsPage.tsx` | ✅ PERFECT |
| **CareInn15** | `careinn` | `CareInnPage.tsx` | ✅ PERFECT |
| **Profile Categories** | `profile-builder` | `ProfileCategoriesPage.tsx` | ✅ GOOD |
| **Profile** | `profile` | `ProfilePage.tsx` | ✅ PERFECT |

---

## 📋 ORPHANED FILES (Not Used Anywhere)

| File | Status | Action |
|------|--------|--------|
| `SurveyReportPage.tsx` | ❌ Not imported/used | **DELETE** |

---

## 🎯 RECOMMENDED ACTIONS

### Priority 1: Fix Survey/Feedback Naming
```bash
# Rename files
FeedbackManagerPage.tsx → SurveyManagerPage.tsx
FeedbackReportPage.tsx → SurveyReportPage.tsx

# Update imports in Dashboard.tsx
import SurveyManagerPage from './SurveyManagerPage';
import SurveyReportPage from './SurveyReportPage';

# Update Dashboard.tsx switch cases
case 'feedback-manager-sub':
  return <SurveyManagerPage />;
case 'feedback-report':
  return <SurveyReportPage />;
```

### Priority 2: Delete Orphaned File
```bash
# Delete unused file
rm SurveyReportPage.tsx
```

### Priority 3: Optional - Fix Welcome Note
```bash
# Option A: Change menu ID (easier)
# In CollapsibleSidebar.tsx
{ id: 'welcome-note', label: 'Welcome Note', icon: MessageCircle }

# Update Dashboard.tsx
case 'welcome-note':
  return <WelcomeNotePage />;
```

---

## 📚 NAMING CONVENTION STANDARD

Going forward, **all new pages MUST follow this pattern:**

### Pattern:
```
Menu Label: "Page Name"
Menu ID: page-name (kebab-case)
Component: PageNamePage.tsx (PascalCase)
```

### Examples:
- ✅ "Survey Manager" → `survey-manager` → `SurveyManagerPage.tsx`
- ✅ "Patient Services" → `patient-services` → `PatientServicesPage.tsx`
- ✅ "News Feed" → `news-feed` → `NewsFeedPage.tsx`

### Anti-Patterns:
- ❌ "Survey Manager" → `feedback-manager-sub` → `FeedbackManagerPage.tsx`
- ❌ "Welcome Note" → `greeting-message` → `WelcomeNotePage.tsx`

---

## 🔍 How to Check for Naming Issues

1. **Check Menu Items** in `CollapsibleSidebar.tsx`
2. **Check Dashboard Routes** in `Dashboard.tsx`
3. **Verify Pattern:** Menu Label → Menu ID → Component Name
4. **Look for mismatches** between menu terminology and component names

---

**Last Updated:** After codebase cleanup and restoration