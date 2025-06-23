import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: '',
    }
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await resetPassword(data.email);
      setSuccess(true);
      setEmailSent(data.email);
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User not found')) {
        setError(t('auth.email_not_found'));
      } else if (error.message?.includes('Email not confirmed')) {
        setError(t('auth.email_not_verified'));
      } else {
        setError(error.message || t('auth.password_reset_failed'));
      }
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
            src="/assets/logo.svg"
            alt="Cameroon Marketplace"
            className="mx-auto h-16 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.reset_password')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {success 
              ? t('auth.reset_email_sent_description')
              : t('auth.enter_email_for_reset')
            }
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('auth.reset_email_sent')}</p>
                <p className="text-sm mt-1">
                  {t('auth.reset_email_sent_to')} <strong>{emailSent}</strong>
                </p>
                <p className="text-sm mt-1">
                  {t('auth.check_email_and_spam')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password reset form */}
        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm">
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
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('auth.sending') : t('auth.send_reset_email')}
              </button>
            </div>
          </form>
        )}

        {/* Back to login link */}
        <div className="text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center font-medium text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('auth.back_to_login')}
          </Link>
        </div>

        {/* Resend option for success state */}
        {success && (
          <div className="text-center">
            <button
              onClick={() => {
                setSuccess(false);
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {t('auth.didnt_receive_email')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
