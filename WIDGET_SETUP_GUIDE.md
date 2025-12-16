# Home Screen Widgets Setup Guide

This guide explains how to add iOS and Android home screen widgets to display cycle countdown and fertility status.

## Overview

Home screen widgets require native code and cannot be created purely in JavaScript/React. You'll need to implement them separately in Xcode (iOS) and Android Studio (Android).

## iOS Widget Setup (WidgetKit)

### Prerequisites
- Xcode 14 or later
- iOS 14+ target
- Apple Developer account

### Step 1: Add Widget Extension

1. Open your project in Xcode
2. Go to **File > New > Target**
3. Select **Widget Extension**
4. Name it `CycleWidget`
5. Uncheck "Include Configuration Intent" for simple widgets

### Step 2: Create Widget Code

Create `CycleWidget.swift`:

```swift
import WidgetKit
import SwiftUI

struct CycleEntry: TimelineEntry {
    let date: Date
    let daysUntilPeriod: Int
    let fertilityStatus: String
    let cycleDay: Int
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> CycleEntry {
        CycleEntry(date: Date(), daysUntilPeriod: 5, fertilityStatus: "Low", cycleDay: 10)
    }

    func getSnapshot(in context: Context, completion: @escaping (CycleEntry) -> ()) {
        let entry = loadCycleData()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CycleEntry>) -> ()) {
        let entry = loadCycleData()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadCycleData() -> CycleEntry {
        // Load from UserDefaults (shared with main app via App Group)
        let defaults = UserDefaults(suiteName: "group.app.lovable.periodtracker")
        let daysUntilPeriod = defaults?.integer(forKey: "daysUntilPeriod") ?? 0
        let fertilityStatus = defaults?.string(forKey: "fertilityStatus") ?? "Unknown"
        let cycleDay = defaults?.integer(forKey: "cycleDay") ?? 1
        
        return CycleEntry(
            date: Date(),
            daysUntilPeriod: daysUntilPeriod,
            fertilityStatus: fertilityStatus,
            cycleDay: cycleDay
        )
    }
}

struct CycleWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    var entry: CycleEntry
    
    var body: some View {
        VStack(spacing: 8) {
            Text("\(entry.daysUntilPeriod)")
                .font(.system(size: 48, weight: .bold))
                .foregroundColor(.pink)
            Text("days until period")
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                Circle()
                    .fill(fertilityColor)
                    .frame(width: 8, height: 8)
                Text(entry.fertilityStatus)
                    .font(.caption2)
            }
        }
        .padding()
    }
    
    var fertilityColor: Color {
        switch entry.fertilityStatus.lowercased() {
        case "high": return .green
        case "medium": return .orange
        default: return .gray
        }
    }
}

struct MediumWidgetView: View {
    var entry: CycleEntry
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Cycle Day \(entry.cycleDay)")
                    .font(.headline)
                Text("\(entry.daysUntilPeriod) days until period")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack {
                Text("Fertility")
                    .font(.caption)
                Text(entry.fertilityStatus)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(fertilityColor)
            }
        }
        .padding()
    }
    
    var fertilityColor: Color {
        switch entry.fertilityStatus.lowercased() {
        case "high": return .green
        case "medium": return .orange
        default: return .gray
        }
    }
}

@main
struct CycleWidget: Widget {
    let kind: String = "CycleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            CycleWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Cycle Tracker")
        .description("Track your cycle countdown and fertility status.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

### Step 3: Set Up App Groups

1. In Xcode, select your main app target
2. Go to **Signing & Capabilities**
3. Add **App Groups** capability
4. Create a new group: `group.app.lovable.periodtracker`
5. Also add this group to your Widget Extension target

### Step 4: Share Data from Capacitor

Add this to your app to share data with the widget:

```typescript
// src/lib/widgetDataSync.ts
import { Capacitor } from '@capacitor/core';

