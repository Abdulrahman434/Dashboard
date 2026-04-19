# CareInn Dashboard & Analytics - Angular Migration Guide

## Overview
This document helps your Angular developer recreate the new Dashboard and Analytics pages in Angular using the React prototype as a design reference.

---

## 📦 What Was Created

### 1. **Dashboard Page** (`/components/DashboardHome.tsx`)
   - Replaces the old "Home" page
   - Shows real-time operational overview
   - Key sections:
     - Hospital Info Card (personalized)
     - System Health metrics
     - Alerts & Notifications
     - Terminal Metrics (6 cards)
     - Today's Overview
     - Care Call Summary
     - Recent Activity Feed (with auto-refresh)

### 2. **Analytics Page** (`/components/AnalyticsPage.tsx`)
   - Deep insights with charts and graphs
   - Time range filter (7 days / 30 days / Quarter / Year)
   - Key sections:
     - Engagement Hub Performance (bar chart)
     - Patient Services (bar chart)
     - Care Call Analytics (stats + bar chart)
     - Most Tapped Shortcuts (with adoption rates)
     - Content Performance (by type)
     - Most Watched Channels (bar chart)
     - Survey & Satisfaction (rating distribution)

---

## 🎨 Design System Reference

### Colors (Use Exactly As-Is)
```css
Brand Primary:    #4EBEE3
Dark Blue:        #16274D
Light Grey:       #DDDDDE
Background:       #F8FAFC
Border:           #E2E8F0
Text Primary:     #16274D
Text Secondary:   #6B7280
Success:          #10B981
Warning:          #F59E0B
Error:            #EF4444
```

### Typography
```css
Font Family: 'Poppins', sans-serif
Page Title: 24px, Semibold
Card Title: 17px, Semibold
Body Text: 14px, Regular
Small Text: 13px, Medium
Tiny Text: 11px, Regular
```

### Card Styling
```css
Border Radius: 12px (rounded-xl)
Box Shadow: 0px 0px 2px 0px rgba(145,158,171,0.2), 
            0px 12px 24px -4px rgba(145,158,171,0.12)
Padding: 24px (p-6)
Border: 1px solid rgba(78, 190, 227, 0.3)
Hover: Translate Y by -4px with stronger shadow
```

### Spacing
```css
Page Padding: 32px (p-8)
Card Gap: 20px (gap-5)
Grid Gaps: 12px (gap-3) or 20px (gap-5)
```

---

## 📚 Angular Libraries to Use

### 1. **Charts - ngx-charts** (Recommended)
```bash
npm install @swimlane/ngx-charts --save
```

**Why ngx-charts?**
- Built for Angular
- Similar API to Recharts
- Highly customizable
- Good documentation

**Example Conversion:**

**React (Recharts):**
```tsx
<BarChart data={servicesData}>
  <Bar dataKey="hours" fill="#4EBEE3" radius={[8, 8, 0, 0]} />
</BarChart>
```

**Angular (ngx-charts):**
```html
<ngx-charts-bar-vertical
  [results]="servicesData"
  [scheme]="colorScheme"
  [roundEdges]="true"
  [xAxis]="true"
  [yAxis]="true"
  [showGridLines]="true">
</ngx-charts-bar-vertical>
```

```typescript
colorScheme = {
  domain: ['#4EBEE3']
};

servicesData = [
  { name: 'LiveTV', value: 890 },
  { name: 'Games', value: 1450 },
  // ...
];
```

### 2. **Animations - Angular Animations**
```typescript
import { trigger, transition, style, animate } from '@angular/animations';

animations: [
  trigger('fadeInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
]
```

### 3. **Icons - Heroicons or Lucide Angular**
```bash
npm install @ng-icons/core @ng-icons/lucide --save
```

All icons used in the React version have equivalents in Lucide.

---

## 🔄 Chart Type Mapping

| React (Recharts) | Angular (ngx-charts) | Used In |
|------------------|----------------------|---------|
| `<BarChart>` with `<Bar>` | `<ngx-charts-bar-vertical>` | Engagement Hub, Services, Channels, Care Call |
| Circular progress (custom) | Custom Angular component or `<ngx-charts-gauge>` | System Health, Shortcuts adoption |
| Rating stars | Custom component with icons | Survey satisfaction |
| Progress bars | HTML + CSS (no library needed) | Shortcuts adoption, Survey distribution |

---

## 📊 Data Structures

All data is **framework-agnostic JSON**. You can use the same structures:

### Example: Services Data
```typescript
interface ServiceData {
  name: string;
  taps: number;
}

servicesData: ServiceData[] = [
  { name: 'Nurse Call', taps: 890 },
  { name: 'Food Menu', taps: 750 },
  { name: 'Room Service', taps: 620 },
  // ...
];
```

### Example: System Health
```typescript
interface SystemHealth {
  overall: number;
  moduleConfiguration: number;
  uptime: number;
  terminalConnectivity: number;
  integrationStatus: number;
}

systemHealth: SystemHealth = {
  overall: 91.9,
  moduleConfiguration: 82.3,
  uptime: 98.2,
  terminalConnectivity: 93.3,
  integrationStatus: 100
};
```

---

## 🎯 Component Breakdown

### Dashboard Components (Create in Angular)

