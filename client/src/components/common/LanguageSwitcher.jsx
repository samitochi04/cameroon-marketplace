import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={`px-2 py-1 rounded ${i18n.language === 'fr' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        onClick={() => changeLanguage('fr')}
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
