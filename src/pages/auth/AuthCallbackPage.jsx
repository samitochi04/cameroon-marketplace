import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // The hash fragment contains the token information
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        // Redirect to dashboard or home page after successful login
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=true', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">{t('auth.completing_login')}</h2>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
