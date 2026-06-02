# CareInn Assets - Quick Export Checklist

## 📦 Assets You Need to Export from Figma

---

## ✅ GOOD NEWS: Most Icons Are Library-Based!

**95% of icons come from Lucide library** - your developer just needs to install:
```bash
npm install @ng-icons/core @ng-icons/lucide
```

No export needed for ~80 icons! ✨

---

## 📋 What You DO Need to Export (42 Files Total)

### 🏢 **1. Logos (4 files)**
- [ ] `careinn-logo-large.png` (170×85px) - Sidebar expanded
- [ ] `careinn-logo-small.png` (70×88px) - Sidebar collapsed  
- [ ] `careinn-logo-icon.png` (256×256px) - Favicon
- [ ] `hospital-logo.png` (200×200px) - Client branding

**Export as:** PNG @2x, transparent background

---

### 🏆 **2. Certification Badges (2 files)**
- [ ] `cbahi-badge.png` (120×120px)
- [ ] `iso-badge.png` (120×120px)

**Export as:** PNG @2x, transparent background

---

### 📱 **3. App Icons for Content Library (17 files)**

All sized at **80×80px** for consistency:

**Social & Communication:**
- [ ] `app-whatsapp.png`
- [ ] `app-snapchat.png`
- [ ] `app-tiktok.png`
- [ ] `app-zoom.png`
- [ ] `app-teams.png`

**Media & Entertainment:**
- [ ] `app-youtube.png`
- [ ] `app-netflix.png`
- [ ] `app-quran.png`

**Utilities & Games:**
- [ ] `app-chess.png`
- [ ] `app-puzzle.png`
- [ ] `app-calculator.png`
- [ ] `app-mirror.png`
- [ ] `app-chrome.png`
- [ ] `app-translator.png`

**CareInn Features:**
- [ ] `app-careinn-ui.png`
- [ ] `app-call-nurse.png`
- [ ] `app-baby-camera.png`

**Export as:** PNG @2x, transparent background

---

### 🎨 **4. Custom SVG Icons (19 files - OPTIONAL)**

Your codebase has 19 custom SVG files in `/imports/` folder.

**Option A:** Export each as clean `.svg` file with descriptive name  
**Option B:** Your developer can extract SVG paths from the `.ts` files directly

These are from Figma imports - check if they're actually being used in the UI.

---

### 🔤 **5. Fonts (2 families - EASY!)**

**Option A: Google Fonts (Recommended ✅)**
Just share these links with your developer:

```html
<!-- Poppins -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Baloo Bhaijaan 2 (Arabic) -->
<link href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500&display=swap" rel="stylesheet">
```

**Option B: Self-hosted**
Download WOFF2 files from Google Fonts and include in assets folder.

---

## 📁 How to Organize Assets

Create this folder structure:

```
CareInn_Assets/
├── logos/                    (4 PNG files)
├── badges/                   (2 PNG files)
├── app-icons/                (17 PNG files)
├── svg-icons/                (19 SVG files - optional)
└── README.txt                (usage instructions)
```

---

## ⚡ Quick Export from Figma

### For Each Asset:
1. **Select** the asset in Figma
2. **Right panel** → Export section
3. **Format:** PNG
4. **Scale:** 2x (for retina displays)
5. **Click Export**
6. **Rename** according to checklist above

### Batch Export Tip:
- Select all logos → Export as `logos-batch` → Rename individually
- Select all app icons → Export as `app-icons-batch` → Rename individually
- Select all badges → Export as `badges-batch` → Rename individually

---

## 🎯 Quick Share with Developer

**Easiest Method:**
1. Create a Google Drive or Dropbox folder
2. Upload all exported assets
3. Organize into subfolders (logos, badges, app-icons)
4. Share the link with your developer
5. Include `ASSETS_EXPORT_GUIDE.md` for full documentation

**Alternative:**
If assets are small (likely under 5MB total), you can:
- ZIP them up
- Email directly
- Include in your handoff package

---

## ✅ Pre-Send Verification

Before sharing with developer, verify:
- [ ] All files are named descriptively (no hash names like `figma-asset-abc123.png`)
- [ ] All PNGs have transparent backgrounds (where appropriate)
- [ ] All files are @2x resolution (retina-ready)
- [ ] Folder structure is clean and organized
- [ ] Google Fonts links are ready (or WOFF2 files included)
- [ ] Total file count: 4 logos + 2 badges + 17 app icons = **23 required files**

---

## 💡 Pro Tip: Missing Assets?

If you can't find some app icons in your Figma file, your developer can use free alternatives:

**Free Icon Sources:**
- IconScout: https://iconscout.com
- Flaticon: https://flaticon.com
- Icons8: https://icons8.com

Search for "WhatsApp icon PNG 80x80" etc.

---

## 📧 Quick Email Template

```
Subject: CareInn Assets Package

Hi [Developer Name],

Here are all the custom assets for CareInn:

📦 ASSET FOLDER:
[Google Drive/Dropbox link]

📊 WHAT'S INCLUDED:
✅ 4 logos (CareInn + Hospital)
✅ 2 certification badges (CBAHI + ISO)
✅ 17 app icons (WhatsApp, YouTube, etc.)
✅ Font links (Poppins + Baloo Bhaijaan 2)

💡 IMPORTANT:
You don't need to worry about UI icons (Monitor, Users, Settings, etc.)
Those come from Lucide library - just install @ng-icons/lucide

All files are PNG @2x (retina-ready) with transparent backgrounds.

See ASSETS_EXPORT_GUIDE.md for complete documentation.

Let me know if you need anything in different sizes!

Best,
[Your Name]
```

---

## 🚀 Ready to Export!

**Estimated time:** 15-30 minutes to export and organize all assets

**Priority files (export these first):**
1. CareInn logos (4 files) - **Critical**
2. App icons for Content Library (17 files) - **High priority**
3. Certification badges (2 files) - **Medium priority**
4. Custom SVGs (19 files) - **Optional** (may not be used)

---

**Need detailed export instructions?** See `ASSETS_EXPORT_GUIDE.md` ✨
