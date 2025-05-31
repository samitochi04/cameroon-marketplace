import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  AlertTriangle, 
  Check,
  Settings as SettingsIcon
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';

const AdminSettings = () => {
  const { t } = useTranslation();
  const { get, put } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Settings state
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Cameroon Marketplace',
      siteDescription: 'The best multi-vendor platform in Cameroon',
      contactEmail: 'contact@cameroonmarketplace.com',
      supportPhone: '+237 123 456 789',
      defaultLanguage: 'en',
      maintenanceMode: false
    },
    vendor: {
      allowVendorRegistration: true,
      requireVendorApproval: true,
      defaultCommissionRate: 10,
      minimumWithdrawal: 5000,
      allowInstantWithdrawal: false,
      vendorTerms: 'Default vendor terms and conditions...'
    },
    payment: {
      activeMethods: ['mobile_money', 'card', 'bank_transfer'],
      defaultCurrency: 'XAF',
      testMode: true,
      autoCapture: true,
      allowRefunds: true
    },
    shipping: {
      displayShippingCalculator: true,
      flatRateShipping: 1500,
      freeShippingThreshold: 15000,
      allowLocalPickup: true
    },
    notifications: {
      emailNotifications: true,
      adminOrderNotification: true,
      vendorOrderNotification: true,
      lowStockThreshold: 5,
      sendLowStockAlerts: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await get('/admin/settings');
      // If we have settings from the API, use them, otherwise keep defaults
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(t('failed_to_load_settings'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      await put('/admin/settings', settings);
      
      setSuccessMessage(t('settings_saved_successfully'));
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(t('failed_to_save_settings'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value
      }
    }));
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
        
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
              {t('saving')}...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('save_settings')}
            </>
          )}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-start">
          <Check className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm">
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabList className="border-b border-gray-200 px-4">
            <Tab>{t('general')}</Tab>
            <Tab>{t('vendor')}</Tab>
            <Tab>{t('payment')}</Tab>
            <Tab>{t('shipping')}</Tab>
            <Tab>{t('notifications')}</Tab>
          </TabList>
          
          {/* General Settings */}
          <TabPanel>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('site_name')}
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('contact_email')}
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="supportPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('support_phone')}
                  </label>
                  <input
                    type="text"
                    id="supportPhone"
                    value={settings.general.supportPhone}
                    onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('default_language')}
                  </label>
                  <select
                    id="defaultLanguage"
                    value={settings.general.defaultLanguage}
                    onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('site_description')}
                  </label>
                  <textarea
                    id="siteDescription"
                    rows={3}
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                  />
                  <span className="ml-2">{t('maintenance_mode')}</span>
                </div>
              </div>
            </div>
          </TabPanel>
          
          {/* Vendor Settings */}
          <TabPanel>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Switch
                    checked={settings.vendor.allowVendorRegistration}
                    onChange={(checked) => updateSetting('vendor', 'allowVendorRegistration', checked)}
                  />
                  <span className="ml-2">{t('allow_vendor_registration')}</span>
                </div>
                
                <div className="flex items-center">
                  <Switch
                    checked={settings.vendor.requireVendorApproval}
                    onChange={(checked) => updateSetting('vendor', 'requireVendorApproval', checked)}
                  />
                  <span className="ml-2">{t('require_vendor_approval')}</span>
                </div>
                
                <div>
                  <label htmlFor="defaultCommissionRate" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('default_commission_rate')} (%)
                  </label>
                  <input
                    type="number"
                    id="defaultCommissionRate"
                    min="0"
                    max="100"
                    value={settings.vendor.defaultCommissionRate}
                    onChange={(e) => updateSetting('vendor', 'defaultCommissionRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="minimumWithdrawal" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('minimum_withdrawal')} (XAF)
                  </label>
                  <input
                    type="number"
                    id="minimumWithdrawal"
                    min="0"
                    value={settings.vendor.minimumWithdrawal}
                    onChange={(e) => updateSetting('vendor', 'minimumWithdrawal', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="flex items-center">
                  <Switch
                    checked={settings.vendor.allowInstantWithdrawal}
                    onChange={(checked) => updateSetting('vendor', 'allowInstantWithdrawal', checked)}
                  />
                  <span className="ml-2">{t('allow_instant_withdrawal')}</span>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="vendorTerms" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('vendor_terms')}
                  </label>
                  <Textarea
                    id="vendorTerms"
                    rows={5}
                    value={settings.vendor.vendorTerms}
                    onChange={(e) => updateSetting('vendor', 'vendorTerms', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabPanel>
          
          {/* Additional tab panels for payment, shipping, and notifications */}
          <TabPanel>
            <div className="p-6">
              <p className="text-gray-500">{t('payment_settings_content')}</p>
              {/* Add payment settings fields here */}
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="p-6">
              <p className="text-gray-500">{t('shipping_settings_content')}</p>
              {/* Add shipping settings fields here */}
            </div>
          </TabPanel>
          
          <TabPanel>
            <div className="p-6">
              <p className="text-gray-500">{t('notification_settings_content')}</p>
              {/* Add notification settings fields here */}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
