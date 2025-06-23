import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Save, AlertCircle, RefreshCw } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
    // Get admin methods from hook
  const { 
    getSettings, 
    updateSettings, 
    getCommissionRates,
    updateCommissionRates,
    getPaymentSettings,
    updatePaymentSettings,
    getEmailTemplates,
    updateEmailTemplate,
    emailTemplates: adminEmailTemplates,
    loading 
  } = useAdmin();
  
  // Forms
  const generalForm = useForm({
    defaultValues: {
      siteName: "",
      siteDescription: "",
      supportEmail: "",
      supportPhone: "",
      maintenanceMode: false,
      allowVendorRegistration: true
    }
  });
  
  const commissionForm = useForm({
    defaultValues: {
      defaultCommissionRate: 10,
      minCommissionRate: 5,
      maxCommissionRate: 20,
      tierThreshold1: 100000,
      tierRate1: 8,
      tierThreshold2: 500000,
      tierRate2: 6
    }
  });
  
  const paymentForm = useForm({
    defaultValues: {
      paymentGateway: "kora",
      testMode: true,
      koraMerchantId: "",
      koraPublicKey: "",
      koraSecretKey: ""
    }
  });
    const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const emailForm = useForm({
    defaultValues: {
      subject: "",
      body: ""
    }
  });

  // Initialize email templates from admin hook or defaults
  useEffect(() => {
    if (adminEmailTemplates && adminEmailTemplates.length > 0) {
      setEmailTemplates(adminEmailTemplates);
      if (!selectedTemplate && adminEmailTemplates[0]) {
        setSelectedTemplate(adminEmailTemplates[0]);
        emailForm.reset({
          subject: adminEmailTemplates[0].subject || adminEmailTemplates[0].content?.split('\n')[0] || '',
          body: adminEmailTemplates[0].body || adminEmailTemplates[0].content || ''
        });
      }
    } else {
      // Fallback to empty array if no templates
      setEmailTemplates([]);
    }
  }, [adminEmailTemplates, selectedTemplate, emailForm]);
  
  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load general settings
        const generalSettings = await getSettings();
        generalForm.reset({
          siteName: generalSettings.siteName || "",
          siteDescription: generalSettings.siteDescription || "",
          supportEmail: generalSettings.supportEmail || "",
          supportPhone: generalSettings.supportPhone || "",
          maintenanceMode: generalSettings.maintenanceMode || false,
          allowVendorRegistration: 
            generalSettings.allowVendorRegistration !== undefined ? 
            generalSettings.allowVendorRegistration : true
        });
        
        // Load commission settings
        const commissionSettings = await getCommissionRates();
        commissionForm.reset({
          defaultCommissionRate: commissionSettings.defaultRate || 10,
          minCommissionRate: commissionSettings.minRate || 5,
          maxCommissionRate: commissionSettings.maxRate || 20,
          tierThreshold1: commissionSettings.tiers?.[0]?.threshold || 100000,
          tierRate1: commissionSettings.tiers?.[0]?.rate || 8,
          tierThreshold2: commissionSettings.tiers?.[1]?.threshold || 500000,
          tierRate2: commissionSettings.tiers?.[1]?.rate || 6
        });
        
        // Load payment settings
        const paymentSettings = await getPaymentSettings();
        paymentForm.reset({
          paymentGateway: paymentSettings.gateway || "kora",
          testMode: paymentSettings.testMode !== undefined ? paymentSettings.testMode : true,
          koraMerchantId: paymentSettings.koraMerchantId || "",
          koraPublicKey: paymentSettings.koraPublicKey || "",
          koraSecretKey: paymentSettings.koraSecretKey || ""
        });
          // Load email templates - use the emailTemplates from state first
        const templates = adminEmailTemplates && adminEmailTemplates.length > 0 
          ? adminEmailTemplates 
          : await getEmailTemplates().then(result => result.success ? result.data : []);
        
        setEmailTemplates(Array.isArray(templates) ? templates : []);
        if (templates.length > 0) {
          setSelectedTemplate(templates[0]);
          emailForm.reset({
            subject: templates[0].subject || templates[0].content?.split('\n')[0] || '',
            body: templates[0].body || templates[0].content || ''
          });
        }
        
      } catch (error) {
        console.error("Failed to load settings:", error);
        setError(t("failed_to_load_settings"));
      }
    };
    
    loadSettings();
  }, []);
  
  // When template selection changes
  useEffect(() => {
    if (selectedTemplate) {
      emailForm.reset({
        subject: selectedTemplate.subject,
        body: selectedTemplate.body
      });
    }
  }, [selectedTemplate]);
  
  // Handle general settings save
  const handleGeneralSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await updateSettings(data);
      setSuccessMessage(t("settings_saved_successfully"));
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError(t("failed_to_save_settings"));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle commission settings save
  const handleCommissionSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const commissionData = {
        defaultRate: parseFloat(data.defaultCommissionRate),
        minRate: parseFloat(data.minCommissionRate),
        maxRate: parseFloat(data.maxCommissionRate),
        tiers: [
          {
            threshold: parseFloat(data.tierThreshold1),
            rate: parseFloat(data.tierRate1)
          },
          {
            threshold: parseFloat(data.tierThreshold2),
            rate: parseFloat(data.tierRate2)
          }
        ]
      };
      
      await updateCommissionRates(commissionData);
      setSuccessMessage(t("commission_settings_saved"));
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to save commission settings:", error);
      setError(t("failed_to_save_commission_settings"));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle payment settings save
  const handlePaymentSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await updatePaymentSettings(data);
      setSuccessMessage(t("payment_settings_saved"));
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to save payment settings:", error);
      setError(t("failed_to_save_payment_settings"));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle email template save
  const handleEmailTemplateSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updatedTemplate = {
        ...selectedTemplate,
        subject: data.subject,
        body: data.body
      };
      
      await updateEmailTemplate(selectedTemplate.id, updatedTemplate);
      
      // Update local state
      setEmailTemplates(prev => 
        prev.map(template => 
          template.id === selectedTemplate.id ? updatedTemplate : template
        )
      );
      
      setSuccessMessage(t("email_template_saved"));
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to save email template:", error);
      setError(t("failed_to_save_email_template"));
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle template selection
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = emailTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("platform_settings")}</h1>
        <p className="text-gray-500">{t("platform_settings_description")}</p>
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
          <Tab value="general">{t("general")}</Tab>
          <Tab value="commission">{t("commission_rates")}</Tab>
          <Tab value="payment">{t("payment_settings")}</Tab>
          <Tab value="email">{t("email_templates")}</Tab>
        </TabList>
        
        {/* General Settings */}
        <TabPanel value="general">
          <Card className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={generalForm.handleSubmit(handleGeneralSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("site_name")}
                  </label>
                  <Controller
                    name="siteName"
                    control={generalForm.control}
                    rules={{ required: t("site_name_required") }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("site_name_placeholder")}
                        error={generalForm.formState.errors.siteName?.message}
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("site_description")}
                  </label>
                  <Controller
                    name="siteDescription"
                    control={generalForm.control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder={t("site_description_placeholder")}
                        rows={3}
                      />
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("support_email")}
                    </label>
                    <Controller
                      name="supportEmail"
                      control={generalForm.control}
                      rules={{
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: t("invalid_email")
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("support_email_placeholder")}
                          error={generalForm.formState.errors.supportEmail?.message}
                        />
                      )}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("support_phone")}
                    </label>
                    <Controller
                      name="supportPhone"
                      control={generalForm.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={t("support_phone_placeholder")}
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t("maintenance_mode")}</h4>
                      <p className="text-sm text-gray-500">{t("maintenance_mode_description")}</p>
                    </div>
                    <Controller
                      name="maintenanceMode"
                      control={generalForm.control}
                      render={({ field }) => (
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t("allow_vendor_registration")}</h4>
                      <p className="text-sm text-gray-500">{t("allow_vendor_registration_description")}</p>
                    </div>
                    <Controller
                      name="allowVendorRegistration"
                      control={generalForm.control}
                      render={({ field }) => (
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save />}
                    disabled={isSaving}
                  >
                    {isSaving ? t("saving") : t("save_settings")}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </TabPanel>
        
        {/* Commission Settings */}
        <TabPanel value="commission">
          <Card className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={commissionForm.handleSubmit(handleCommissionSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("default_commission_rates")}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("commission_rates_description")}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("default_rate")} (%)
                      </label>
                      <Controller
                        name="defaultCommissionRate"
                        control={commissionForm.control}
                        rules={{ 
                          required: t("default_rate_required"),
                          min: {
                            value: 0,
                            message: t("rate_must_be_positive")
                          },
                          max: {
                            value: 100,
                            message: t("rate_must_be_less_than_100")
                          }
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            error={commissionForm.formState.errors.defaultCommissionRate?.message}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("min_rate")} (%)
                      </label>
                      <Controller
                        name="minCommissionRate"
                        control={commissionForm.control}
                        rules={{ 
                          required: t("min_rate_required"),
                          min: {
                            value: 0,
                            message: t("rate_must_be_positive")
                          }
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            error={commissionForm.formState.errors.minCommissionRate?.message}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("max_rate")} (%)
                      </label>
                      <Controller
                        name="maxCommissionRate"
                        control={commissionForm.control}
                        rules={{ 
                          required: t("max_rate_required"),
                          max: {
                            value: 100,
                            message: t("rate_must_be_less_than_100")
                          }
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            error={commissionForm.formState.errors.maxCommissionRate?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">{t("tiered_commission_rates")}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("tiered_commission_rates_description")}
                  </p>
                  
                  <div className="space-y-6">
                    {/* Tier 1 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">{t("tier")} 1</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("sales_threshold")} (XAF)
                          </label>
                          <Controller
                            name="tierThreshold1"
                            control={commissionForm.control}
                            rules={{ 
                              required: t("threshold_required")
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="1000"
                                error={commissionForm.formState.errors.tierThreshold1?.message}
                              />
                            )}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("commission_rate")} (%)
                          </label>
                          <Controller
                            name="tierRate1"
                            control={commissionForm.control}
                            rules={{ 
                              required: t("rate_required"),
                              min: {
                                value: 0,
                                message: t("rate_must_be_positive")
                              },
                              max: {
                                value: 100,
                                message: t("rate_must_be_less_than_100")
                              }
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                error={commissionForm.formState.errors.tierRate1?.message}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Tier 2 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">{t("tier")} 2</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("sales_threshold")} (XAF)
                          </label>
                          <Controller
                            name="tierThreshold2"
                            control={commissionForm.control}
                            rules={{ 
                              required: t("threshold_required")
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="1000"
                                error={commissionForm.formState.errors.tierThreshold2?.message}
                              />
                            )}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("commission_rate")} (%)
                          </label>
                          <Controller
                            name="tierRate2"
                            control={commissionForm.control}
                            rules={{ 
                              required: t("rate_required"),
                              min: {
                                value: 0,
                                message: t("rate_must_be_positive")
                              },
                              max: {
                                value: 100,
                                message: t("rate_must_be_less_than_100")
                              }
                            }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                error={commissionForm.formState.errors.tierRate2?.message}
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save />}
                    disabled={isSaving}
                  >
                    {isSaving ? t("saving") : t("save_commission_settings")}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </TabPanel>
        
        {/* Payment Settings */}
        <TabPanel value="payment">
          <Card className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("payment_gateway_settings")}</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("payment_gateway")}
                    </label>
                    <Controller
                      name="paymentGateway"
                      control={paymentForm.control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          error={paymentForm.formState.errors.paymentGateway?.message}
                        >
                          <option value="kora">{t("kora_pay")}</option>
                          <option value="custom">{t("custom_gateway")}</option>
                        </Select>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{t("test_mode")}</h4>
                      <p className="text-sm text-gray-500">{t("test_mode_description")}</p>
                    </div>
                    <Controller
                      name="testMode"
                      control={paymentForm.control}
                      render={({ field }) => (
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      )}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">{t("kora_pay_settings")}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("merchant_id")}
                      </label>
                      <Controller
                        name="koraMerchantId"
                        control={paymentForm.control}
                        rules={{ required: t("merchant_id_required") }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            error={paymentForm.formState.errors.koraMerchantId?.message}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("public_key")}
                      </label>
                      <Controller
                        name="koraPublicKey"
                        control={paymentForm.control}
                        rules={{ required: t("public_key_required") }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            error={paymentForm.formState.errors.koraPublicKey?.message}
                          />
                        )}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("secret_key")}
                      </label>
                      <Controller
                        name="koraSecretKey"
                        control={paymentForm.control}
                        rules={{ required: t("secret_key_required") }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="password"
                            error={paymentForm.formState.errors.koraSecretKey?.message}
                          />
                        )}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {t("secret_key_security_warning")}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-3"
                    leftIcon={<RefreshCw />}
                    onClick={() => {
                      // Test payment connection
                    }}
                  >
                    {t("test_connection")}
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save />}
                    disabled={isSaving}
                  >
                    {isSaving ? t("saving") : t("save_payment_settings")}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </TabPanel>
        
        {/* Email Templates */}
        <TabPanel value="email">
          <Card className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={emailForm.handleSubmit(handleEmailTemplateSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t("email_templates")}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("email_templates_description")}
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("select_template")}
                    </label>
                    <Select
                      value={selectedTemplate?.id || ""}
                      onChange={handleTemplateChange}
                    >
                      {emailTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("email_subject")}
                        </label>
                        <Controller
                          name="subject"
                          control={emailForm.control}
                          rules={{ required: t("subject_required") }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              error={emailForm.formState.errors.subject?.message}
                            />
                          )}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("email_body")}
                        </label>
                        <p className="text-sm text-gray-500 mb-2">
                          {t("email_variables_instruction")}
                        </p>
                        <Controller
                          name="body"
                          control={emailForm.control}
                          rules={{ required: t("body_required") }}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              rows={10}
                              error={emailForm.formState.errors.body?.message}
                            />
                          )}
                        />
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-medium mb-2">{t("available_variables")}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="text-sm">
                            <code>{"{{name}}"}</code> - {t("user_name")}
                          </div>
                          <div className="text-sm">
                            <code>{"{{order_id}}"}</code> - {t("order_id")}
                          </div>
                          <div className="text-sm">
                            <code>{"{{order_total}}"}</code> - {t("order_total")}
                          </div>
                          <div className="text-sm">
                            <code>{"{{status}}"}</code> - {t("order_status")}
                          </div>
                          <div className="text-sm">
                            <code>{"{{date}}"}</code> - {t("current_date")}
                          </div>
                          <div className="text-sm">
                            <code>{"{{store_name}}"}</code> - {t("store_name")}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save />}
                    disabled={isSaving || !selectedTemplate}
                  >
                    {isSaving ? t("saving") : t("save_template")}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};
