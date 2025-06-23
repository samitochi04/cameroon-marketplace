import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle, CreditCard, Phone } from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "mtn_money",
    name: "MTN Mobile Money",
    icon: <Phone className="h-5 w-5 text-yellow-500" />,
    fields: [
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "account_name", label: "Account Name", type: "text", required: true },
    ],
  },
  {
    id: "orange_money",
    name: "Orange Money",
    icon: <Phone className="h-5 w-5 text-orange-500" />,
    fields: [
      { name: "phone", label: "Phone Number", type: "tel", required: true },
      { name: "account_name", label: "Account Name", type: "text", required: true },
    ],
  },
  {
    id: "bank_card",
    name: "Bank Card (Visa/Mastercard)",
    icon: <CreditCard className="h-5 w-5 text-blue-500" />,
    fields: [
      { name: "card_holder", label: "Card Holder Name", type: "text", required: true },
      { name: "card_number", label: "Card Number", type: "text", required: true },
      { name: "expiry", label: "Expiry Date (MM/YY)", type: "text", required: true },
      { name: "bank_name", label: "Bank Name", type: "text", required: true },
    ],
  },
];

const PaymentSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("mtn_money");
  const [vendorData, setVendorData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  
  // Fetch vendor's current payment settings
  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('payout_method, payout_details, has_payment_setup')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setVendorData(data);
        
        // Set form defaults based on existing data
        if (data?.payout_method) {
          setSelectedMethod(data.payout_method);
          
          // Set form values from saved details
          if (data.payout_details) {
            Object.entries(data.payout_details).forEach(([key, value]) => {
              setValue(key, value);
            });
          }
        }
      } catch (err) {
        console.error('Error fetching vendor payment data:', err);
        setError(t('vendor.failed_to_load_payment_settings'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
  }, [user, setValue, t]);
  
  // Handle payment method selection
  const handleMethodChange = (method) => {
    setSelectedMethod(method);
  };
  
  // Save payment settings
  const onSubmit = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Get only relevant fields for this payment method
      const currentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
      const relevantFields = currentMethod.fields.map(f => f.name);
      
      // Filter form data to only include relevant fields
      const payoutDetails = Object.fromEntries(
        Object.entries(formData).filter(([key]) => relevantFields.includes(key))
      );
      
      // Update vendor record
      const { error } = await supabase
        .from('vendors')
        .update({
          payout_method: selectedMethod,
          payout_details: payoutDetails,
          has_payment_setup: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setSuccess(t('vendor.payment_settings_saved'));
      
      // Update local state
      setVendorData(prev => ({
        ...prev,
        payout_method: selectedMethod,
        payout_details: payoutDetails,
        has_payment_setup: true
      }));
      
    } catch (err) {
      console.error('Error saving payment settings:', err);
      setError(t('vendor.failed_to_save_payment_settings'));
    } finally {
      setSaving(false);
      
      // Clear success message after a delay
      if (!error) {
        setTimeout(() => setSuccess(null), 5000);
      }
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">{t('vendor.payment_settings')}</h2>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{success}</span>
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">{t('vendor.payment_settings_description')}</p>
        
        {/* Payment status indicator */}
        <div className={`p-3 rounded-md ${vendorData?.has_payment_setup ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'} mb-6`}>
          {vendorData?.has_payment_setup ? (
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{t('vendor.payment_method_configured')}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{t('vendor.payment_method_not_configured')}</span>
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment method selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('vendor.select_payout_method')}
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PAYMENT_METHODS.map((method) => (
              <div 
                key={method.id}
                className={`border p-4 rounded-md cursor-pointer transition-colors ${
                  selectedMethod === method.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMethodChange(method.id)}
              >
                <div className="flex items-center">
                  <div className="mr-3">{method.icon}</div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dynamic form fields based on selected method */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('vendor.payment_details')}</h3>
          
          {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                id={field.name}
                type={field.type}
                {...register(field.name, { required: field.required && `${field.label} is required` })}
                className={`mt-1 block w-full border ${
                  errors[field.name] ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
              />
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.name].message}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {saving ? t('common.saving') : t('common.save_changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSettings;
