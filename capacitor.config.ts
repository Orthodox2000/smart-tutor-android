import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ankit.smarttutors',
  appName: 'Smart Tutors',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    allowNavigation: ['smart-tutor-android.vercel.app', '.vercel.app'],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#F97316',
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;
