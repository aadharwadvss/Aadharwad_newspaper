import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import mrTranslation from '../locales/mr/translation.json';
import enTranslation from '../locales/en/translation.json';

const resources = {
  mr: {
    translation: mrTranslation
  },
  en: {
    translation: enTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'mr',
    lng: 'mr', // Always start with Marathi on server
    
    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false // Prevent hydration issues
    }
  });

// Set language from localStorage after hydration (client-side only)
if (typeof window !== 'undefined') {
  const savedLang = localStorage.getItem('language');
  if (savedLang && savedLang !== i18n.language) {
    i18n.changeLanguage(savedLang);
  }
}
export default i18n;