export async function syncWidgetData(data: {
  daysUntilPeriod: number;
  fertilityStatus: string;
  cycleDay: number;
}) {
  if (Capacitor.getPlatform() === 'ios') {
    // Use a Capacitor plugin or native bridge to write to UserDefaults
    // with the App Group suite name
    try {
      await (window as any).Capacitor?.Plugins?.WidgetBridge?.updateWidget(data);
    } catch (error) {
      console.log('Widget sync not available');
    }
  }
}
```

---

## Android Widget Setup

### Step 1: Create Widget Layout

Create `res/layout/cycle_widget.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="16dp"
    android:background="@drawable/widget_background">

    <TextView
        android:id="@+id/days_count"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="48sp"
        android:textColor="#EC4899"
        android:textStyle="bold"
        android:text="5" />

    <TextView
        android:id="@+id/days_label"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="12sp"
        android:textColor="#666666"
        android:text="days until period" />

    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center"
        android:layout_marginTop="8dp">

        <View
            android:id="@+id/fertility_indicator"
            android:layout_width="8dp"
            android:layout_height="8dp"
            android:background="@drawable/circle_indicator" />

        <TextView
            android:id="@+id/fertility_status"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textSize="10sp"
            android:layout_marginStart="4dp"
            android:text="Low Fertility" />
    </LinearLayout>
</LinearLayout>
```

### Step 2: Create Widget Provider

Create `CycleWidgetProvider.kt`:

```kotlin
package app.lovable.periodtracker.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.content.SharedPreferences
import app.lovable.periodtracker.R

class CycleWidgetProvider : AppWidgetProvider() {
    
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val prefs: SharedPreferences = context.getSharedPreferences(
            "WidgetData", Context.MODE_PRIVATE
        )
        
        val daysUntilPeriod = prefs.getInt("daysUntilPeriod", 0)
        val fertilityStatus = prefs.getString("fertilityStatus", "Unknown") ?: "Unknown"
        
        val views = RemoteViews(context.packageName, R.layout.cycle_widget)
        views.setTextViewText(R.id.days_count, daysUntilPeriod.toString())
        views.setTextViewText(R.id.fertility_status, fertilityStatus)
        
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
    
    companion object {
        fun updateAllWidgets(context: Context) {
            val intent = Intent(context, CycleWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(intent)
        }
    }
}
```

### Step 3: Register Widget in AndroidManifest.xml

```xml
<receiver
    android:name=".widget.CycleWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/cycle_widget_info" />
</receiver>
```

### Step 4: Create Widget Info

Create `res/xml/cycle_widget_info.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="110dp"
    android:minHeight="110dp"
    android:updatePeriodMillis="3600000"
    android:initialLayout="@layout/cycle_widget"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@drawable/widget_preview" />
```

---

## Data Sync from App

To sync data from your React app to the widgets, you need a Capacitor plugin. Create a simple bridge:

### For iOS

Add to `ios/App/App/WidgetBridge.swift`:

```swift
import Capacitor

@objc(WidgetBridge)
public class WidgetBridge: CAPPlugin {
    @objc func updateWidget(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: "group.app.lovable.periodtracker")
        
        if let daysUntilPeriod = call.getInt("daysUntilPeriod") {
            defaults?.set(daysUntilPeriod, forKey: "daysUntilPeriod")
        }
        if let fertilityStatus = call.getString("fertilityStatus") {
            defaults?.set(fertilityStatus, forKey: "fertilityStatus")
        }
        if let cycleDay = call.getInt("cycleDay") {
            defaults?.set(cycleDay, forKey: "cycleDay")
        }
        
        // Trigger widget refresh
        WidgetCenter.shared.reloadAllTimelines()
        
        call.resolve()
    }
}
```

### For Android

Add to your MainActivity or create a plugin:

```kotlin
fun updateWidgetData(daysUntilPeriod: Int, fertilityStatus: String, cycleDay: Int) {
    val prefs = getSharedPreferences("WidgetData", Context.MODE_PRIVATE)
    prefs.edit().apply {
        putInt("daysUntilPeriod", daysUntilPeriod)
        putString("fertilityStatus", fertilityStatus)
        putInt("cycleDay", cycleDay)
        apply()
    }
    
    CycleWidgetProvider.updateAllWidgets(this)
}
```

---

## Testing

1. Build and run your app on a physical device
2. Long-press on the home screen
3. Add the "Cycle Tracker" widget
4. The widget should display current cycle data

## Notes

- Widgets update based on the `updatePeriodMillis` setting (Android) or Timeline policy (iOS)
- For more frequent updates, consider using background fetch or push notifications
- Always test on physical devices as simulators may not accurately represent widget behavior
