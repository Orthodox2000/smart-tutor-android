import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          common: {
            dashboard: 'Dashboard',
            courses: 'Courses',
            students: 'Students',
            teachers: 'Teachers',
            profile: 'Profile',
            logout: 'Logout',
            login: 'Login',
            register: 'Register',
            search: 'Search...',
            notifications: 'Notifications',
          },
          roles: {
            admin: 'Administrator',
            teacher: 'Teacher',
            student: 'Student',
          },
          dashboard: {
            welcome: 'Welcome back, {{name}}',
            summary: 'Quick Summary',
          },
        },
      },
      hi: {
        translation: {
          common: {
            dashboard: 'डैशबोर्ड',
            courses: 'पाठ्यक्रम',
            students: 'छात्र',
            teachers: 'शिक्षक',
            profile: 'प्रोफ़ाइल',
            logout: 'लॉग आउट',
            login: 'लॉग इन',
            register: 'पंजीकरण',
            search: 'खोजें...',
            notifications: 'सूचनाएं',
          },
        },
      },
    },
  });

export default i18n;
