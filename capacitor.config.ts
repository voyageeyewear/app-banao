import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appbanao.builder',
  appName: 'App Banao',
  webDir: 'build/client',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
