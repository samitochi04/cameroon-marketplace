import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const VendorEarnings = ({ className = '' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState({
    balance: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    lastPayout: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchEarningsData();
    }
  }, [user?.id]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);

      // Get vendor balance and total earnings from vendors table
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('balance, total_earnings, last_payout_amount')
        .eq('id', user.id)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor data:', vendorError);
        return;
      }

      // Get pending earnings from vendor_earnings table
      const { data: pendingData, error: pendingError } = await supabase
        .from('vendor_earnings')
        .select('net_amount')
        .eq('vendor_id', user.id)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending earnings:', pendingError);
      }

      const pendingEarnings = pendingData?.reduce((sum, earning) => sum + (earning.net_amount || 0), 0) || 0;

      setEarningsData({
        balance: vendorData?.balance || 0,
        totalEarnings: vendorData?.total_earnings || 0,
        pendingEarnings,
        lastPayout: vendorData?.last_payout_amount || 0
      });

    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Revenus</h2>
        <DollarSign className="h-5 w-5 text-green-600" />
      </div>

      <div className="space-y-4">
        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Solde Disponible</p>
              <p className="text-xs text-green-700">Prêt pour retrait</p>
            </div>
          </div>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(earningsData.balance)}
          </p>
        </div>

        {/* Total Earnings */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Revenus Totaux</p>
              <p className="text-xs text-blue-700">Depuis le début</p>
            </div>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(earningsData.totalEarnings)}
          </p>
        </div>

        {/* Pending Earnings */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-900">En Attente</p>
              <p className="text-xs text-yellow-700">En cours de traitement</p>
            </div>
          </div>
          <p className="text-lg font-bold text-yellow-600">
            {formatCurrency(earningsData.pendingEarnings)}
          </p>
        </div>

        {/* Last Payout */}
        {earningsData.lastPayout > 0 && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Dernier Paiement</p>
                <p className="text-xs text-gray-600">Dernier retrait effectué</p>
              </div>
            </div>
            <p className="text-lg font-bold text-gray-600">
              {formatCurrency(earningsData.lastPayout)}
            </p>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => window.location.href = '/vendor-portal/earnings'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Voir Détails des Revenus
        </button>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-900 font-medium">Information</p>
            <p className="text-xs text-blue-700 mt-1">
              Les revenus sont calculés automatiquement lors des ventes. 
              Les paiements sont traités sous 2-3 jours ouvrables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorEarnings;