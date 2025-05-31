import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(data.email, data.password);
      navigate(redirect);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || t('login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

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
            {t('sign_in_to_your_account')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('or')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary-dark"
            >
              {t('create_new_account')}
            </Link>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: t('email_required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('invalid_email')
                    }
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder={t('email_placeholder')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: t('password_required')
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                {t('remember_me')}
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                {t('forgot_your_password')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? t('signing_in') : t('sign_in')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
