import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton } from '@/components/ui/Google';
import { checkEmailConfirmation, debugCheckCredentials } from '@/utils/authHelpers';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const registered = searchParams.get('registered') === 'true';
  const verificationRequired = searchParams.get('verification') === 'required';
  const { login, loginWithGoogle, loading, user, authError, clearAuthError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [credentialCheckResult, setCredentialCheckResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const redirectAttempted = useRef(false);
  
  // Define isSubmitting before using it in the effect
  const isSubmitting = loading || localLoading || googleLoading;
  
  // Redirect if already logged in - with safeguard
  useEffect(() => {
    // Get the current URL search params to check if we're coming from registration
    const fromRegistration = searchParams.get('registered') === 'true' || 
                             searchParams.get('verification') === 'required';
    
    // If user is authenticated AND we're not coming from registration, redirect
    if (user && !redirectAttempted.current && !fromRegistration) {
      redirectAttempted.current = true;
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect, searchParams]);
  
  // Clear errors when component mounts
  useEffect(() => {
    clearAuthError?.();
    setError('');
    return () => {
      // Clean up any local state when component unmounts
      setLocalLoading(false);
      setError('');
    };
  }, [clearAuthError]);

  // Sync authError from context
  useEffect(() => {
    if (authError) {
      setError(authError);
      setLocalLoading(false); // Ensure we're not stuck in loading state
    }
  }, [authError]);
  
  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeoutId;
    
    if (isSubmitting) {
      // Set a timeout to clear loading state if it takes too long
      timeoutId = setTimeout(() => {
        if (localLoading) {
          setLocalLoading(false);
          setError(t('login_timeout'));
          console.warn('Login operation timed out');
        }
      }, 15000); // 15 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSubmitting, localLoading, t]);
  
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
  
  // Add a debug function to check credentials without logging in
  const handleDebugCheck = async () => {
    const formValues = getValues();
    if (!formValues.email || !formValues.password) {
      setError('Please enter both email and password to check credentials');
      return;
    }
    
    setLocalLoading(true);
    try {
      const result = await debugCheckCredentials(formValues.email, formValues.password);
      setCredentialCheckResult(result);
    } catch (e) {
      setCredentialCheckResult({
        valid: false,
        message: `Error: ${e.message}`
      });
    } finally {
      setLocalLoading(false);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      // Don't try to login if we're already trying
      if (isSubmitting) return;
      
      setLocalLoading(true);
      setError('');
      setEmailForResend(data.email); // Save email for potential resend
      
      try {
        const loginResult = await login(data.email, data.password);
        
        if (loginResult && loginResult.session) {
          // Set success message and redirect to home page
          setSuccessMessage('Connexion réussie');
          
          // Short delay for better UX, then redirect to home
          setTimeout(() => {
            navigate('/?loginSuccess=true', { replace: true });
          }, 1000);
        }
      } catch (error) {
        console.log("Login error:", error);
        
        // Provide very specific error messages
        if (error.message?.includes('Email not confirmed')) {
          setError('Your email is not verified. Please check your inbox for the verification email or click below to resend.');
        } else if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please verify your credentials. If you just registered, your account might not be active yet.');
        } else if (error.message?.includes('Too many requests')) {
          setError('Too many login attempts. Please try again later.');
        } else {
          setError(error.message || 'Login failed. Please try again.');
        }
        throw error;
      }
    } catch (error) {
      console.log('Login error:', error);
      setLocalLoading(false);
    }
  };

  // Add a function to resend confirmation email
  const handleResendVerification = async () => {
    try {
      setIsResendingEmail(true);
      
      const { isConfirmed, message } = await checkEmailConfirmation(emailForResend);
      
      if (!isConfirmed) {
        setError(message);
      } else {
        setError('Your email is already verified. Please try logging in again.');
      }
    } catch (e) {
      setError('Failed to resend verification email. Please try again later.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Provide a way to recover from stuck state
  const handleCancelLogin = () => {
    setLocalLoading(false);
    setError('');
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      
      await loginWithGoogle();
      // The redirect will happen via AuthCallbackPage.jsx to home with success param
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || t('auth.login_failed'));
      setGoogleLoading(false);
    }
  };

  // Use an effect to show success messages based on URL params
  useEffect(() => {
    if (registered) {
      // Changed message as requested
      setSuccessMessage('Maintenant connecter vous');
    } else if (verificationRequired) {
      // Changed message as requested
      setSuccessMessage('Votre compte à été créer avec succes');
    }
    
    // Clear message after 10 seconds
    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [registered, verificationRequired, t]);

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
            {t('auth.sign_in_to_your_account')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('common.or')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary-dark"
            >
              {t('auth.signup')}
            </Link>
          </p>
        </div>

        {/* Success message for registration or verification */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message with resend option if email not confirmed */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex flex-col items-start">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            
            {error.includes('email') && error.includes('confirm') && (
              <button 
                type="button"
                disabled={isResendingEmail}
                onClick={handleResendVerification}
                className="mt-2 ml-7 text-sm text-primary hover:underline"
              >
                {isResendingEmail ? "Sending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        {/* Login form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
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
                    required: t('auth.password_required')
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
                {t('auth.remember_me')}
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                {t('auth.forgot_your_password')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? "bg-primary/70" : "bg-primary hover:bg-primary-dark"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {isSubmitting && !googleLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('auth.signing_in')}
                </>
              ) : (
                t('auth.sign_in')
              )}
            </button>
            
            {/* Add cancel button when stuck loading for a while */}
            {isSubmitting && (
              <button 
                type="button" 
                onClick={handleCancelLogin}
                className="mt-2 w-full text-sm text-gray-500 underline"
              >
                {t('auth.cancel_login')}
              </button>
            )}
          </div>
          
          {/* Add debug mode toggle */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {debugMode ? "Hide Debug Options" : "Show Debug Options"}
            </button>
          </div>
          
          {/* Debug mode panel */}
          {debugMode && (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Authentication Debug</h4>
              <div className="space-y-2">
                <button 
                  type="button"
                  onClick={handleDebugCheck}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  disabled={localLoading}
                >
                  Check Credentials
                </button>
                
                {credentialCheckResult && (
                  <div className={`text-xs p-2 rounded ${
                    credentialCheckResult.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p><strong>Result:</strong> {credentialCheckResult.valid ? 'Valid' : 'Invalid'}</p>
                    <p>{credentialCheckResult.message}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</p>
                  <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">{t('auth.or_continue_with')}</span>
          </div>
        </div>

        {/* Google login button */}
        <div>
          <GoogleButton 
            onClick={handleGoogleLogin} 
            loading={googleLoading}
            label={t('auth.sign_in_with_google')}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
