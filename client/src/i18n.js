import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Temporary
import.meta.env.DEV = false;
// Environment variable for development
const isDev = import.meta.env.DEV;

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
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false, 
    },
    
  });

export default i18n;
