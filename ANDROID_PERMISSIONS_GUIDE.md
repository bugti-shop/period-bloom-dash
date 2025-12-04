# Android Permissions Guide

Complete reference for all permissions required by the Period & Pregnancy Tracker app.

---

## Permission Categories

### 1. Camera & Media Permissions

Required for: Bump photos, Baby album, Ultrasound images, Skin tracker photos

```xml
<!-- Camera access -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Storage access (Android 12 and below) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Media access (Android 13+) -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```

**Runtime Permission Request:**
The app automatically requests camera permission when user tries to take a photo.

---

### 2. Microphone Permission

Required for: Voice notes in pregnancy journey

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

**Runtime Permission Request:**
Requested when user taps "Start Recording" in voice notes feature.

---

### 3. Notification Permissions

Required for: Appointment reminders, medication alerts, fertility predictions, water reminders

```xml
<!-- Basic notification -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Vibration feedback -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Keep device awake for notification -->
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Restore notifications after reboot -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

<!-- Exact timing for notifications -->
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

**Boot Receiver (in AndroidManifest.xml inside `<application>`):**
```xml
<receiver android:name="com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver" 
    android:exported="false">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

---

### 4. Network Permission

Required for: Hot reload during development, potential future cloud sync

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

---

### 5. Google Fit Integration (Optional)

Required for: Syncing health data with Google Fit

```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
```

**Additional Setup Required:**
1. Enable Fitness API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add SHA-1 fingerprint

See [GOOGLE_FIT_SETUP.md](./GOOGLE_FIT_SETUP.md) for detailed instructions.

---

## Complete AndroidManifest.xml Example

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Network -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Camera & Media -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    
    <!-- Microphone -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    
    <!-- Google Fit (Optional) -->
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
            android:exported="true"
            android:label="@string/title_activity_main"
            android:launchMode="singleTask"
            android:name=".MainActivity"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <receiver android:name="com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver" 
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
```

---

## Android Version Considerations

| Android Version | API Level | Special Considerations |
|----------------|-----------|------------------------|
| Android 13+ | 33+ | Requires `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` instead of `READ_EXTERNAL_STORAGE` |
| Android 12+ | 31+ | Requires `SCHEDULE_EXACT_ALARM` for precise notification timing |
| Android 11+ | 30+ | Scoped storage enforced - use Capacitor Filesystem API |
| Android 10+ | 29+ | Background location requires `ACCESS_BACKGROUND_LOCATION` (not used in this app) |

---

## Testing Permissions

1. **Fresh Install Test:**
   - Uninstall app completely
   - Install fresh build
   - Test each feature that requires permissions
   - Verify permission dialogs appear

2. **Denied Permission Test:**
   - Deny a permission when prompted
   - Verify app handles denial gracefully
   - Check that feature shows appropriate error message

3. **Settings Reset Test:**
   - Go to Settings → Apps → [Your App] → Permissions
   - Revoke a permission
   - Open app and test affected feature
   - Verify permission is re-requested
