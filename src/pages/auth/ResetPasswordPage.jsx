import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { confirmPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!token) {
        throw new Error(t('invalid_reset_token'));
      }
      
      await confirmPasswordReset(token, data.password);
      navigate('/login?reset=success');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || t('password_reset_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <h2 className="text-lg font-medium mb-2">{t('invalid_reset_link')}</h2>
            <p>{t('reset_link_invalid_or_expired')}</p>
            <Link to="/forgot-password" className="mt-4 inline-block font-medium text-primary hover:text-primary-dark">
              {t('request_new_reset_link')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
        <div className="text-center">
          <img
            src="/logo.png"
            alt="Cameroon Marketplace"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('set_new_password')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('create_new_password_for_account')}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password reset form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('new_password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: t('password_required'),
                    minLength: {
                      value: 8,
                      message: t('password_min_length')
                    }
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirm_password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: t('confirm_password_required'),
                    validate: value => value === password || t('passwords_must_match')
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? t('resetting_password') : t('reset_password')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
