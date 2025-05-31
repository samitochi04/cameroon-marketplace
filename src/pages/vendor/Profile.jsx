import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Image as ImageIcon,
  Save,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

const VendorProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { get, post } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm();

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        setIsLoading(true);
        const response = await get('/vendors/profile');
        setVendorProfile(response.data);
        
        // Set preview images if they exist
        if (response.data.logoUrl) {
          setLogoPreview(response.data.logoUrl);
        }
        
        if (response.data.bannerUrl) {
          setBannerPreview(response.data.bannerUrl);
        }
        
        // Reset the form with fetched data
        reset({
          storeName: response.data.storeName,
          description: response.data.description,
          storeAddress: response.data.storeAddress,
          storeCity: response.data.storeCity,
          storeCountry: response.data.storeCountry || 'Cameroon',
          storePhone: response.data.storePhone,
        });
      } catch (error) {
        console.error('Failed to fetch vendor profile:', error);
        setError(t('failed_to_load_profile'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorProfile();
  }, [get, reset, t]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', type);
      
      const response = await post('/upload/vendor-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      throw new Error(t('image_upload_failed'));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage('');
      
      let logoUrl = vendorProfile?.logoUrl;
      let bannerUrl = vendorProfile?.bannerUrl;
      
      // Upload logo if changed
      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'logo');
      }
      
      // Upload banner if changed
      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banner');
      }
      
      // Update vendor profile
      const profileData = {
        ...data,
        logoUrl,
        bannerUrl,
      };
      
      await post('/vendors/profile', profileData);
      
      // Show success message
      setSuccessMessage(t('profile_updated_successfully'));
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to update vendor profile:', error);
      setError(error.message || t('profile_update_failed'));
      
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('store_profile')}</h1>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          {successMessage}
        </div>
      )}
      
      {/* Profile status */}
      <div className={`mb-6 p-4 rounded-md ${
        vendorProfile?.status === 'approved' ? 'bg-green-50' : 
        vendorProfile?.status === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center">
          <Info className={`h-5 w-5 mr-2 ${
            vendorProfile?.status === 'approved' ? 'text-green-500' : 
            vendorProfile?.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
          }`} />
          <div>
            <h2 className="font-medium">
              {vendorProfile?.status === 'approved' ? t('store_approved') : 
               vendorProfile?.status === 'rejected' ? t('store_rejected') : t('store_pending_approval')}
            </h2>
            <p className="text-sm">
              {vendorProfile?.status === 'approved' ? t('store_approved_message') : 
               vendorProfile?.status === 'rejected' ? t('store_rejected_message') : t('store_pending_message')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Store Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('store_information')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('store_name')} *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="storeName"
                  type="text"
                  {...register('storeName', { required: t('store_name_required') })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${errors.storeName ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
              {errors.storeName && (
                <p className="text-red-500 text-sm mt-1">{errors.storeName.message}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('store_description')} *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { required: t('store_description_required') })}
              className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
        
        {/* Store Logo & Banner */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('store_logo_banner')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('store_logo')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="flex justify-center">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Store Logo" 
                      className="w-32 h-32 object-contain rounded-md"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-md">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    {t('upload_logo')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t('logo_requirements')}
                </p>
              </div>
            </div>
            
            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('store_banner')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="flex justify-center">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Store Banner" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    {t('upload_banner')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleBannerChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t('banner_requirements')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('contact_information')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                {t('store_address')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="storeAddress"
                  type="text"
                  {...register('storeAddress')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="storeCity" className="block text-sm font-medium text-gray-700 mb-1">
                {t('city')}
              </label>
              <input
                id="storeCity"
                type="text"
                {...register('storeCity')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone_number')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="storePhone"
                  type="tel"
                  {...register('storePhone')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="storeEmail"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('email_cannot_be_changed')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('save_changes')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;
