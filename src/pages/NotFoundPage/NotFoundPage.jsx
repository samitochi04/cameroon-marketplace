import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t('page_not_found', 'Page Not Found')}
        </h2>
        
        <p className="text-gray-600 mb-8">
          {t('page_not_found_message', 'The page you are looking for doesn\'t exist or has been moved.')}
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            {t('back_to_home', 'Back to Home')}
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('go_back', 'Go Back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
