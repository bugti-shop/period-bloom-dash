# Native iOS & Android Build Instructions

This guide will help you build the app as a native iOS and Android application with Apple Health and Google Fit integration.

## Prerequisites

### For iOS Development
- **Mac computer** with macOS (required for iOS builds)
- **Xcode** 14+ installed from the Mac App Store
- **CocoaPods** installed: `sudo gem install cocoapods`
- **Apple Developer Account** (free or paid)

### For Android Development
- **Android Studio** installed (works on Mac, Windows, or Linux)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** (installed via Android Studio)

### General Requirements
- **Git** installed
- **Node.js** 18+ and npm installed

---

## Step 1: Export Project to GitHub

1. Click the **"Export to GitHub"** button in Lovable
2. Clone your repository to your local machine:
   ```bash
   git clone YOUR_GITHUB_REPO_URL
   cd period-bloom-dash
   ```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Add Native Platforms

### Add iOS Platform
```bash
npx cap add ios
```

### Add Android Platform
```bash
npx cap add android
```

---

## Step 4: Configure Native Permissions

### iOS - Apple Health Integration

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode, select your app target → **"Signing & Capabilities"** tab

3. Click **"+ Capability"** and add **"HealthKit"**

4. Open `ios/App/App/Info.plist` and add:
   ```xml
   <key>NSHealthShareUsageDescription</key>
   <string>We need access to read your health data to sync with the app</string>
   <key>NSHealthUpdateUsageDescription</key>
   <string>We need access to write your cycle data to Apple Health</string>
   ```

5. Install the Health plugin:
   ```bash
   npm install @capacitor-community/health
   npx cap sync ios
   ```

### Android - Google Fit Integration

1. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```

2. Open `android/app/src/main/AndroidManifest.xml` and add inside `<application>`:
   ```xml
   <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
   ```

3. Enable Google Fit API in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable **"Fitness API"**
   - Create OAuth 2.0 credentials for Android app
   - Add your app's package name and SHA-1 certificate fingerprint

4. Add Google Fit dependency to `android/app/build.gradle`:
   ```gradle
   dependencies {
       implementation 'com.google.android.gms:play-services-fitness:21.1.0'
       implementation 'com.google.android.gms:play-services-auth:20.7.0'
   }
   ```

---

## Step 5: Build and Run

### Build the Web Assets
```bash
npm run build
```

### Sync Native Projects
```bash
npx cap sync
```

### Run on iOS
```bash
npx cap run ios
```
Or open in Xcode and click the Run button.

### Run on Android
```bash
npx cap run android
```
Or open in Android Studio and click the Run button.

---

## Step 6: Testing Health Integration

### iOS - Apple Health
1. On a physical device or simulator with Health app:
   - Open the app
   - Navigate to Settings → Health Integration & Medical Export
   - Tap "Connect Apple Health"
   - Grant permissions when prompted
   - Use sync features to test data exchange

### Android - Google Fit
1. On a physical device with Google Fit installed:
   - Open the app
   - Navigate to Settings → Health Integration & Medical Export
   - Tap "Connect Google Fit"
   - Sign in with Google account
   - Grant fitness data permissions
   - Test sync features

---

## Development Workflow

After making code changes in Lovable:

1. **Pull latest changes** from GitHub:
   ```bash
   git pull
   ```

2. **Rebuild web assets**:
   ```bash
   npm run build
   ```

3. **Sync native projects**:
   ```bash
   npx cap sync
   ```

4. **Run on device/emulator**:
   ```bash
   npx cap run ios
   # or
   npx cap run android
   ```

---

## Publishing to App Stores

### iOS App Store
1. In Xcode, set up your provisioning profile and signing certificates
2. Archive the app: Product → Archive
3. Upload to App Store Connect via Xcode Organizer
4. Complete app listing in App Store Connect
5. Submit for review

### Google Play Store
1. In Android Studio, generate signed APK/Bundle: Build → Generate Signed Bundle/APK
2. Create app listing in Google Play Console
3. Upload AAB file
4. Complete store listing and content rating
5. Submit for review

---

## Troubleshooting

### iOS Build Issues
- **CocoaPods error**: Run `cd ios/App && pod install`
- **Signing error**: Configure your Apple Developer account in Xcode preferences
- **Health permissions not working**: Ensure Info.plist has correct usage descriptions

### Android Build Issues
- **Gradle sync failed**: Check `android/build.gradle` for correct dependencies
- **Google Fit connection error**: Verify OAuth credentials in Google Cloud Console
- **SDK version mismatch**: Update Android SDK in Android Studio SDK Manager

### General Issues
- **Hot reload not working**: The server URL in `capacitor.config.ts` enables hot reload from Lovable sandbox
- **Native plugin not found**: Run `npx cap sync` after installing new plugins
- **Build fails**: Clear cache with `npx cap clean` then rebuild

---

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Health Integration](https://github.com/capacitor-community/health)
- [Google Fit API Documentation](https://developers.google.com/fit)
- [Lovable Capacitor Guide](https://docs.lovable.dev/tips-tricks/capacitor)

---

## Support

For questions or issues with native builds, refer to:
- Lovable Discord community
- Capacitor GitHub issues
- Platform-specific developer forums
