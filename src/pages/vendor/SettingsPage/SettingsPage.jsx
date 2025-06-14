import React, { useState, useEffect } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Globe, Camera, Save, AlertCircle } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { ImageUploader } from "@/components/vendor/ImageUploader";
import { PaymentSettingsTab } from "@/components/vendor/PaymentSettingsTab";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    vendorProfile, 
    loading: vendorLoading, 
    updateProfile, 
    updateLoading 
  } = useVendor();
  
  const [activeTab, setActiveTab] = useState("store");
  const [bannerImage, setBannerImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const methods = useForm({
    defaultValues: {
      storeName: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "",
      website: "",
      // Payment methods
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      paymentMethods: [],
      payoutThreshold: "5000",
      payoutFrequency: "monthly",
      // Mobile money fields
      mtnMobileMoneyPhone: "",
      mtnAccountName: "",
      orangeMoneyPhone: "",
      orangeAccountName: ""
    }
  });
  
  const { 
    control, 
    handleSubmit, 
    setValue, 
    reset,
    formState: { errors } 
  } = methods;
  
  // Load vendor profile data
  useEffect(() => {
    if (vendorProfile) {
      setValue("storeName", vendorProfile.storeName || "");
      setValue("description", vendorProfile.description || "");
      setValue("phone", vendorProfile.phone || "");
      setValue("email", vendorProfile.email || user?.email || "");
      setValue("address", vendorProfile.address || "");
      setValue("city", vendorProfile.city || "");
      setValue("country", vendorProfile.country || "");
      setValue("website", vendorProfile.website || "");
      
      // Payment settings
      setValue("bankName", vendorProfile.bankName || "");
      setValue("accountNumber", vendorProfile.accountNumber || "");
      setValue("accountHolderName", vendorProfile.accountHolderName || "");
      setValue("paymentMethods", vendorProfile.paymentMethods || []);
      setValue("payoutThreshold", vendorProfile.payoutThreshold || "5000");
      setValue("payoutFrequency", vendorProfile.payoutFrequency || "monthly");
      
      // Mobile money settings
      setValue("mtnMobileMoneyPhone", vendorProfile.mtnMobileMoneyPhone || "");
      setValue("mtnAccountName", vendorProfile.mtnAccountName || "");
      setValue("orangeMoneyPhone", vendorProfile.orangeMoneyPhone || "");
      setValue("orangeAccountName", vendorProfile.orangeAccountName || "");
      
      if (vendorProfile.logoUrl) {
        setLogoImage(vendorProfile.logoUrl);
      }
      
      if (vendorProfile.bannerUrl) {
        setBannerImage(vendorProfile.bannerUrl);
      }
    }
  }, [vendorProfile, setValue, user]);
  
  // Handle banner image upload
  const handleBannerUpload = (imageUrl) => {
    setBannerImage(imageUrl);
  };
  
  // Handle logo image upload
  const handleLogoUpload = (imageUrl) => {
    setLogoImage(imageUrl);
  };
  
  // Handle form submission
  const onSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updatedProfile = {
        ...data,
        logoUrl: logoImage,
        bannerUrl: bannerImage,
      };
      
      await updateProfile(updatedProfile);
      setSuccessMessage(t("store_settings_saved"));
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(t("failed_to_save_settings"));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    if (vendorProfile) {
      reset({
        storeName: vendorProfile.storeName || "",
        description: vendorProfile.description || "",
        phone: vendorProfile.phone || "",
        email: vendorProfile.email || user?.email || "",
        address: vendorProfile.address || "",
        city: vendorProfile.city || "",
        country: vendorProfile.country || "",
        website: vendorProfile.website || "",
        bankName: vendorProfile.bankName || "",
        accountNumber: vendorProfile.accountNumber || "",
        accountHolderName: vendorProfile.accountHolderName || "",
        paymentMethods: vendorProfile.paymentMethods || [],
        payoutThreshold: vendorProfile.payoutThreshold || "5000",
        payoutFrequency: vendorProfile.payoutFrequency || "monthly",
        mtnMobileMoneyPhone: vendorProfile.mtnMobileMoneyPhone || "",
        mtnAccountName: vendorProfile.mtnAccountName || "",
        orangeMoneyPhone: vendorProfile.orangeMoneyPhone || "",
        orangeAccountName: vendorProfile.orangeAccountName || "",
      });
      
      if (vendorProfile.logoUrl) {
        setLogoImage(vendorProfile.logoUrl);
      } else {
        setLogoImage(null);
      }
      
      if (vendorProfile.bannerUrl) {
        setBannerImage(vendorProfile.bannerUrl);
      } else {
        setBannerImage(null);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("vendor.store_settings")}</h1>
        <p className="text-gray-500">{t("vendor.manage_store_settings")}</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      
      <FormProvider {...methods}>
        {/* Settings tabs */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab value="store">{t("vendor.store_information")}</Tab>
            <Tab value="visuals">{t("vendor.store_visuals")}</Tab>
            <Tab value="payment">{t("vendor.payment_settings")}</Tab>
          </TabList>
          
          {/* Store Information Tab */}
          <TabPanel value="store">
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Store name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("vendor.store_name")} *
                  </label>
                  <Controller
                    name="storeName"
                    control={control}
                    rules={{ required: t("vendor.store_name_required") }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("vendor.store_name_placeholder")}
                        error={errors.storeName?.message}
                      />
                    )}
                  />
                </div>
                
                {/* Store description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("vendor.store_description")} *
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: t("vendor.description_required") }}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder={t("vendor.store_description_placeholder")}
                        rows={4}
                        error={errors.description?.message}
                      />
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.phone_number")}
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.phone_placeholder")}
                          leftIcon={Phone}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.email_address")} *
                    </label>
                    <Controller
                      name="email"
                      control={control}
                      rules={{ 
                        required: t("vendor.email_required"),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("vendor.invalid_email")
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.email_placeholder")}
                          leftIcon={Mail}
                          error={errors.email?.message}
                        />
                      )}
                    />
                  </div>
                </div>
                
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("vendor.address")}
                  </label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("vendor.address_placeholder")}
                        leftIcon={MapPin}
                      />
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.city")}
                    </label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.city_placeholder")}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.country")}
                    </label>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.country_placeholder")}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("vendor.website")}
                    </label>
                    <Controller
                      name="website"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("vendor.website_placeholder")}
                          leftIcon={Globe}
                        />
                      )}
                    />
                  </div>
                </div>
                
                {/* Payment settings */}
                <div className="mt-8">
                  <h2 className="text-lg font-bold mb-4">
                    {t("vendor.payment_settings")}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bank name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("vendor.bank_name")}
                      </label>
                      <Controller
                        name="bankName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t("vendor.bank_name_placeholder")}
                          />
                        )}
                      />
                    </div>
                    
                    {/* Account number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("vendor.account_number")}
                      </label>
                      <Controller
                        name="accountNumber"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t("vendor.account_number_placeholder")}
                          />
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account holder name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("vendor.account_holder_name")}
                      </label>
                      <Controller
                        name="accountHolderName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={t("vendor.account_holder_name_placeholder")}
                          />
                        )}
                      />
                    </div>
                    
                    {/* Payment methods */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("vendor.payment_methods")}
                      </label>
                      <Controller
                        name="paymentMethods"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="mobileMoney"
                                checked={field.value.includes("mobileMoney")}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newPaymentMethods = checked
                                    ? [...field.value, "mobileMoney"]
                                    : field.value.filter((method) => method !== "mobileMoney");
                                  field.onChange(newPaymentMethods);
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label
                                htmlFor="mobileMoney"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {t("vendor.mobile_money")}
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="bankTransfer"
                                checked={field.value.includes("bankTransfer")}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newPaymentMethods = checked
                                    ? [...field.value, "bankTransfer"]
                                    : field.value.filter((method) => method !== "bankTransfer");
                                  field.onChange(newPaymentMethods);
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label
                                htmlFor="bankTransfer"
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {t("vendor.bank_transfer")}
                              </label>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Mobile money fields */}
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {t("vendor.mobile_money_details")}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* MTN Mobile Money phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("vendor.mtn_mobile_money_phone")}
                        </label>
                        <Controller
                          name="mtnMobileMoneyPhone"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder={t("vendor.mtn_mobile_money_phone_placeholder")}
                              leftIcon={Phone}
                            />
                          )}
                        />
                      </div>
                      
                      {/* MTN Account name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("vendor.mtn_account_name")}
                        </label>
                        <Controller
                          name="mtnAccountName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder={t("vendor.mtn_account_name_placeholder")}
                            />
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Orange Money phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("vendor.orange_money_phone")}
                        </label>
                        <Controller
                          name="orangeMoneyPhone"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder={t("vendor.orange_money_phone_placeholder")}
                              leftIcon={Phone}
                            />
                          )}
                        />
                      </div>
                      
                      {/* Orange Account name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("vendor.orange_account_name")}
                        </label>
                        <Controller
                          name="orangeAccountName"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder={t("vendor.orange_account_name_placeholder")}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Card>
          </TabPanel>
          
          {/* Store Visuals Tab */}
          <TabPanel value="visuals">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Store banner */}
                <div>
                  <h3 className="text-lg font-medium mb-2">{t("vendor.store_banner")}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("vendor.store_banner_description")}
                  </p>
                  
                  {/* Banner image upload */}
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg overflow-hidden">
                    {bannerImage ? (
                      <div className="relative">
                        <img
                          src={bannerImage}
                          alt={t("vendor.store_banner")}
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="light"
                            leftIcon={Camera}
                            onClick={() => document.getElementById("banner-upload").click()}
                          >
                            {t("vendor.change_image")}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400 mb-4" />
                        <Button
                          variant="secondary"
                          onClick={() => document.getElementById("banner-upload").click()}
                        >
                          {t("vendor.upload_banner")}
                        </Button>
                      </div>
                    )}
                    <ImageUploader
                      id="banner-upload"
                      onUpload={handleBannerUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Store logo */}
                <div>
                  <h3 className="text-lg font-medium mb-2">{t("vendor.store_logo")}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("vendor.store_logo_description")}
                  </p>
                  
                  {/* Logo image upload */}
                  <div className="flex items-center">
                    <div className="w-32 h-32 bg-gray-50 border border-dashed border-gray-300 rounded-full overflow-hidden flex-shrink-0">
                      {logoImage ? (
                        <div className="relative h-full">
                          <img
                            src={logoImage}
                            alt={t("vendor.store_logo")}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="light"
                              size="sm"
                              leftIcon={Camera}
                              onClick={() => document.getElementById("logo-upload").click()}
                            >
                              {t("vendor.change")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => document.getElementById("logo-upload").click()}
                          >
                            {t("vendor.upload")}
                          </Button>
                        </div>
                      )}
                      <ImageUploader
                        id="logo-upload"
                        onUpload={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="ml-6">
                      <h4 className="text-sm font-medium text-gray-700">
                        {t("vendor.store_logo_requirements")}
                      </h4>
                      <ul className="text-xs text-gray-500 mt-2 list-disc pl-5 space-y-1">
                        <li>{t("vendor.logo_size_requirement")}</li>
                        <li>{t("vendor.logo_format_requirement")}</li>
                        <li>{t("vendor.logo_quality_requirement")}</li>
                        <li>{t("vendor.logo_background_requirement")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabPanel>
          
          {/* Payment Settings Tab */}
          <TabPanel value="payment">
            <PaymentSettingsTab />
          </TabPanel>
        </Tabs>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            {t("vendor.reset")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={Save}
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? t("vendor.saving") : t("vendor.save_changes")}
          </Button>
        </div>
      </FormProvider>
    </div>
  );
};
