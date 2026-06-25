import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flowtime.app',
  appName: 'Flowtime',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_flowtime',
      iconColor: '#b3272e',
      sound: 'timer_end.wav',
    },
  },
};

export default config;
