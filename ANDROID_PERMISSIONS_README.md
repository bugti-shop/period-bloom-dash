# Android Permissions Setup Guide

This document provides a complete reference for all Android permissions required by the Period & Pregnancy Tracker app.

## Quick Setup

Copy the complete permissions block below into your `android/app/src/main/AndroidManifest.xml` file, inside the `<manifest>` tag but before the `<application>` tag.

## Complete AndroidManifest.xml Permissions

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- ==================== NETWORK ==================== -->
    <!-- Required for app functionality and hot reload -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- ==================== CAMERA ==================== -->
    <!-- Required for photo capture in bump gallery, baby album, symptom photos -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <!-- ==================== MICROPHONE ==================== -->
    <!-- Required for voice notes recording -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <!-- ==================== STORAGE ==================== -->
    <!-- For Android 12 and below -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    
    <!-- For Android 13+ (API 33+) - Granular media permissions -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <!-- ==================== NOTIFICATIONS ==================== -->
    <!-- Required for reminders and alerts -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- For exact alarm scheduling (period/fertility reminders) -->
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

    <!-- ==================== GOOGLE FIT (Optional) ==================== -->
    <!-- Required only if using Google Fit integration -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Local Notifications Receiver -->
        <receiver android:name="com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver" android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
```

---

## Permission Details

### 1. Network Permissions

| Permission | Purpose |
|------------|---------|
| `INTERNET` | Required for hot reload during development and potential cloud sync |
| `ACCESS_NETWORK_STATE` | Check network connectivity status |

### 2. Camera Permission

| Permission | Purpose |
|------------|---------|
| `CAMERA` | Capture photos for bump gallery, baby album, ultrasound album, symptom tracking |

**Features Used:**
- Bump photo gallery
- Baby album photos
- Ultrasound album
- Symptom photo logging
- Skin condition photos

### 3. Microphone Permission

| Permission | Purpose |
|------------|---------|
| `RECORD_AUDIO` | Voice notes recording with speech-to-text transcription |

**Features Used:**
- Voice notes in daily tracking
- Speech recognition for transcriptions

### 4. Storage Permissions

| Permission | Android Version | Purpose |
|------------|-----------------|---------|
| `READ_EXTERNAL_STORAGE` | ≤ Android 12 | Read photos from gallery |
| `WRITE_EXTERNAL_STORAGE` | ≤ Android 12 | Save photos and data |
| `READ_MEDIA_IMAGES` | Android 13+ | Read images from gallery |
| `READ_MEDIA_VIDEO` | Android 13+ | Read videos from gallery |
| `READ_MEDIA_AUDIO` | Android 13+ | Read audio files |

**Features Used:**
- Save and load photos
- Export data and reports
- Backup and restore functionality
- Photo galleries (bump, baby, ultrasound, family)

### 5. Notification Permissions

| Permission | Purpose |
|------------|---------|
| `POST_NOTIFICATIONS` | Display reminders and alerts (Android 13+) |
| `VIBRATE` | Vibration feedback for notifications |
| `WAKE_LOCK` | Keep device awake for scheduled notifications |
| `RECEIVE_BOOT_COMPLETED` | Restore scheduled notifications after device restart |
| `USE_EXACT_ALARM` | Schedule exact time notifications |
| `SCHEDULE_EXACT_ALARM` | Schedule precise alarms for reminders |

**Features Used:**
- Period reminders
- Fertility window alerts
- Medication reminders
- Water intake reminders
- Symptom logging reminders
- Contraction timer alerts

### 6. Google Fit (Optional)

| Permission | Purpose |
|------------|---------|
| `ACTIVITY_RECOGNITION` | Access step count and activity data from Google Fit |

---

## Android Version Considerations

### Android 13+ (API 33+)
- Requires `POST_NOTIFICATIONS` permission with runtime request
- Uses granular media permissions (`READ_MEDIA_IMAGES`, etc.)
- Legacy storage permissions ignored

### Android 12 (API 31-32)
- Uses `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE`
- `SCHEDULE_EXACT_ALARM` requires special handling

### Android 10-11 (API 29-30)
- Scoped storage applies
- May need `requestLegacyExternalStorage="true"` in application tag

---

## File Provider Setup

Create the file `android/app/src/main/res/xml/file_paths.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external" path="." />
    <external-files-path name="external_files" path="." />
    <cache-path name="cache" path="." />
    <files-path name="files" path="." />
</paths>
```

---

## Build Commands

After setting up permissions:

```bash
# Install dependencies
npm install

# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Run on device/emulator
npx cap run android

# Or open in Android Studio
npx cap open android
```

---

## Testing Permissions

### Fresh Install Test
1. Uninstall the app completely
2. Reinstall and test each feature requiring permissions
3. Verify permission dialogs appear correctly

### Permission Denied Test
1. Deny each permission when prompted
2. Verify app handles denial gracefully
3. Check that appropriate error messages are shown

### Settings Reset Test
1. Go to Android Settings → Apps → [App Name] → Permissions
2. Revoke permissions
3. Test that app re-requests permissions when needed

---

## Troubleshooting

### Camera Not Working
- Ensure `CAMERA` permission is in manifest
- Check that camera hardware feature is declared
- Verify FileProvider is configured correctly

### Voice Recording Fails
- Ensure `RECORD_AUDIO` permission is in manifest
- Check microphone hardware is available
- Verify permission is granted at runtime

### Photos Not Saving
- For Android 13+: Check `READ_MEDIA_IMAGES` permission
- For Android 12-: Check `WRITE_EXTERNAL_STORAGE` permission
- Verify FileProvider paths are configured

### Notifications Not Appearing
- For Android 13+: Ensure `POST_NOTIFICATIONS` is granted
- Check `VIBRATE` and `WAKE_LOCK` permissions
- Verify `RECEIVE_BOOT_COMPLETED` for restart persistence

---

## Related Documentation

- [ANDROID_STUDIO_SETUP.md](./ANDROID_STUDIO_SETUP.md) - Complete Android Studio setup guide
- [ANDROID_PERMISSIONS_GUIDE.md](./ANDROID_PERMISSIONS_GUIDE.md) - Detailed permissions reference
- [MICROPHONE_PERMISSION_SETUP.md](./MICROPHONE_PERMISSION_SETUP.md) - Microphone-specific setup
- [NATIVE_BUILD_INSTRUCTIONS.md](./NATIVE_BUILD_INSTRUCTIONS.md) - Native build guide
- [Capacitor Documentation](https://capacitorjs.com/docs)
