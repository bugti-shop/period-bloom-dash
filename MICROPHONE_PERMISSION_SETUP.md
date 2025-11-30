# Microphone Permission Setup for Android

## Issue
The voice recording feature shows "please give us microphone access" error but doesn't request permission on Android.

## Solution
You need to add the microphone permission to your Android app's manifest file.

### Steps to Fix:

1. **Open Your Android Project**
   - Navigate to: `android/app/src/main/AndroidManifest.xml`

2. **Add Microphone Permission**
   Add this line inside the `<manifest>` tag (before the `<application>` tag):
   ```xml
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   ```

3. **Complete AndroidManifest.xml Example**
   Your manifest should look like this:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <manifest xmlns:android="http://schemas.android.com/apk/res/android">

       <uses-permission android:name="android.permission.INTERNET" />
       <uses-permission android:name="android.permission.RECORD_AUDIO" />
       
       <application
           android:allowBackup="true"
           android:icon="@mipmap/ic_launcher"
           android:label="@string/app_name"
           android:roundIcon="@mipmap/ic_launcher_round"
           android:supportsRtl="true"
           android:theme="@style/AppTheme">
           <!-- Rest of your application config -->
       </application>

   </manifest>
   ```

4. **Rebuild the App**
   After adding the permission:
   ```bash
   npm run build
   npx cap sync android
   npx cap run android
   ```

5. **Test the Recording**
   - Open the app on your Android device
   - Go to the voice notes section
   - Click "Start Recording"
   - Android will now show a permission dialog asking for microphone access
   - Grant the permission
   - Recording should work properly

## Why This Is Needed
Android requires explicit permission declarations in the manifest file for sensitive features like microphone, camera, and location. Without this declaration, the system won't prompt users for permission and the feature will fail.

## Additional Notes
- The permission prompt only appears once per app installation
- Users can revoke permissions in Android Settings → Apps → [Your App] → Permissions
- The app will automatically request permission when you try to record
