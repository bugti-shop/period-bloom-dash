# Google Play Store Publishing Guide

Step-by-step guide to publish the Period & Pregnancy Tracker app on Google Play Store.

---

## Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Register at: https://play.google.com/console

2. **Signed Release APK/AAB**

3. **App Assets:**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (minimum 2, up to 8 per device type)
   - Short description (80 characters max)
   - Full description (4000 characters max)

---

## Step 1: Generate Signed Release Build

### Create Keystore (First Time Only)

```bash
cd android/app
keytool -genkey -v -keystore release-key.keystore -alias period-tracker -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** Store the keystore file and passwords securely. You'll need them for all future updates.

### Configure Signing in build.gradle

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            storeFile file('release-key.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'period-tracker'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build Release AAB

```bash
# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Select "Android App Bundle"
3. Choose your keystore
4. Select "release" build variant
5. Click "Create"

The AAB file will be in: `android/app/release/app-release.aab`

---

## Step 2: Create Google Play Console Listing

### Basic Information

1. Go to Google Play Console
2. Click "Create app"
3. Fill in:
   - App name: "Period & Pregnancy Tracker"
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free (or Paid if using paywall)

### Store Listing

**Short Description (80 chars):**
```
Track your period, pregnancy & health. Fertility predictions & baby journey.
```

**Full Description:**
```
Period & Pregnancy Tracker is your complete companion for menstrual health and pregnancy journey.

PERIOD TRACKING
• Accurate period and ovulation predictions
• Fertility window calculations
• Symptom logging with pattern analysis
• Mood and energy tracking
• Water intake and sleep monitoring
• Cervical mucus tracking
• PMS severity predictions

PREGNANCY TRACKING
• Week-by-week fetal development visualization
• Bump photo gallery with comparison features
• Baby album and ultrasound organization
• Voice notes for journal entries
• Contraction timer
• Kick counter
• Weight and blood pressure monitoring
• Appointment scheduler with reminders

HEALTH FEATURES
• Unified health dashboard
• Medication tracking with interaction alerts
• Export data for healthcare providers
• PDF medical reports
• Apple Health & Google Fit sync

PRIVACY FOCUSED
• All data stored locally on your device
• No account required
• Disguise mode for privacy
• Offline functionality

Beautiful, intuitive design with multiple themes including astrology mode. Your health data, your control.
```

---

## Step 3: Content Rating

Complete the content rating questionnaire:

1. Go to "Content rating" in Play Console
2. Start questionnaire
3. Answer questions about:
   - Violence: None
   - Sexual content: None
   - Language: None
   - Controlled substances: None (unless medication tracking counts)
   - User interaction: None (offline app)

Expected rating: **Everyone** or **3+**

---

## Step 4: App Privacy

### Data Safety Section

Declare data handling practices:

**Data collected:**
- Health information (stored locally only)
- Photos/Videos (stored locally only)

**Data shared:**
- None (offline-first app)

**Security practices:**
- Data is encrypted in transit (if any network features)
- Data stored securely on device

### Privacy Policy

Create and host a privacy policy. Include:
- What data is collected
- How data is stored (locally)
- No data sharing with third parties
- User rights to delete data

---

## Step 5: Upload and Release

### Internal Testing (Recommended First)

1. Go to "Testing" → "Internal testing"
2. Create a release
3. Upload your AAB file
4. Add testers (email addresses)
5. Roll out to internal testers

### Production Release

1. Go to "Production"
2. Create a new release
3. Upload AAB file
4. Add release notes:
```
Version 1.0.0
• Initial release
• Period tracking with fertility predictions
• Pregnancy journey with 40-week tracking
• Bump photo gallery and baby album
• Health trackers and symptom logging
• Offline-first with local storage
```
5. Review and roll out

---

## Step 6: Post-Launch

### Monitor Reviews
- Respond to user feedback
- Track crash reports in Play Console
- Monitor vital statistics

### Update Process

For each update:
```bash
# Increment versionCode and versionName in build.gradle
# Build new release
npm run build
npx cap sync android
# Generate signed AAB in Android Studio
# Upload to Play Console
```

---

## App Requirements Checklist

- [ ] Keystore created and securely stored
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] At least 2 screenshots per device type
- [ ] Short description (80 chars)
- [ ] Full description
- [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] Target API level 34 (required by Google)
- [ ] 64-bit support (default with Capacitor)

---

## Common Rejection Reasons

1. **Missing Privacy Policy** - Must have accessible privacy policy URL
2. **Incorrect Content Rating** - Health apps may need special considerations
3. **Missing Permissions Justification** - Explain why each permission is needed
4. **Target SDK Too Low** - Must target Android 14 (API 34) as of 2024
5. **Health Claims** - Avoid making medical claims; this is a tracking tool, not medical advice

---

## Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [App Quality Guidelines](https://developer.android.com/docs/quality-guidelines/core-app-quality)
