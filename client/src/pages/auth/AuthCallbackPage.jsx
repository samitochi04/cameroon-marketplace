import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // The hash fragment contains the token information
    const handleAuthCallback = async () => {
      try {
        // Get the session data
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        // If we have a session, ensure user profile is created correctly with Google data
        if (data?.session) {
          const user = data.session.user;
          
          // Create or update profile with Google information
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
              
            // If profile doesn't exist, create it with Google data
            if (!existingProfile) {
              // Extract user details from Google auth response
              const name = user.user_metadata?.name || user.user_metadata?.full_name || '';
              const email = user.email;
              
              await supabase.from('profiles').insert({
                id: user.id,
                name: name,
                email: email,
                role: 'customer', // Default role for Google sign-ins
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            } else {
              // Update the existing profile with the latest Google data
              const name = user.user_metadata?.name || user.user_metadata?.full_name || existingProfile.name || '';
              
              await supabase.from('profiles').update({
                name: name,
                email: user.email,
                updated_at: new Date().toISOString()
              }).eq('id', user.id);
              
            }
          } catch (profileError) {
            console.error('Error updating profile from Google data:', profileError);
          }
        }
        
        // Redirect to home page after successful login with a success message
        navigate('/?loginSuccess=true', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=true', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">{t('auth.completing_login')}</h2>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
