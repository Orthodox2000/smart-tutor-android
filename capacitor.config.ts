import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ankit.smarttutor',
  appName: 'Smart Tutors',
  webDir: 'dist',
  server: {
    url: 'https://smart-tutor-android.vercel.app/',
    cleartext: true
  },
  plugins: {
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
