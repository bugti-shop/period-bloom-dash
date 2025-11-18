import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d7d475feaa964942a417cc1df71d9da1',
  appName: 'flow-fairytale',
  webDir: 'dist',
  server: {
    url: 'https://d7d475fe-aa96-4942-a417-cc1df71d9da1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Haptics: {
      enabled: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#EC4899",
      sound: "beep.wav",
    }
  }
};

export default config;
