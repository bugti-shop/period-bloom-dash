# Android Hardware Back Button Implementation

Guide for implementing and testing the hardware back button functionality on Android devices.

---

## Overview

The app uses Capacitor's `@capacitor/app` plugin to handle the Android hardware back button. When pressed, the app navigates back in history instead of closing.

---

## Implementation Details

### Hook: useMobileBackButton

Location: `src/hooks/useMobileBackButton.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const useMobileBackButton = (fallbackPath: string = '/') => {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          navigate(fallbackPath);
        }
      });

      return () => {
        backButtonListener.then(listener => listener.remove());
      };
    }
  }, [navigate, fallbackPath]);
};
```

### Usage in Pages

Every page that needs back button support imports and uses the hook:

```typescript
import { useMobileBackButton } from '@/hooks/useMobileBackButton';

const MyPage = () => {
  useMobileBackButton('/'); // fallback to home if no history
  
  return (
    // page content
  );
};
```

---

## Pages with Back Button Support

The following pages have the back button hook implemented:

### Symptoms Trackers
- `/water` - Water Intake Tracker
- `/sleep` - Sleep Quality Tracker
- `/exercise` - Exercise Logger
- `/cervical-mucus` - Cervical Mucus Tracker
- `/bbt` - BBT Tracker
- `/intimacy` - Intimacy Tracker
- `/appetite` - Appetite Tracker
- `/health` - Health Tracker
- `/stress` - Stress Tracker
- `/digestive` - Digestive Tracker
- `/energy` - Energy Tracker
- `/skin` - Skin Tracker

### Health Monitors
- `/period-product` - Period Product Tracker
- `/weight` - Weight Tracker
- `/birth-control` - Birth Control Tracker
- `/blood-pressure` - Blood Pressure Monitor
- `/glucose` - Glucose Monitor

### Other Pages
- All checklist detail pages
- Article detail pages
- Settings sub-pages

---

## Testing

### On Physical Android Device

1. **Build and Deploy:**
```bash
npm run build
npx cap sync android
npx cap run android
```

2. **Test Navigation:**
   - Open app
   - Navigate to any tracker (e.g., Water Tracker)
   - Press hardware back button
   - App should return to previous page (Symptoms page)

3. **Test at Root:**
   - Navigate to home page
   - Press hardware back button
   - App should stay on home (not close)

### On Android Emulator

1. Open app in emulator
2. Use the back arrow in emulator controls (or press Esc key)
3. Verify navigation works as expected

---

## Troubleshooting

### Back Button Closes App

**Problem:** Pressing back button closes the app instead of navigating.

**Solutions:**
1. Verify `@capacitor/app` is installed:
```bash
npm list @capacitor/app
```

2. Check that `useMobileBackButton` is imported and called in the page

3. Rebuild and resync:
```bash
npm run build
npx cap sync android
```

### Back Button Does Nothing

**Problem:** Back button doesn't respond at all.

**Solutions:**
1. Check that the hook is being used in a component inside `BrowserRouter`

2. Verify the listener is registered (add console.log in hook):
```typescript
App.addListener('backButton', ({ canGoBack }) => {
  console.log('Back button pressed, canGoBack:', canGoBack);
  // ...
});
```

3. Check Android Studio Logcat for errors

### Navigation Goes to Wrong Page

**Problem:** Back button navigates to unexpected page.

**Solutions:**
1. Check the `fallbackPath` parameter passed to the hook

2. Review the browser history stack - the hook uses `window.history.back()` which follows browser history

3. Consider if the page should use a specific fallback instead of history:
```typescript
// Navigate to specific page instead of history.back()
useMobileBackButton('/symptoms'); // Always go to symptoms
```

---

## Adding Back Button to New Pages

When creating a new page that needs back button support:

1. **Import the hook:**
```typescript
import { useMobileBackButton } from '@/hooks/useMobileBackButton';
```

2. **Use at component top level:**
```typescript
const NewPage = () => {
  useMobileBackButton('/parent-route');
  
  // ... rest of component
};
```

3. **Add visual back button (optional but recommended):**
```typescript
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewPage = () => {
  const navigate = useNavigate();
  useMobileBackButton('/');
  
  return (
    <div>
      <header className="flex items-center gap-3 p-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1>Page Title</h1>
      </header>
      {/* content */}
    </div>
  );
};
```

---

## Platform Detection

The hook only activates on native platforms:

```typescript
if (Capacitor.isNativePlatform()) {
  // Only runs on iOS/Android native apps
  // Does NOT run in web browser
}
```

This means:
- ✅ Works on Android device/emulator via Capacitor
- ✅ Works on iOS device/simulator via Capacitor
- ❌ Does NOT work in web browser preview
- ❌ Does NOT work in Lovable preview iframe

---

## Related Files

- `src/hooks/useMobileBackButton.ts` - The hook implementation
- `capacitor.config.ts` - Capacitor configuration
- `android/app/src/main/AndroidManifest.xml` - Android manifest
- All page files in `src/pages/` that use the hook
