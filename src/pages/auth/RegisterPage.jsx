import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'customer'
    }
  });
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      await registerUser(data.email, data.password, {
        name: data.name,
        role: data.accountType
      });
      
      navigate('/login?registered=true');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || t('registration_failed'));
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
            {t('create_your_account')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('already_have_account')}{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              {t('sign_in')}
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

        {/* Registration form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('full_name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name', {
                    required: t('name_required')
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder={t('name_placeholder')}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('account_type')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    id="customer"
                    type="radio"
                    value="customer"
                    {...register('accountType')}
                    className="sr-only"
                  />
                  <label
                    htmlFor="customer"
                    className={`flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer ${
                      watch('accountType') === 'customer'
                        ? 'bg-primary-50 border-primary text-primary'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {t('customer')}
                  </label>
                </div>
                <div>
                  <input
                    id="vendor"
                    type="radio"
                    value="vendor"
                    {...register('accountType')}
                    className="sr-only"
                  />
                  <label
                    htmlFor="vendor"
                    className={`flex items-center justify-center px-3 py-2 border rounded-md cursor-pointer ${
                      watch('accountType') === 'vendor'
                        ? 'bg-primary-50 border-primary text-primary'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {t('vendor')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? t('creating_account') : t('create_account')}
            </button>
          </div>

          <div className="text-sm text-center text-gray-500">
            {t('by_registering_you_agree_to_our')}{' '}
            <Link to="/terms" className="text-primary hover:text-primary-dark">
              {t('terms_of_service')}
            </Link>{' '}
            {t('and')}{' '}
            <Link to="/privacy" className="text-primary hover:text-primary-dark">
              {t('privacy_policy')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
