# Android Studio Setup Guide

Complete guide for building and running the Period & Pregnancy Tracker app on Android.

## Prerequisites

1. **Android Studio** (latest stable version)
   - Download: https://developer.android.com/studio

2. **Java Development Kit (JDK) 17+**
   - Android Studio typically includes this

3. **Android SDK** (installed via Android Studio)
   - Minimum SDK: 22 (Android 5.1)
   - Target SDK: 34 (Android 14)

---

## Initial Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone your repository
git clone YOUR_GITHUB_REPO_URL
cd period-bloom-dash

# Install npm dependencies
npm install
```

### Step 2: Add Android Platform

```bash
# Add Android platform to Capacitor
npx cap add android
```

### Step 3: Build and Sync

```bash
# Build the web assets
npm run build

# Sync to Android
npx cap sync android
```

### Step 4: Open in Android Studio

```bash
npx cap open android
```

---

## Required AndroidManifest.xml Permissions

Open `android/app/src/main/AndroidManifest.xml` and ensure these permissions are added inside the `<manifest>` tag (before `<application>`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Internet Access -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Camera for Photo Capture -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    
    <!-- Storage for Photos/Videos -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    
    <!-- Microphone for Voice Notes -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    
    <!-- Google Fit Integration (Optional) -->
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <!-- Main Activity -->
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

        <!-- Boot Receiver for Notifications -->
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

## Gradle Configuration

### android/app/build.gradle

Ensure these settings in your `android/app/build.gradle`:

```gradle
android {
    namespace "app.lovable.a105ecc184b944a7992cf4f49e405f7b"
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "app.lovable.a105ecc184b944a7992cf4f49e405f7b"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "androidx.coordinatorlayout:coordinatorlayout:1.2.0"
    implementation "androidx.core:core-splashscreen:1.0.1"
    
    // Google Fit (Optional - for health integration)
    // implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    // implementation 'com.google.android.gms:play-services-auth:20.7.0'
    
    testImplementation "junit:junit:4.13.2"
    androidTestImplementation "androidx.test.ext:junit:1.1.5"
    androidTestImplementation "androidx.test.espresso:espresso-core:3.5.1"
    implementation project(':capacitor-android')
}
```

---

## Running the App

### On Emulator

1. Open Android Studio
2. Click **AVD Manager** (phone icon with Android)
3. Create or select a virtual device
4. Click **Run** (green play button)

### On Physical Device

1. Enable **Developer Options** on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times

2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging → ON

3. Connect phone via USB cable

4. Run:
```bash
npx cap run android
```

---

## Development Workflow

After making code changes in Lovable:

```bash
# 1. Pull latest changes
git pull

# 2. Install any new dependencies
npm install

# 3. Build web assets
npm run build

# 4. Sync to Android
npx cap sync android

# 5. Run on device/emulator
npx cap run android
```

---

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx cap sync android
```

### Permission Issues

If permissions aren't working:
1. Uninstall the app from device
2. Rebuild and reinstall
3. Check that permissions are in AndroidManifest.xml

### Back Button Not Working

The hardware back button is handled by `@capacitor/app` plugin. Ensure:
1. `@capacitor/app` is installed
2. `useMobileBackButton` hook is used in pages
3. App is rebuilt and synced after changes

### Hot Reload Not Working

Ensure `capacitor.config.ts` has the server URL configured:
```typescript
server: {
  url: "https://a105ecc1-84b9-44a7-992c-f4f49e405f7b.lovableproject.com?forceHideBadge=true",
  cleartext: true
}
```

---

## Publishing to Google Play Store

See [GOOGLE_PLAY_PUBLISHING.md](./GOOGLE_PLAY_PUBLISHING.md) for detailed instructions.
