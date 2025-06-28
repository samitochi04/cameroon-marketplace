import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Environment variable for development
const isDev = import.meta.env.MODE === 'development';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    debug: isDev,
    
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false, 
    },
    
    returnObjects: true, // Enable returning objects in translations
    returnEmptyString: false,
    
    compatibilityJSON: 'v3', // Suppress i18next JSON format warnings
    
    react: {
      useSuspense: true,
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    }
  });

export default i18n;
