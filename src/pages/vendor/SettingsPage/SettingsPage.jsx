import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Globe, Camera, Save, AlertCircle, CreditCard, DollarSign, Bank } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { ImageUpload } from "@/components/vendor/ImageUpload";
import { Select } from "@/components/ui/Select";

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
  
  const { 
    control, 
    handleSubmit, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      storeName: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "",
      website: "",
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      paymentMethods: [],
      payoutThreshold: "5000",
      payoutFrequency: "monthly"
    }
  });
  
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
        <h1 className="text-2xl font-bold">{t("store_settings")}</h1>
        <p className="text-gray-500">{t("manage_store_settings")}</p>
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
      
      {/* Settings tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="store">{t("store_information")}</Tab>
          <Tab value="visuals">{t("store_visuals")}</Tab>
          <Tab value="payment">{t("payment_settings")}</Tab>
        </TabList>
        
        {/* Store Information Tab */}
        <TabPanel value="store">
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Store name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("store_name")} *
                </label>
                <Controller
                  name="storeName"
                  control={control}
                  rules={{ required: t("store_name_required") }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t("store_name_placeholder")}
                      error={errors.storeName?.message}
                    />
                  )}
                />
              </div>
              
              {/* Store description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("store_description")} *
                </label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: t("description_required") }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder={t("store_description_placeholder")}
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
                    {t("phone_number")}
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("phone_placeholder")}
                        leftIcon={Phone}
                      />
                    )}
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("email_address")} *
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ 
                      required: t("email_required"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t("invalid_email")
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("email_placeholder")}
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
                  {t("address")}
                </label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={t("address_placeholder")}
                      leftIcon={MapPin}
                    />
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("city")}
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("city_placeholder")}
                      />
                    )}
                  />
                </div>
                
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("country")}
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("country_placeholder")}
                      />
                    )}
                  />
                </div>
                
                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("website")}
                  </label>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("website_placeholder")}
                        leftIcon={Globe}
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  {t("reset")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={Save}
                  disabled={isSaving}
                >
                  {isSaving ? t("saving") : t("save_changes")}
                </Button>
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
                <h3 className="text-lg font-medium mb-2">{t("store_banner")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("store_banner_description")}
                </p>
                
                {/* Banner image upload */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {bannerImage ? (
                    <div className="relative">
                      <img
                        src={bannerImage}
                        alt={t("store_banner")}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="light"
                          leftIcon={Camera}
                          onClick={() => document.getElementById("banner-upload").click()}
                        >
                          {t("change_image")}
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
                        {t("upload_banner")}
                      </Button>
                    </div>
                  )}
                  <ImageUpload
                    id="banner-upload"
                    onUpload={handleBannerUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Store logo */}
              <div>
                <h3 className="text-lg font-medium mb-2">{t("store_logo")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("store_logo_description")}
                </p>
                
                {/* Logo image upload */}
                <div className="flex items-center">
                  <div className="w-32 h-32 bg-gray-50 border border-dashed border-gray-300 rounded-full overflow-hidden flex-shrink-0">
                    {logoImage ? (
                      <div className="relative h-full">
                        <img
                          src={logoImage}
                          alt={t("store_logo")}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="light"
                            size="sm"
                            leftIcon={Camera}
                            onClick={() => document.getElementById("logo-upload").click()}
                          >
                            {t("change")}
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
                          {t("upload")}
                        </Button>
                      </div>
                    )}
                    <ImageUpload
                      id="logo-upload"
                      onUpload={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="ml-6">
                    <h4 className="text-sm font-medium text-gray-700">
                      {t("store_logo_requirements")}
                    </h4>
                    <ul className="text-xs text-gray-500 mt-2 list-disc pl-5 space-y-1">
                      <li>{t("logo_size_requirement")}</li>
                      <li>{t("logo_format_requirement")}</li>
                      <li>{t("logo_quality_requirement")}</li>
                      <li>{t("logo_background_requirement")}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  {t("reset")}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  leftIcon={Save}
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                >
                  {isSaving ? t("saving") : t("save_changes")}
                </Button>
              </div>
            </div>
          </Card>
        </TabPanel>
        
        {/* Payment Settings Tab */}
        <TabPanel value="payment">
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{t("bank_account_information")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("bank_account_description")}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("bank_name")} *
                    </label>
                    <Controller
                      name="bankName"
                      control={control}
                      rules={{ required: t("bank_name_required") }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("bank_name_placeholder")}
                          leftIcon={Bank}
                          error={errors.bankName?.message}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("account_number")} *
                    </label>
                    <Controller
                      name="accountNumber"
                      control={control}
                      rules={{ required: t("account_number_required") }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("account_number_placeholder")}
                          error={errors.accountNumber?.message}
                        />
                      )}
                    />
                  </div>
                </div>
                
                {/* Account Holder Name */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("account_holder_name")} *
                  </label>
                  <Controller
                    name="accountHolderName"
                    control={control}
                    rules={{ required: t("account_holder_name_required") }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("account_holder_name_placeholder")}
                        error={errors.accountHolderName?.message}
                      />
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">{t("payment_methods")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("payment_methods_description")}
                </p>
                
                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("accepted_payment_methods")}
                  </label>
                  <Controller
                    name="paymentMethods"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { id: "credit_card", label: t("credit_card"), icon: CreditCard },
                          { id: "mobile_money", label: t("mobile_money"), icon: Phone },
                          { id: "bank_transfer", label: t("bank_transfer"), icon: Bank }
                        ].map((method) => {
                          const isSelected = field.value?.includes(method.id);
                          return (
                            <div 
                              key={method.id}
                              className={`
                                border rounded-md p-3 cursor-pointer flex items-center transition
                                ${isSelected ? 'bg-primary bg-opacity-10 border-primary text-primary' : 'border-gray-300 hover:border-gray-400'}
                              `}
                              onClick={() => {
                                const currentMethods = [...(field.value || [])];
                                if (isSelected) {
                                  field.onChange(currentMethods.filter(m => m !== method.id));
                                } else {
                                  field.onChange([...currentMethods, method.id]);
                                }
                              }}
                            >
                              <method.icon className="w-5 h-5 mr-2" />
                              <span>{method.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">{t("payout_preferences")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("payout_preferences_description")}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payout Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("payout_threshold")}
                    </label>
                    <Controller
                      name="payoutThreshold"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1000"
                          step="1000"
                          placeholder="5000"
                          leftIcon={DollarSign}
                          rightAddon="XAF"
                        />
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t("payout_threshold_description")}
                    </p>
                  </div>
                  
                  {/* Payout Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("payout_frequency")}
                    </label>
                    <Controller
                      name="payoutFrequency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={[
                            { value: "weekly", label: t("weekly") },
                            { value: "biweekly", label: t("biweekly") },
                            { value: "monthly", label: t("monthly") },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
              
              {/* Commission Information */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-2">{t("commission_information")}</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-primary mr-2" />
                    <span className="text-sm">
                      {t("current_commission_rate", { rate: vendorProfile?.commissionRate || "10" })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {t("commission_explanation")}
                  </p>
                </div>
              </div>
              
              {/* Form actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  {t("reset")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={Save}
                  disabled={isSaving}
                >
                  {isSaving ? t("saving") : t("save_changes")}
                </Button>
              </div>
            </form>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};
