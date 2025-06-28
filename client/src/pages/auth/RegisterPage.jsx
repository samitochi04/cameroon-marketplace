import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton } from '@/components/ui/Google';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
  const accountType = watch('accountType');
  const isCustomerSelected = accountType === 'customer';
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await registerUser(data.email, data.password, {
        name: data.name,
        role: data.accountType
      });
      
      // Show success message in French as requested
      setSuccessMessage("Votre compte à été créer avec succes");
      
      // Wait a bit longer before redirect so user can read message
      setTimeout(() => {
        // Redirect with a custom parameter to show the "Maintenant connecter vous" message
        navigate('/login?registered=true');
      }, 3000);
    } catch (error) {
      console.error('Registration error in component:', error);
      
      // More helpful error messages
      if (error.message?.includes('email')) {
        setError('Invalid email address or this email is already in use.');
      } else if (error.message?.includes('password')) {
        setError('Password issue: ' + error.message);
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegistration = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      
      // Use the same loginWithGoogle function as login page
      // but we know this is registration because it's coming from register page
      await loginWithGoogle();
      // The redirect will happen automatically through the callback
    } catch (error) {
      console.error('Google registration error:', error);
      setError(error.message || t('auth.registration_failed'));
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
        <div className="text-center">
          <img
            src="/assets/logo.svg"
            alt="AXIS Shop Logo"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.create_your_account')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.already_have_account')}{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              {t('auth.sign_in')}
            </Link>
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Account type selection - moved to top */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.account_type')}
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
                  accountType === 'customer'
                    ? 'bg-primary-50 border-primary text-primary'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {t('auth.customer')}
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
                  accountType === 'vendor'
                    ? 'bg-primary-50 border-primary text-primary'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {t('auth.vendor')}
              </label>
            </div>
          </div>
        </div>

        {/* Only show Google sign-up for customers */}
        {isCustomerSelected && (
          <>
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">{t('auth.or_continue_with')}</span>
              </div>
            </div>

            {/* Google registration button */}
            <div>
              <GoogleButton 
                onClick={handleGoogleRegistration} 
                loading={googleLoading}
                label={t('auth.sign_up_with_google')}
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">{t('auth.or_register_with_email')}</span>
              </div>
            </div>
          </>
        )}

        {/* Registration form */}
        <form className="mt-2 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.full_name')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  {...register('name', {
                    required: t('auth.name_required')
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder={t('auth.name_placeholder')}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: t('auth.email_required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('auth.invalid_email')
                    }
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder={t('auth.email_placeholder')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: t('auth.password_required'),
                    minLength: {
                      value: 8,
                      message: t('auth.password_min_length')
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
                {t('auth.confirm_password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: t('auth.confirm_password_required'),
                    validate: value => value === password || t('auth.passwords_must_match')
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? t('auth.creating_account') : t('auth.create_account')}
            </button>
          </div>

          <div className="text-sm text-center text-gray-500">
            {t('auth.by_registering_you_agree_to_our')}{' '}
            <Link to="/terms" className="text-primary hover:text-primary-dark">
              {t('auth.terms_of_service')}
            </Link>{' '}
            {t('common.and')}{' '}
            <Link to="/privacy" className="text-primary hover:text-primary-dark">
              {t('auth.privacy_policy')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
