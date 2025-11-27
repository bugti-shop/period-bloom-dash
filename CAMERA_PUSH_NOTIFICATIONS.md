# Camera Integration & Push Notifications Setup

This guide covers the camera integration and push notification features added to the app.

## Camera Integration

### Overview
The app now supports capturing photos directly from the device camera for:
- Bump photos in Pregnancy Journey
- Baby Album photos
- Ultrasound images
- Symptom tracking photos

### Implementation
Camera functionality uses Capacitor's Camera API (`@capacitor/camera`). The integration provides:
- **Take Photo**: Capture directly from camera
- **Gallery**: Select from device photo library
- **Fallback**: File upload for web browsers

### Files Created
- `src/lib/cameraUtils.ts` - Camera utility functions
- Updated `src/components/PhotoLogger.tsx` with camera controls

### Native Requirements
For native apps (iOS/Android), camera permissions must be configured:

#### iOS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to capture photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to select images</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Push Notifications

### Overview
Local push notifications are now implemented for:
1. **Appointment Reminders**: 1 day before, 2 hours before, and 30 minutes before
2. **Medication Alerts**: Daily reminders at scheduled times
3. **Cycle Predictions**: Period reminders, fertility window, ovulation (already implemented)
4. **Symptom Logging**: Customizable daily reminders (already implemented)
5. **Water Intake**: Hydration reminders (already implemented)

### Implementation
Uses Capacitor's Local Notifications API (`@capacitor/local-notifications`).

### Files Created
- `src/lib/appointmentNotifications.ts` - Appointment reminder logic
- `src/lib/medicationNotifications.ts` - Medication alert scheduling

### Notification ID Ranges
To prevent conflicts, notifications use specific ID ranges:
- 1-2: Period reminders
- 10-12: Fertility reminders
- 20-29: Symptom logging reminders
- 3000-3999: Appointment reminders
- 4000-4999: Medication reminders
- 5000+: Water intake reminders

### Features

#### Appointment Reminders
- **1 Day Before**: Reminder with appointment type, time, and location
- **2 Hours Before**: Reminder to prepare documents
- **30 Minutes Before**: Time to leave notification

Automatically scheduled when appointments are added or modified.

#### Medication Alerts
- **Daily Reminders**: Based on medication time settings
- **Repeating**: Automatically repeats every day
- **Customizable**: Each medication can have its own reminder time

Automatically updated when medications are added, modified, or deleted.

### Native Setup

#### iOS (Info.plist)
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

#### Android Configuration
Notifications are enabled by default. Custom notification icon and color configured in `capacitor.config.ts`:
```typescript
LocalNotifications: {
  smallIcon: "ic_stat_icon_config_sample",
  iconColor: "#EC4899",
  sound: "beep.wav",
}
```

### Testing Notifications

#### Web Browser
Local notifications have limited support in browsers. For full testing:
1. Build native app using instructions in `NATIVE_BUILD_INSTRUCTIONS.md`
2. Run on physical device or emulator

#### iOS Simulator
```bash
npx cap run ios
```

#### Android Emulator/Device
```bash
npx cap run android
```

### Permission Flow
1. App requests notification permissions on first use
2. User grants or denies permissions
3. If granted, notifications are scheduled automatically
4. Users can manage notifications in device settings

### Troubleshooting

#### Notifications Not Appearing
1. Check device notification settings
2. Ensure permissions are granted
3. Verify notification IDs don't conflict
4. Check console logs for scheduling errors

#### iOS Specific Issues
- Ensure Info.plist has proper usage descriptions
- Test on physical device (simulator may have limitations)
- Check notification center permissions

#### Android Specific Issues
- Verify Android notification channel settings
- Check battery optimization settings
- Ensure app isn't in doze mode

## Integration with Existing Features

### Symptoms Tracker
Camera integration added to PhotoLogger component for capturing symptom-related photos.

### Pregnancy Journey
Camera can be used in:
- Bump Photo Gallery
- Baby Album
- Ultrasound Album

### Health Tracking
Notifications integrated with:
- Appointment scheduler
- Medication tracker
- Existing cycle tracking reminders

## Future Enhancements

Potential additions:
- Rich notifications with action buttons
- Notification grouping by category
- Custom notification sounds per type
- Snooze functionality
- Notification history/log

## Resources

- [Capacitor Camera API](https://capacitorjs.com/docs/apis/camera)
- [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications)
- [iOS Push Notification Guide](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Guide](https://developer.android.com/develop/ui/views/notifications)
