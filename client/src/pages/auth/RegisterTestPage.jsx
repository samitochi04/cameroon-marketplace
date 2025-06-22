import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { devConfirmEmail } from '@/utils/authHelpers';

const RegisterTestPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerResult, setRegisterResult] = useState(null);
  const [loginResult, setLoginResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('register'); // 'register', 'login', or 'verify'

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      // Store user ID for later verification
      localStorage.setItem('lastRegisteredEmail', email);

      setRegisterResult({
        success: !error,
        message: error ? error.message : 'Registration successful! Please check your email for verification.',
        data: data,
        emailConfirmed: data?.user?.email_confirmed_at ? true : false
      });
      
      if (!error) {
        // Set action to verify after successful registration
        setSelectedAction('verify');
      }
    } catch (error) {
      setRegisterResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      setLoginResult({
        success: !error,
        message: error ? error.message : 'Login successful',
        data: data
      });
      
      // Check email confirmation status
      if (error && error.message.includes('email')) {
        setSelectedAction('verify');
      }
    } catch (error) {
      setLoginResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First try to resend verification email
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      
      if (resendError) {
        throw resendError;
      }
      
      setVerificationResult({
        success: true, 
        message: 'Verification email resent. Please check your inbox and spam folder.'
      });
    } catch (error) {
      setVerificationResult({
        success: false,
        message: `Error resending verification: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDevConfirm = async () => {
    setLoading(true);
    
    try {
      const result = await devConfirmEmail(email);
      
      setVerificationResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        // Switch to login tab after successful verification
        setSelectedAction('login');
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: `Error in dev confirmation: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Load the last registered email if available
  const handleEmailCheck = () => {
    const lastEmail = localStorage.getItem('lastRegisteredEmail');
    if (lastEmail && email === '') {
      setEmail(lastEmail);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Testing Tool</h1>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-6">
        <button 
          className={`py-2 px-4 ${selectedAction === 'register' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setSelectedAction('register')}
        >
          Register
        </button>
        <button 
          className={`py-2 px-4 ${selectedAction === 'verify' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setSelectedAction('verify')}
        >
          Verify Email
        </button>
        <button 
          className={`py-2 px-4 ${selectedAction === 'login' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setSelectedAction('login')}
        >
          Login
        </button>
      </div>
      
      {/* Register form */}
      {selectedAction === 'register' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Register New User</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          {registerResult && (
            <div className={`mt-4 p-4 rounded-md ${registerResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-medium ${registerResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {registerResult.success ? 'Registration Successful' : 'Registration Failed'}
              </h3>
              <p className="mt-1">{registerResult.message}</p>
              {registerResult.success && (
                <>
                  <p className="mt-2 text-sm">
                    <strong>Email Confirmed:</strong> {registerResult.emailConfirmed ? 'Yes' : 'No'}
                  </p>
                  <p className="mt-2 text-sm">
                    <strong>User ID:</strong> {registerResult.data?.user?.id || 'Unknown'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Verify email form */}
      {selectedAction === 'verify' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Verify Email</h2>
          
          <div className="mb-6 p-4 bg-yellow-50 rounded-md">
            <p className="text-yellow-800">
              <strong>Note:</strong> Normally, users would click a link in their email to verify their account.
              This section provides alternative verification methods for testing.
            </p>
          </div>
          
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email to verify</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleEmailCheck}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button 
                type="submit" 
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button 
                type="button" 
                onClick={handleDevConfirm}
                className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'DEV: Force Verify Email'}
              </button>
            </div>
          </form>
          
          {verificationResult && (
            <div className={`mt-4 p-4 rounded-md ${verificationResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-medium ${verificationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {verificationResult.success ? 'Verification Successful' : 'Verification Failed'}
              </h3>
              <p className="mt-1">{verificationResult.message}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Login form */}
      {selectedAction === 'login' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleEmailCheck}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          {loginResult && (
            <div className={`mt-4 p-4 rounded-md ${loginResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`font-medium ${loginResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {loginResult.success ? 'Login Successful' : 'Login Failed'}
              </h3>
              <p className="mt-1">{loginResult.message}</p>
              {loginResult.success && loginResult.data && (
                <div className="mt-2">
                  <p className="font-medium">User info:</p>
                  <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(loginResult.data.user, null, 2)}
                  </pre>
                </div>
              )}
              
              {loginResult.message && loginResult.message.includes('email') && (
                <button
                  onClick={() => setSelectedAction('verify')}
                  className="mt-3 text-blue-500 hover:underline"
                >
                  Go to email verification
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Environment information */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Environment Information</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
          <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
          <p><strong>Auth Redirect URL:</strong> {window.location.origin}/auth/callback</p>
          <p><strong>Browser:</strong> {navigator.userAgent}</p>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
          <h3 className="font-medium text-yellow-800">Common Issues:</h3>
          <ul className="mt-2 list-disc list-inside text-sm text-yellow-800">
            <li>Email verification is required before login</li>
            <li>Password must be at least 6 characters</li>
            <li>Confirmation emails may go to spam folder</li>
            <li>Supabase RLS policies may prevent database access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterTestPage;
