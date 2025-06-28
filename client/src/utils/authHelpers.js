import { supabase } from '@/lib/supabase';

/**
 * Check email confirmation status and resend verification if needed
 * @param {string} email The email address to check
 * @returns {Promise<{isConfirmed: boolean, message: string}>}
 */
export const checkEmailConfirmation = async (email) => {
  try {
    // Resend confirmation email (simplified approach)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });
    
    if (error) {
      return { 
        isConfirmed: false, 
        message: `Error sending verification email: ${error.message}`
      };
    }
    
    return {
      isConfirmed: false,
      message: 'A new verification email has been sent to your inbox.'
    };
  } catch (error) {
    console.error('Error checking email confirmation:', error);
    return {
      isConfirmed: false,
      message: 'Error checking email status. Please try again later.'
    };
  }
};

/**
 * Check for missing user profile and attempt to fix it
 * @param {string} userId The user's ID
 * @param {Object} userData Basic user data to use if creating a profile
 * @returns {Promise<{success: boolean, message: string}>} Result of the operation
 */
export const ensureUserProfile = async (userId, userData = {}) => {
  try {
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error checking for profile:', profileError);
      return { success: false, message: `Error checking profile: ${profileError.message}` };
    }
    
    // If profile exists, no need to create one
    if (profile) {
      return { success: true, message: 'Profile already exists' };
    }
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        email: userData.email,
        name: userData.name || '',
        role: userData.role || 'customer'
      }]);
      
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return { success: false, message: `Failed to create profile: ${insertError.message}` };
    }
    
    return { success: true, message: 'Profile created successfully' };
  } catch (error) {
    console.error('Error fixing user profile:', error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
};

/**
 * Debug function to check if credentials are valid
 * @param {string} email Email to check
 * @param {string} password Password to check
 * @returns {Promise<Object>} Result of the check
 */
export const debugCheckCredentials = async (email, password) => {
  try {
    // Try to sign in without actually setting the session
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return {
        valid: false,
        message: error.message
      };
    }
    
    return {
      valid: true,
      message: 'Credentials are valid'
    };
  } catch (error) {
    return {
      valid: false,
      message: `Error checking credentials: ${error.message}`
    };
  }
};

/**
 * Function to bypass email verification (for development only!)
 * @param {string} email User's email to confirm
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const devConfirmEmail = async (email) => {
  try {
    // IMPORTANT: This is for DEVELOPMENT ONLY as it requires admin access
    // In production, users should click the email link
    
    // This requires you to have admin privileges in Supabase
    // First get all users to find the one we need to confirm
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      return { success: false, message: `Error fetching users: ${usersError.message}` };
    }
    
    // Find our user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (user.email_confirmed_at) {
      return { success: true, message: 'Email already confirmed' };
    }
    
    // Confirm the user's email
    const { error } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    );
    
    if (error) {
      return { success: false, message: `Error confirming email: ${error.message}` };
    }
    
    return { success: true, message: 'Email confirmed successfully' };
  } catch (error) {
    console.error('Error in devConfirmEmail:', error);
    return { 
      success: false, 
      message: `Error confirming email: ${error.message}` 
    };
  }
};
