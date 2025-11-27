import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a105ecc184b944a7992cf4f49e405f7b',
  appName: 'period-bloom-dash',
  webDir: 'dist',
  server: {
    url: 'https://a105ecc1-84b9-44a7-992c-f4f49e405f7b.lovableproject.com?forceHideBadge=true',
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
