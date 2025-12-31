# Lufi - Period & Pregnancy Tracker

A comprehensive period tracking and pregnancy monitoring app built with React, Capacitor, and RevenueCat for in-app subscriptions.

## Project info

**URL**: https://lovable.dev/projects/d7d475fe-aa96-4942-a417-cc1df71d9da1

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Mobile**: Capacitor 7+
- **Payments**: RevenueCat SDK
- **Backend**: Supabase (Lovable Cloud)

## Google Play Subscription Dependencies

The following Capacitor dependencies are required for Google Play subscriptions (version 7+):

```json
{
  "dependencies": {
    "@capacitor/core": "^7.4.4",
    "@capacitor/cli": "^7.4.4",
    "@capacitor/android": "^7.4.4",
    "@capacitor/ios": "^7.4.4",
    "@capacitor/app": "^7.1.0",
    "@capacitor/camera": "^7.0.2",
    "@capacitor/filesystem": "^7.1.5",
    "@capacitor/haptics": "^7.0.2",
    "@capacitor/local-notifications": "^7.0.3",
    "@revenuecat/purchases-capacitor": "latest"
  }
}
```

### RevenueCat Configuration

The app uses RevenueCat for subscription management with the following product IDs:

| Plan | Product ID | Base Plan ID | Trial Offer ID |
|------|------------|--------------|----------------|
| Monthly | `lufi_mo` | `lufi-mo` | `lufi-monthly-offer` |
| Yearly | `lufi_yr` | `lufi-yearly-plan` | `lufi-yearly-trial` |

**Entitlement**: `Lufi Pro`

### Setting Up Subscriptions

1. **Google Play Console**:
   - Create subscription products with the IDs above
   - Configure base plans and trial offers
   - Link to RevenueCat

2. **RevenueCat Dashboard**:
   - Add your Google Play app
   - Configure the products and entitlements
   - Set up the "Lufi Pro" entitlement

## How to Edit This Code

### Use Lovable

Simply visit the [Lovable Project](https://lovable.dev/projects/d7d475fe-aa96-4942-a417-cc1df71d9da1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

### Use Your Preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes.

**Requirements**: Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Building for Mobile

### Android Build

```sh
# Install dependencies
npm install

# Build the web app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync web assets to native project
npx cap sync android

# Open in Android Studio
npx cap open android

# Or run directly
npx cap run android
```

### iOS Build

```sh
# Install dependencies
npm install

# Build the web app
npm run build

# Add iOS platform (first time only)
npx cap add ios

# Sync web assets to native project
npx cap sync ios

# Open in Xcode
npx cap open ios

# Or run directly (requires Mac with Xcode)
npx cap run ios
```

## Deployment

### Web Deployment

Open [Lovable](https://lovable.dev/projects/d7d475fe-aa96-4942-a417-cc1df71d9da1) and click on Share -> Publish.

### Mobile Deployment

1. Build the app using Android Studio or Xcode
2. Sign the app with your release keystore/certificate
3. Upload to Google Play Console or App Store Connect

## Custom Domain

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Features

- 📅 Period tracking with cycle predictions
- 🤰 Pregnancy mode with weekly development updates
- 💊 Medication and supplement tracking
- 📊 Health metrics (water, sleep, exercise, etc.)
- 📝 Notes and journal entries
- 🔔 Customizable reminders
- 💳 Premium subscription with RevenueCat
