import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, HelpCircle } from 'lucide-react';

export const VendorPendingPage = ({ vendorStatus }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="bg-yellow-100 rounded-full p-3 inline-flex mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('vendor.pending_approval')}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {vendorStatus?.message || t('vendor.pending_instructions')}
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-primary hover:text-primary-dark"
            >
              <ArrowLeft size={16} className="mr-1" />
              {t('common.return_to_home')}
            </Link>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {t('vendor.need_assistance')}
              </h3>
              
              <Link 
                to="/contact" 
                className="inline-flex items-center text-sm px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <HelpCircle size={16} className="mr-1" />
                {t('vendor.contact_support')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPendingPage;
