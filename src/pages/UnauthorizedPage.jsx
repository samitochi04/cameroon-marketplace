import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const UnauthorizedPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full bg-red-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          {t('errors.unauthorized')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('errors.unauthorized_message')}
        </p>
        
        {/* Debug information */}
        <div className="mt-6 p-4 bg-gray-100 rounded-md text-left text-xs">
          <p className="font-semibold">Debug Info:</p>
          <p>User: {user ? `${user.email} (${user.role})` : 'Not logged in'}</p>
          <p>Authenticated: {user ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button as={Link} to="/" variant="outline">
            {t('common.go_to_homepage')}
          </Button>
          <Button as={Link} to="/login" variant="primary">
            {t('auth.login')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
