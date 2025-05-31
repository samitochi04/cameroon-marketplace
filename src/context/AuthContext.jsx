import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on initial load
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          setLoading(false);
          return;
        }
        
        if (session) {
          // Get user profile data
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting user profile:', profileError.message);
          }
          
          // Combine auth data with profile data
          setUser({
            ...session.user,
            ...profile
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // Combine auth data with profile data
        setUser({
          ...session.user,
          ...profile
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  // Register new user
  const register = async (email, password, userData = {}) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'customer'
          }
        }
      });
      
      if (authError) throw authError;
      
      // If registration successful, create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: userData.name,
              role: userData.role || 'customer',
              email: email
            }
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError.message);
        }
      }
      
      return authData;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error.message);
      throw error;
    }
  };

  // Update user password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update password error:', error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Update auth metadata if applicable
      if (profileData.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: profileData.name }
        });
        
        if (authError) throw authError;
      }
      
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Update local user state
      setUser({ ...user, ...profileData });
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
