# Developer Guide: Overall Peak Hours Calculation

## Overview

The **Overall Peak Hours** represents the time window when a patient has the **highest combined activity** across all three categories:
- Engagement Hub
- Patient Services  
- Channels

This metric is displayed in the Device Usage modal on the CareInn15 dashboard.

---

## Calculation Algorithm

### Step 1: Collect All Timestamped Activities

Query all activities for the specific device/patient with timestamps from your database:

```sql
SELECT timestamp, activity_type, category 
FROM device_activities 
WHERE device_id = 'mt15' 
AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY timestamp;
```

**Example data structure:**

```typescript
const activities = [
  { timestamp: "2024-12-09 15:30:00", type: "engagement", category: "Media" },
  { timestamp: "2024-12-09 11:15:00", type: "patient-services", category: "CareCall" },
  { timestamp: "2024-12-09 20:45:00", type: "channels", category: "MBC" },
  { timestamp: "2024-12-09 15:45:00", type: "engagement", category: "Games" },
  { timestamp: "2024-12-09 14:30:00", type: "channels", category: "News" },
  // ... all activities for the time period
];
```

---

### Step 2: Group Activities by Hour of Day (0-23)

Create an array to count activities for each hour:

```typescript
const hourlyActivity = Array(24).fill(0);

activities.forEach(activity => {
  const hour = new Date(activity.timestamp).getHours();
  hourlyActivity[hour]++;
});
```

**Result example:**

```typescript
// Index = hour (0-23), Value = activity count
[
  0,   // 12AM - 1AM: 0 activities
  0,   // 1AM - 2AM: 0 activities
  0,   // 2AM - 3AM: 0 activities
  12,  // 3AM - 4AM: 12 activities
  18,  // 4AM - 5AM: 18 activities
  25,  // 5AM - 6AM: 25 activities
  // ... continues to hour 23
]
```

---

### Step 3: Find Continuous Time Window with Highest Activity

Use a **sliding window approach** to find the busiest consecutive period:

```typescript
const WINDOW_SIZE = 4; // 4-hour window (adjustable)
let maxActivity = 0;
let peakStartHour = 0;

for (let i = 0; i <= 24 - WINDOW_SIZE; i++) {
  const windowTotal = hourlyActivity
    .slice(i, i + WINDOW_SIZE)
    .reduce((sum, count) => sum + count, 0);
  
  if (windowTotal > maxActivity) {
    maxActivity = windowTotal;
    peakStartHour = i;
  }
}
```

**Example:**
- If hours 14-17 (2PM-6PM) have the most combined activity
- `peakStartHour = 14`
- `maxActivity = 156` (total activities in that window)

---

### Step 4: Format the Result

Calculate the end hour and format for display:

```typescript
const peakEndHour = peakStartHour + WINDOW_SIZE;

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}${period}`;
}

function getPeakLabel(startHour: number): string {
  if (startHour >= 6 && startHour < 12) return "Morning peak";
  if (startHour >= 12 && startHour < 17) return "Afternoon peak";
  if (startHour >= 17 && startHour < 21) return "Evening peak";
  return "Night peak";
}

const overallPeak = {
  time: `${formatHour(peakStartHour)} - ${formatHour(peakEndHour)}`,
  label: getPeakLabel(peakStartHour)
};
```

**Example output:**

```typescript
{
  time: "2PM - 6PM",
  label: "Afternoon peak"
}
```

---

## Complete Implementation Example

```typescript
interface Activity {
  timestamp: string;
  type: 'engagement' | 'patient-services' | 'channels';
  category: string;
}

interface PeakHours {
  time: string;
  label: string;
}

function calculateOverallPeakHours(
  activities: Activity[], 
  windowSize: number = 4
): PeakHours {
  // Step 2: Group by hour
  const hourlyActivity = Array(24).fill(0);
  activities.forEach(activity => {
    const hour = new Date(activity.timestamp).getHours();
    hourlyActivity[hour]++;
  });

  // Step 3: Find peak window
  let maxActivity = 0;
  let peakStartHour = 0;

  for (let i = 0; i <= 24 - windowSize; i++) {
    const windowTotal = hourlyActivity
      .slice(i, i + windowSize)
      .reduce((sum, count) => sum + count, 0);
    
    if (windowTotal > maxActivity) {
      maxActivity = windowTotal;
      peakStartHour = i;
    }
  }

  // Step 4: Format
  const peakEndHour = peakStartHour + windowSize;
  
  return {
    time: `${formatHour(peakStartHour)} - ${formatHour(peakEndHour)}`,
    label: getPeakLabel(peakStartHour)
  };
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}${period}`;
}

function getPeakLabel(startHour: number): string {
  if (startHour >= 6 && startHour < 12) return "Morning peak";
  if (startHour >= 12 && startHour < 17) return "Afternoon peak";
  if (startHour >= 17 && startHour < 21) return "Evening peak";
  return "Night peak";
}
```

