import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, Calendar, Eye, AlertCircle, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const VendorEarnings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Get the auth token for API calls
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('Authentication required');
        }

        // Call our authenticated backend API
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/vendor/earnings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          setEarnings(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch earnings');
        }
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError(err.message || 'Failed to fetch earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [user?.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-CM');
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center text-red-600 mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">{t('vendor.earnings_error')}</h3>
        </div>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-green-600" />
          {t('vendor.earnings')}
        </h2>
        <Link 
          to="/vendor-portal/earnings" 
          className="text-sm text-primary hover:underline flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          {t('vendor.view_details')}
        </Link>
      </div>

      <div className="space-y-4">
        {/* Current Balance */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">{t('vendor.current_balance')}</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(earnings?.balance)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {t('vendor.total_earnings')}
          </span>
          <span className="font-semibold">{formatCurrency(earnings?.total_earnings)}</span>
        </div>

        {/* Last Payout */}
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {t('vendor.last_payout')}
          </span>
          <div className="text-right">
            <div className="font-semibold">{formatCurrency(earnings?.last_payout_amount)}</div>
            <div className="text-xs text-gray-500">{formatDate(earnings?.last_payout_date)}</div>
          </div>
        </div>

        {/* Info about automatic payouts */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>{t('vendor.auto_payout_info')}:</strong> {t('vendor.auto_payout_description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorEarnings;
