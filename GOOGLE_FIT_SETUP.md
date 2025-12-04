# Google Fit Integration Setup

Guide for enabling Google Fit health data sync on Android.

---

## Overview

Google Fit integration allows syncing:
- Menstrual cycle data
- Weight measurements
- Exercise/activity logs
- Sleep tracking data

---

## Step 1: Google Cloud Console Setup

### Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Note your project name

### Enable Fitness API

1. Go to "APIs & Services" → "Library"
2. Search for "Fitness API"
3. Click "Enable"

### Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Android" as application type
4. Enter package name: `app.lovable.a105ecc184b944a7992cf4f49e405f7b`
5. Get SHA-1 fingerprint (see below)
6. Create the credential

---

## Step 2: Get SHA-1 Fingerprint

### Debug Keystore (Development)

```bash
cd android
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Release Keystore (Production)

```bash
keytool -list -v -keystore app/release-key.keystore -alias period-tracker
```

Copy the SHA-1 fingerprint and add it to your OAuth credentials.

---

## Step 3: Android Configuration

### Add Permissions

In `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
```

### Add Dependencies

In `android/app/build.gradle`:

```gradle
dependencies {
    // ... existing dependencies
    
    // Google Fit
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

---

## Step 4: Configure OAuth Consent Screen

1. Go to "OAuth consent screen" in Google Cloud Console
2. Select "External" user type
3. Fill in app information:
   - App name: "Period & Pregnancy Tracker"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.activity.write`
   - `https://www.googleapis.com/auth/fitness.body.read`
   - `https://www.googleapis.com/auth/fitness.body.write`
   - `https://www.googleapis.com/auth/fitness.sleep.read`
   - `https://www.googleapis.com/auth/fitness.sleep.write`
5. Add test users (for development)
6. Save

---

## Step 5: App Implementation

The app already includes Google Fit sync code in:
- `src/lib/googleFitSync.ts`
- `src/components/GoogleFitSync.tsx`

### How It Works

1. User taps "Connect Google Fit" in Settings
2. App requests Google Sign-In with Fitness scopes
3. User grants permissions
4. App can read/write health data to Google Fit

### Data Sync Flow

```
App Data → Google Fit Sync → Google Fit API → User's Google Fit Account
```

---

## Step 6: Testing

### Development Testing

1. Add your Google account as a test user in OAuth consent screen
2. Build and run app on physical device
3. Navigate to Settings → Health Integration
4. Tap "Connect Google Fit"
5. Sign in with test account
6. Grant permissions
7. Test sync features

### Verify Data in Google Fit

1. Open Google Fit app on device
2. Check that synced data appears
3. Verify weight, activity, and sleep data

---

## Troubleshooting

### "Sign in failed" Error

- Verify SHA-1 fingerprint matches OAuth credential
- Check that Fitness API is enabled
- Ensure test user is added to OAuth consent screen

### Permission Denied

- User must have Google Fit app installed
- Check that all required scopes are requested
- Verify OAuth consent screen is configured

### Data Not Syncing

- Check network connection
- Verify user granted all permissions
- Look for errors in Android Studio Logcat

### OAuth Consent Not Verified

For production:
1. Submit app for OAuth verification
2. Provide privacy policy
3. Demonstrate app functionality
4. Wait for Google review (can take weeks)

---

## Production Checklist

- [ ] OAuth credentials for release keystore SHA-1
- [ ] OAuth consent screen verified by Google
- [ ] Privacy policy mentions Google Fit data handling
- [ ] Test with multiple Google accounts
- [ ] Handle offline/error scenarios gracefully

---

## Resources

- [Google Fit API Documentation](https://developers.google.com/fit)
- [OAuth 2.0 for Android](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Fitness API Scopes](https://developers.google.com/fit/android/authorization)