---

## Key Differences: Tab-Specific vs Overall Peak Hours

### Tab-Specific Peak Hours
- **Pattern-based** (static values)
- Only looks at **one category** at a time
- Different for each tab:
  - **Engagement:** 3PM - 7PM (Evening peak)
  - **Patient Services:** 11AM - 2PM (Lunch hours peak)
  - **Channels:** 7PM - 11PM (Prime time peak)
- Based on general usage patterns

### Overall Peak Hours
- **Data-driven** (dynamic calculation)
- Combines **all three categories**
- Same value regardless of which tab is selected
- Updates as patient usage patterns change
- Reflects actual patient behavior

---

## Configuration Options

### Window Size
- **Default:** 4 hours
- **Adjustable:** Can be changed based on clinical requirements
- **Example:** Use 3 hours for more granular peaks, or 6 hours for broader patterns

```typescript
const WINDOW_SIZE = 4; // Adjust as needed
```

### Time Period
- **Default:** Last 30 days
- **Options:** 
  - Last 7 days (recent patterns)
  - Last 24 hours (real-time)
  - Custom date range

```sql
-- Last 7 days
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'

-- Last 24 hours
WHERE timestamp >= NOW() - INTERVAL '24 hours'
```

### Update Frequency
- **Recommended:** Recalculate daily at midnight
- **Real-time:** Recalculate on-demand when modal opens (may impact performance)
- **Cached:** Calculate once per day and cache results

---

## Angular Implementation Notes

For your Angular application, implement this as a service:

```typescript
// peak-hours.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PeakHoursService {
  constructor(private http: HttpClient) {}

  getOverallPeakHours(deviceId: string, windowSize: number = 4): Observable<PeakHours> {
    return this.http.get<Activity[]>(`/api/devices/${deviceId}/activities`)
      .pipe(
        map(activities => this.calculateOverallPeakHours(activities, windowSize))
      );
  }

  private calculateOverallPeakHours(activities: Activity[], windowSize: number): PeakHours {
    // Implementation from above
    // ...
  }
}
```

---

## Testing

### Test Case 1: Morning Peak
```typescript
const morningActivities = [
  { timestamp: "2024-12-09 08:00:00", type: "engagement", category: "Media" },
  { timestamp: "2024-12-09 09:15:00", type: "patient-services", category: "CareCall" },
  { timestamp: "2024-12-09 10:30:00", type: "channels", category: "MBC" },
  // ... 50 more activities between 8AM-11AM
];

const result = calculateOverallPeakHours(morningActivities);
// Expected: { time: "8AM - 12PM", label: "Morning peak" }
```

### Test Case 2: Evening Peak
```typescript
const eveningActivities = [
  { timestamp: "2024-12-09 18:00:00", type: "channels", category: "MBC" },
  { timestamp: "2024-12-09 19:15:00", type: "engagement", category: "Games" },
  { timestamp: "2024-12-09 20:30:00", type: "channels", category: "News" },
  // ... 50 more activities between 6PM-9PM
];

const result = calculateOverallPeakHours(eveningActivities);
// Expected: { time: "6PM - 10PM", label: "Evening peak" }
```

---

## Performance Considerations

1. **Database Indexing:**
   ```sql
   CREATE INDEX idx_device_activities_device_timestamp 
   ON device_activities(device_id, timestamp);
   ```

2. **Caching Strategy:**
   - Cache results for each device
   - Invalidate cache daily at midnight
   - Store in Redis or application cache

3. **Query Optimization:**
   - Only fetch necessary columns (timestamp, type)
   - Limit to specific time period
   - Use database aggregation when possible

---

## Visualization in UI

The Overall Peak Hours is displayed in two locations:

1. **Right sidebar card** (fixed):
   - Label: "Overall Peak Hours"
   - Value: "2PM - 6PM"
   - Description: "Afternoon peak"

2. **Context:**
   - Shows alongside Days Since Admission (7 days)
   - Below Top Engagement Category, Top Used Service, and Top Watched Channel

---

## Questions?

For additional support or clarification on implementing this feature, please refer to:
- `/components/DeviceModal.tsx` - UI implementation
- API documentation for device activities endpoint
- Database schema for `device_activities` table
