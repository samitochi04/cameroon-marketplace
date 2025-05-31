import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Save, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CustomerProfile = () => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const { 
    register, 
    handleSubmit,
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || ''
    }
  });
  
  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user, reset]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setIsSaved(false);
    
    try {
      await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber
      });
      
      setIsSaved(true);
      
      // Reset saved message after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('my_profile')}</h1>
        <p className="text-gray-600">{t('update_your_profile_information')}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{t('personal_information')}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                {t('first_name')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName', { required: t('first_name_required') })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                {t('last_name')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName', { required: t('last_name_required') })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('email')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                disabled
                {...register('email')}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('email_cannot_be_changed')}</p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
              {t('phone_number')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                {...register('phoneNumber', { 
                  pattern: {
                    value: /^[0-9+\s-]+$/,
                    message: t('invalid_phone_number')
                  }
                })}
                className={`w-full pl-10 pr-4 py-2 border rounded-md ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-end">
            {isSaved && (
              <p className="text-green-600 mr-4">{t('changes_saved_successfully')}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {t('save_changes')}
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