1. **HospitalInfoCard**
   - Gradient background: `from-[#4EBEE3] to-[#16274D]`
   - Hospital logo icon
   - Address, phone, email

2. **SystemHealthCard**
   - Dark background: `#16274D`
   - Overall percentage display
   - 4 sub-metrics with icons

3. **AlertsCard**
   - List of alerts (warning/info)
   - Clickable with navigation
   - Empty state when no alerts

4. **MetricCard** (reusable for 6 terminal metrics)
   - Large number display
   - Icon on the right
   - Hover animation

5. **TodaysOverviewCard**
   - Top 3 most accessed items
   - Satisfaction score with star

6. **CareCallSummaryCard**
   - 4 metric boxes in a grid
   - "View Full Analytics" button

7. **RecentActivityFeed**
   - List of activity items with icons
   - Auto-refresh dropdown
   - "View All Activity" button

### Analytics Components (Create in Angular)

1. **EngagementHubChart**
   - Bar chart component
   - Total taps metric box
   - ngx-charts-bar-vertical

2. **PatientServicesChart**
   - Similar to Engagement Hub
   - Angled X-axis labels

3. **CareCallAnalyticsCard**
   - Stats grid + list
   - Separate peak hours chart

4. **ShortcutsCard**
   - List with progress bars
   - Adoption percentage

5. **ContentPerformanceCard**
   - 5-column grid
   - Each type as a mini card

6. **ChannelsChart**
   - Bar chart with dark blue bars

7. **SurveyCard**
   - Large score display
   - Horizontal progress bars for distribution

---

## 🚀 Step-by-Step Migration

### Phase 1: Setup
1. Create two new Angular components: `dashboard-home` and `analytics`
2. Install ngx-charts: `npm install @swimlane/ngx-charts`
3. Import required modules in your Angular module

### Phase 2: Copy Styling
1. All Tailwind classes work the same in Angular
2. Copy class names directly from React components
3. Example: `className="bg-white rounded-xl p-6"` becomes `class="bg-white rounded-xl p-6"`

### Phase 3: Data Setup
1. Create TypeScript interfaces for all data types
2. Copy sample data from React components
3. Later, replace with real API calls

### Phase 4: Build Components
1. Start with simple components (cards, headers)
2. Then add charts one by one
3. Test each chart individually

### Phase 5: Navigation
1. Add routes in Angular router
2. Update sidebar navigation
3. Test navigation flow

---

## 💡 Key Differences to Watch

### 1. **Event Handling**
- React: `onClick={() => ...}`
- Angular: `(click)="..."`

### 2. **Conditional Rendering**
- React: `{condition && <Component />}`
- Angular: `<Component *ngIf="condition">`

### 3. **Loops**
- React: `{array.map(item => ...)}`
- Angular: `<div *ngFor="let item of array">`

### 4. **State Management**
- React: `useState()`
- Angular: Component properties

---

## 📁 File Structure (Suggested)

```
src/app/
├── dashboard/
│   ├── dashboard-home/
│   │   ├── dashboard-home.component.ts
│   │   ├── dashboard-home.component.html
│   │   ├── dashboard-home.component.scss
│   │   └── components/
│   │       ├── hospital-info-card/
│   │       ├── system-health-card/
│   │       ├── alerts-card/
│   │       ├── metric-card/
│   │       ├── todays-overview/
│   │       ├── care-call-summary/
│   │       └── recent-activity/
│   └── analytics/
│       ├── analytics.component.ts
│       ├── analytics.component.html
│       ├── analytics.component.scss
│       └── components/
│           ├── engagement-hub-chart/
│           ├── patient-services-chart/
│           ├── care-call-analytics/
│           ├── shortcuts-card/
│           ├── content-performance/
│           ├── channels-chart/
│           └── survey-card/
```

---

## 🔧 Quick Reference: Component Props

### DashboardHome
- No props needed (standalone page)
- Manages own state for refresh interval

### AnalyticsPage
- No props needed (standalone page)
- Manages own state for time range filter

### Chart Components (Reusable)
```typescript
@Input() data: any[];
@Input() title: string;
@Input() colorScheme: any;
@Input() height: number = 300;
```

---

## 📞 Questions Checklist

Before starting, clarify with backend team:
1. Where will real data come from? (API endpoints)
2. Authentication/authorization setup?
3. Real-time updates needed? (WebSockets?)
4. Export functionality requirements?
5. Mobile responsiveness requirements?

---

## ✅ Testing Checklist

- [ ] All pages load without errors
- [ ] Charts animate smoothly on scroll
- [ ] Time range filter updates all charts
- [ ] Auto-refresh works in Recent Activity
- [ ] Responsive layout (1920x1080 optimized)
- [ ] All colors match design exactly
- [ ] Icons match Figma prototype
- [ ] Hover states work correctly
- [ ] Navigation works between pages

---

## 📝 Notes

- The React prototype is your **visual reference** - match it pixel-perfect
- Don't overthink the conversion - most styling is just CSS
- Focus on getting charts working first, then refine animations
- Test frequently as you build

---

## 🎓 Learning Resources

- **ngx-charts Documentation:** https://swimlane.gitbook.io/ngx-charts
- **Angular Animations:** https://angular.io/guide/animations
- **Tailwind CSS:** https://tailwindcss.com/docs

---

**Estimated Time:** 2-3 days for experienced Angular developer

Good luck! 🚀
