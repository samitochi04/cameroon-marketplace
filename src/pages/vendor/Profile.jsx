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
import { supabase } from '@/lib/supabase';

const VendorProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
        
        // Direct Supabase query to fetch vendor data
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user?.id)
          .single();
        
        if (error) {
          console.error('Error fetching vendor profile:', error);
          throw error;
        }
        
        setVendorProfile(data);
        
        // Set preview images if they exist
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
        
        if (data.banner_url) {
          setBannerPreview(data.banner_url);
        }
        
        // Reset the form with fetched data
        reset({
          storeName: data.store_name,
          description: data.description,
          storeAddress: data.store_address,
          storeCity: data.store_city,
          storeCountry: data.store_country || 'Cameroon',
          storePhone: data.store_phone,
        });
      } catch (error) {
        console.error('Failed to fetch vendor profile:', error);
        setError(t('vendor.failed_to_load_profile'));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchVendorProfile();
    }
  }, [user?.id, reset, t]);

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('vendor-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`Failed to upload ${type}:`, uploadError);
        throw new Error(t('vendor.image_upload_failed'));
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vendor-assets')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      throw new Error(t('vendor.image_upload_failed'));
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage('');
      
      let logo_url = vendorProfile?.logo_url;
      let banner_url = vendorProfile?.banner_url;
      
      // Upload logo if changed
      if (logoFile) {
        logo_url = await uploadImage(logoFile, 'logo');
      }
      
      // Upload banner if changed
      if (bannerFile) {
        banner_url = await uploadImage(bannerFile, 'banner');
      }
      
      // Update vendor profile directly with Supabase
      const { data: updatedProfile, error: updateError } = await supabase
        .from('vendors')
        .update({
          store_name: data.storeName,
          description: data.description,
          store_address: data.storeAddress,
          store_city: data.storeCity,
          store_country: data.storeCountry || 'Cameroon',
          store_phone: data.storePhone,
          logo_url: logo_url,
          banner_url: banner_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      setVendorProfile({
        ...updatedProfile[0],
      });
      
      // Show success message
      setSuccessMessage(t('vendor.profile_updated_successfully'));
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to update vendor profile:', error);
      setError(error.message || t('vendor.profile_update_failed'));
      
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
      <h1 className="text-2xl font-bold mb-6">{t('vendor.store_profile')}</h1>
      
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
              {vendorProfile?.status === 'approved' ? t('vendor.store_approved') : 
               vendorProfile?.status === 'rejected' ? t('vendor.store_rejected') : t('vendor.store_pending_approval')}
            </h2>
            <p className="text-sm">
              {vendorProfile?.status === 'approved' ? t('vendor.store_approved_message') : 
               vendorProfile?.status === 'rejected' ? t('vendor.store_rejected_message') : t('vendor.store_pending_message')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Store Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('vendor.store_information')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('vendor.store_name')} *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="storeName"
                  type="text"
                  {...register('storeName', { required: t('vendor.store_name_required') })}
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
              {t('vendor.store_description')} *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { required: t('vendor.store_description_required') })}
              className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
        
        {/* Store Logo & Banner */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('vendor.store_logo_banner')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vendor.store_logo')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="flex justify-center">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Store Logo" 
                      className="w-32 h-32 object-contain rounded-md"
                      onError={(e) => {
                        e.target.src = "/placeholder-logo.png";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded-md">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    {t('vendor.upload_logo')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t('vendor.logo_requirements')}
                </p>
              </div>
            </div>
            
            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('vendor.store_banner')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div className="flex justify-center">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Store Banner" 
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = "/placeholder-banner.png";
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md">
                      <ImageIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                    {t('vendor.upload_banner')}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleBannerChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t('vendor.banner_requirements')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('vendor.contact_information')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                {t('vendor.store_address')}
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
                {t('vendor.city')}
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
                {t('profile.phone_number')}
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
                {t('profile.email')}
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
                {t('profile.email_cannot_be_changed')}
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
                {t('profile.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('profile.save_changes')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;
