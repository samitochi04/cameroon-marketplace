import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Loader, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CustomerProfile = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit,
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phonenumber: user?.phonenumber || '',
      address: user?.address || ''
    }
  });
  
  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phonenumber: user.phonenumber || '',
        address: user.address || ''
      });
    }
  }, [user, reset]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setIsSaved(false);
    setError('');
    
    try {
      console.log('Submitting profile update:', data);
      await updateUserProfile({
        name: data.name,
        phonenumber: data.phonenumber,
        address: data.address
      });
      
      setIsSaved(true);
      
      // Reset saved message after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('profile.my_profile')}</h1>
        <p className="text-gray-600">{t('profile.update_your_profile_information')}</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('profile.personal_information')}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t('profile.name')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                {...register('name', { required: t('profile.name_required') })}
                className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          {/* Email field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('profile.email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                disabled
                {...register('email')}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('profile.email_cannot_be_changed')}</p>
          </div>
          
          {/* Phone Number field */}
          <div className="mb-6">
            <label htmlFor="phonenumber" className="block text-sm font-medium mb-1">
              {t('profile.phone_number')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                id="phonenumber"
                type="tel"
                {...register('phonenumber', {
                  pattern: {
                    value: /^[0-9+\s-]+$/,
                    message: t('profile.invalid_phone_number')
                  }
                })}
                className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.phonenumber ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.phonenumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phonenumber.message}</p>
            )}
          </div>
          
          {/* Address field - New addition */}
          <div className="mb-6">
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              {t('profile.address')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin size={18} className="text-gray-400" />
              </div>
              <textarea
                id="address"
                {...register('address')}
                rows="3"
                className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={t('profile.address_placeholder')}
              ></textarea>
            </div>
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-end">
            {isSaved && (
              <p className="text-green-600 mr-4">{t('profile.changes_saved_successfully')}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  {t('profile.saving')}
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {t('profile.save_changes')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
