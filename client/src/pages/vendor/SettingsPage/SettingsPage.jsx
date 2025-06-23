import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Phone, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
    const [vendorProfile, setVendorProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const methods = useForm({
    defaultValues: {
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
    reset
  } = methods;
  
  // Fetch vendor profile
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!user?.id) return;
        try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setVendorProfile(data);
        
        // Load mobile money data from the jsonb field
        const mobileMoneyAccounts = data?.mobile_money_accounts || {};
        setValue("mtnMobileMoneyPhone", mobileMoneyAccounts.mtn?.phone || "");
        setValue("mtnAccountName", mobileMoneyAccounts.mtn?.accountName || "");
        setValue("orangeMoneyPhone", mobileMoneyAccounts.orange?.phone || "");
        setValue("orangeAccountName", mobileMoneyAccounts.orange?.accountName || "");
        
      } catch (err) {
        console.error('Error fetching vendor profile:', err);
        setError('Failed to load vendor profile');
      }
    };
    
    fetchVendorProfile();
  }, [user?.id, setValue]);
  // Handle form submission
  const onSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Build the mobile money accounts object
      const mobileMoneyAccounts = {};
      
      if (data.mtnMobileMoneyPhone || data.mtnAccountName) {
        mobileMoneyAccounts.mtn = {
          phone: data.mtnMobileMoneyPhone,
          accountName: data.mtnAccountName
        };
      }
      
      if (data.orangeMoneyPhone || data.orangeAccountName) {
        mobileMoneyAccounts.orange = {
          phone: data.orangeMoneyPhone,
          accountName: data.orangeAccountName
        };
      }
      
      // Update vendor profile
      const { error } = await supabase
        .from('vendors')
        .update({
          mobile_money_accounts: mobileMoneyAccounts,
          has_payment_setup: Object.keys(mobileMoneyAccounts).length > 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setVendorProfile(prev => ({
        ...prev,
        mobile_money_accounts: mobileMoneyAccounts
      }));
      
      setSuccessMessage(t("vendor.payment_settings_saved"));
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to update payment settings:", error);
      setError(t("vendor.failed_to_save_payment_settings"));
    } finally {
      setIsSaving(false);
    }
  };
  // Reset form
  const handleReset = () => {
    if (vendorProfile) {
      const mobileMoneyAccounts = vendorProfile.mobile_money_accounts || {};
      reset({
        mtnMobileMoneyPhone: mobileMoneyAccounts.mtn?.phone || "",
        mtnAccountName: mobileMoneyAccounts.mtn?.accountName || "",
        orangeMoneyPhone: mobileMoneyAccounts.orange?.phone || "",
        orangeAccountName: mobileMoneyAccounts.orange?.accountName || "",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("vendor.payment_settings")}</h1>
        <p className="text-gray-500">{t("vendor.payment_settings_description")}</p>
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
      
      {/* Payment Settings Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4">
              {t("vendor.mobile_money_details")}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure your mobile money details to receive payments from sales.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MTN Mobile Money phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MTN Mobile Money 
                  Numéro de téléphone
                </label>
                <Controller
                  name="mtnMobileMoneyPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="6XXXXXXXX"
                      leftIcon={Phone}
                    />
                  )}
                />
              </div>
              
              {/* MTN Account name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MTN Account Nom (Name)
                </label>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Vérifier que le nom du compte correspond à celui enregistré auprès de l'opérateur mobile.
                </label>
                <Controller
                  name="mtnAccountName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Account holder name"
                    />
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Orange Money phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orange Money 
                  Numéro de téléphone 
                </label>
                <Controller
                  name="orangeMoneyPhone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="6XXXXXXXX"
                      leftIcon={Phone}
                    />
                  )}
                />
              </div>
              
              {/* Orange Account name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orange Account Nom 
                </label>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Vérifier que le nom du compte correspond à celui enregistré auprès de l'opérateur mobile.
                </label>
                <Controller
                  name="orangeAccountName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Account holder name"
                    />
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={Save}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Payment Settings"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
