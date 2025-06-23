import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { checkVendorStatus, ensureVendorProfile } from '@/utils/vendorHelpers';

export const VendorRegistration = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        if (!user) return;
        
        setLoading(true);
        
        // Ensure user has a vendor profile if they have vendor role
        if (user.role === 'vendor') {
          await ensureVendorProfile(user.id, { 
            name: user.name,
            store_name: user.store_name || `${user.name}'s Store`
          });
        }
        
        // Check vendor status
        const vendorStatus = await checkVendorStatus(user.id);
        setStatus(vendorStatus);
      } catch (err) {
        console.error("Error checking vendor status:", err);
        setError(t('vendor.status_check_error'));
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [user, t]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">{t('vendor.status_error')}</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!status) return null;
  
  return (
    <div className={`rounded-md p-4 ${
      status.isApproved ? 'bg-green-50 border border-green-200' : 
      status.isPending ? 'bg-yellow-50 border border-yellow-200' :
      'bg-red-50 border border-red-200'
    }`}>
      <div className="flex">
        {status.isApproved ? (
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
        ) : status.isPending ? (
          <Clock className="h-5 w-5 text-yellow-400 mr-2" />
        ) : (
          <Info className="h-5 w-5 text-red-400 mr-2" />
        )}
        
        <div>
          <h3 className={`text-sm font-medium ${
            status.isApproved ? 'text-green-800' : 
            status.isPending ? 'text-yellow-800' :
            'text-red-800'
          }`}>
            {status.isApproved ? t('vendor.approved_status') :
             status.isPending ? t('vendor.pending_status') :
             t('vendor.rejected_status')}
          </h3>
          <p className={`text-sm mt-1 ${
            status.isApproved ? 'text-green-700' : 
            status.isPending ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {status.message}
          </p>
          
          {!status.isApproved && (
            <div className="mt-3">
              {status.isPending ? (
                <p className="text-sm text-yellow-700">{t('vendor.pending_instructions')}</p>
              ) : (
                <Link to="/contact" className="text-sm font-medium text-primary hover:text-primary-dark">
                  {t('vendor.contact_support')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
