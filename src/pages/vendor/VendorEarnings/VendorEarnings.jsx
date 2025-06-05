import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { DollarSign, Download, AlertCircle, Calendar, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const VendorEarnings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState(null);
  
  // Fetch vendor earnings data
  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get vendor data including balance
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('balance, total_earnings, last_payout_date, last_payout_amount')
          .eq('id', user.id)
          .single();
          
        if (vendorError) throw vendorError;
        
        // Get recent earnings transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('vendor_earnings')
          .select('*')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (transactionsError) throw transactionsError;
        
        setEarningsData(vendorData);
        setRecentTransactions(transactions || []);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError(t('vendor.failed_to_load_earnings'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarningsData();
  }, [user, t]);
  
  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'XAF 0';
    return `XAF ${amount.toLocaleString()}`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('vendor.earnings_overview')}</h2>
        <Link 
          to="/vendor-portal/earnings"
          className="text-primary hover:text-primary-dark text-sm flex items-center"
        >
          {t('vendor.view_detailed_earnings')}
        </Link>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Balance */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('vendor.current_balance')}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(earningsData?.balance || 0)}</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            {earningsData?.balance > 0 ? (
              <button className="text-primary hover:underline">
                {t('vendor.request_payout')}
              </button>
            ) : (
              <span className="text-gray-500">{t('vendor.minimum_payout_not_reached')}</span>
            )}
          </div>
        </div>
        
        {/* Total Earnings */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('vendor.total_earnings')}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(earningsData?.total_earnings || 0)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {t('vendor.lifetime_earnings')}
          </div>
        </div>
        
        {/* Last Payout */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('vendor.last_payout')}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(earningsData?.last_payout_amount || 0)}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm flex items-center text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {earningsData?.last_payout_date 
              ? formatDate(earningsData.last_payout_date)
              : t('vendor.no_payouts_yet')}
          </div>
        </div>
      </div>
      
      {/* Recent transactions */}
      <div>
        <h3 className="text-lg font-medium mb-4">{t('vendor.recent_transactions')}</h3>
        
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.description')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.amount')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('vendor.status')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.description || t('vendor.order_earnings')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(transaction.net_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{t('vendor.no_transactions_yet')}</p>
            <p className="text-sm text-gray-400 mt-1">{t('vendor.earnings_appear_after_sales')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorEarnings;
