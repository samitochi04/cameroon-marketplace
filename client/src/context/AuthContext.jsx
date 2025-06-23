import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ensureUserProfile } from '@/utils/authHelpers';

// We create a context for authentication state
// This will allow us to provide auth state and functions throughout the app
const AuthContext = createContext();

// children means the components that are wrapped inside this provider. E.g Navbar, HompePage, etc. we used { children } to destructure the props
export function AuthProvider({ children }) {
  // user = null and when user login, setUser updates it with the user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const authStateChangeCount = useRef(0); // Track auth state changes to prevent loops
  const processingAuth = useRef(false); // Prevent concurrent auth operations. E.g when a user clicks “Login” 3 times quickly.
  
  // Centralized function to handle session data
  const handleSession = useCallback(async (session) => {
    // If already processing a session update, don't start another one
    if (processingAuth.current) return;
    
    processingAuth.current = true;
    
    try {
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Get user profile data if session exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle(); 
        
        if (profileError) {
          console.error('Error getting user profile:', profileError.message);
          
          // If the profiles table doesn't exist or has other issues, create basic user object
          setUser({
            ...session.user,
            role: session.user.user_metadata?.role || 'customer', // Default role
            name: session.user.user_metadata?.name || '',
            email: session.user.email,
            id: session.user.id
          });
          return;
        }
        
        // If profile exists, combine with auth data
        if (profile) {
          // Make sure to preserve the role from user_metadata if it exists
          const userRole = session.user.user_metadata?.role || profile.role || 'customer';
          
          console.log("User profile loaded:", profile);
          console.log("User metadata:", session.user.user_metadata);
          console.log("Determined role:", userRole);
          
          setUser({
            ...session.user,
            ...profile,
            role: userRole // Ensure role is set correctly
          });
        } else {
          // If no profile yet, create one and use basic user data for now
          console.log('No profile found for user, attempting to create one...');
          
          // Create profile directly instead of trying to use admin privileges
          try {
            // Direct attempt to create profile - will work if RLS policies allow it
            const newProfile = {
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role || 'customer',
              name: session.user.user_metadata?.name || ''
            };
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([newProfile]);
              
            if (insertError) {
              console.error('Error creating user profile:', insertError.message);
              console.log('Profile creation failed due to permissions. Using basic user data.');
            } else {
              console.log('Profile created successfully');
            }
          } catch (error) {
            console.error("Failed to create profile:", error);
          }
          
          // Always use the basic user info even if profile creation fails
          setUser({
            ...session.user,
            role: session.user.user_metadata?.role || 'customer',
            name: session.user.user_metadata?.name || '',
            email: session.user.email,
            id: session.user.id
          });
        }
      } catch (error) {
        console.error('Error handling session:', error);
        
        // Create a minimal user object with auth data to prevent login loops
        setUser({
          ...session.user,
          role: 'customer',  // Safe default
          id: session.user.id,
          email: session.user.email
        });
      }
    } finally {
      setLoading(false);
      processingAuth.current = false;
    }
  }, []);

  // Enhance isAuthenticated property as a computed value
  const isAuthenticated = !!user;
  
  // Update the session checking process
  useEffect(() => {
    let mounted = true;
    let subscription;
    
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Get the current session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Log session status for debugging
        console.log("Session check:", data?.session ? "Session found" : "No session found");
        
        if (data?.session && mounted) {
          console.log("User authenticated, fetching profile...");
          await handleSession(data.session);
        } else {
          setUser(null);
          setLoading(false);
        }
        
        // Set up auth state listener
        if (mounted) {
          const { data: { subscription: authSubscription } } = await supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (!mounted) return;
              
              console.log("Auth state changed:", event, session ? "Session exists" : "No session");
              
              if (session) {
                await handleSession(session);
              } else {
                setUser(null);
                setLoading(false);
              }
            }
          );
          
          subscription = authSubscription;
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          setUser(null);
          setAuthError(error.message);
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [handleSession]);

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log("Attempting login for:", email);
      
      // Basic validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Try login with detailed error handling
      console.log("Calling signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Detailed error reporting
        console.error("Login error details:", error);
        
        // Special handling for unconfirmed email
        if (error.message?.includes('Email not confirmed')) {
          console.log("Email not confirmed. Sending verification email.");
          // Send another confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email
          });
          
          if (resendError) {
            console.error("Error resending verification:", resendError);
          } else {
            console.log("Verification email sent successfully");
          }
          
          throw new Error('Email not confirmed. A new confirmation email has been sent.');
        }
        
        throw error;
      }
      
      console.log("Login successful:", data);
      
      // Don't create profiles during login - that should be done at registration
      return data;
      
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      setLoading(false);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) throw error;
      
      // This will redirect the user to Google, so no need to return anything
      return data;
    } catch (error) {
      console.error('Google login error:', error.message);
      setAuthError(error.message);
      setLoading(false);
      throw error;
    }
  };

  // Register new user
  const register = async (email, password, userData = {}) => {
    try {
      console.log("Starting registration process with:", { email, userData });
      
      // Step 1: Create auth user with autoSignIn: false to prevent automatic login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'customer'
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // This is the key change - prevents automatic sign in after registration
          emailConfirmTo: `${window.location.origin}/login`,
          // Important: don't automatically sign in the user
          autoConfirm: false
        }
      });
      
      if (authError) throw authError;
      
      console.log("Auth signup successful:", authData);
      
      // Force logout to ensure the session is cleared after registration
      if (authData?.session) {
        console.log("Clearing session after registration");
        await supabase.auth.signOut();
      }
      
      // Always treat registration as requiring email confirmation
      return { 
        ...authData, 
        requiresEmailConfirmation: true 
      };
    } catch (error) {
      // Log in excruciating detail
      console.error('Registration error:', error);
      console.error('Error details:', error.message);
      if (error.cause) console.error('Error cause:', error.cause);
      if (error.stack) console.error('Stack trace:', error.stack);
      
      // Try to get more network information if available
      if (error.status) console.error('Status code:', error.status);
      
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Don't set user to null here, let the onAuthStateChange handle it
    } catch (error) {
      console.error('Logout error:', error.message);
      setLoading(false);
      throw error;
    }
  };

  // Add user profile update function
  const updateUserProfile = async (userData) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }
      
      console.log('Updating profile for user:', user.id, 'with data:', userData);
      
      // Update the profile record in Supabase - include address field
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name, // Single name field that exists in the database
          phonenumber: userData.phonenumber,
          address: userData.address, // Add address to the update
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Profile updated successfully:', data);
      
      // Update the local user state with new data
      setUser(prev => ({
        ...prev,
        ...data
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add resetPassword function
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add confirmPasswordReset function
  const confirmPasswordReset = async (accessToken, newPassword) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Provide auth state and functions to the rest of the app
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authError, 
      isAuthenticated,
      login, 
      logout, 
      register, 
      loginWithGoogle,
      updateUserProfile, // Add the new function here
      resetPassword,
      confirmPasswordReset,
      clearAuthError: () => setAuthError(null)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
