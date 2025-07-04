import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  AlertCircle, 
  DollarSign 
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const EarningsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState('all_time');
  const [error, setError] = useState(null);
  // Fetch vendor earnings data
  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get vendor data including balance
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('balance, total_earnings, last_payout_date, last_payout_amount')
          .eq('id', user.id)
          .single();
          
        if (vendorError) {
          console.error('Error fetching vendor data:', vendorError);
          throw new Error('Failed to fetch vendor data');
        }
        
        // First get vendor payouts data (this is what actually tracks earnings)
        // for more accurate earnings information
        let payoutQuery = supabase
          .from('vendor_payouts')
          .select(`
            id,
            vendor_id,
            amount,
            status,
            created_at,
            transaction_id,
            operator,
            order_reference,
            payout_method,
            notes
          `, { count: 'exact' })
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false });

        // Apply date range filter
        const now = new Date();
        let startDate;
          switch (dateRange) {
          case 'last_7_days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            payoutQuery = payoutQuery.gte('created_at', startDate.toISOString());
            break;
          case 'last_30_days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            payoutQuery = payoutQuery.gte('created_at', startDate.toISOString());
            break;
          case 'last_90_days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            payoutQuery = payoutQuery.gte('created_at', startDate.toISOString());
            break;
          case 'this_year': {
            const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
            payoutQuery = payoutQuery.gte('created_at', firstDayOfYear.toISOString());
            break;
          }
          case 'all_time':
          default:
            // No date filter for all time
            break;
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE - 1;
        
        const { data: payouts, error: payoutsError, count: totalCount } = await payoutQuery
          .range(startIndex, endIndex);

        if (payoutsError) {
          console.error('Error fetching payouts:', payoutsError);
          throw new Error('Failed to fetch earnings data');
        }

        // For each payout, get related order data to display
        // We'll enrich the payouts with order information
        const enrichedPayouts = await Promise.all(payouts.map(async (payout) => {
          if (payout.order_reference) {
            try {
              // Using order_reference to find order items
              const { data: orderItems } = await supabase
                .from('order_items')
                .select(`
                  product_id,
                  order_id,
                  products:product_id (name, images),
                  orders:order_id (created_at)
                `)
                .eq('order_id', payout.order_reference)
                .limit(1);
                
              const orderItem = orderItems && orderItems.length > 0 ? orderItems[0] : null;
              return {
                ...payout,
                product_name: orderItem?.products?.name || 'Unknown Product',
                product_image: orderItem?.products?.images?.[0] || null,
                order_date: orderItem?.orders?.created_at || payout.created_at
              };
            } catch (err) {
              console.error('Error fetching order item details:', err);
              return payout;
            }
          }
          return payout;
        }));

        // Calculate totals for all payouts (not date filtered)
        const { data: allPayouts, error: totalsError } = await supabase
          .from('vendor_payouts')
          .select('amount, status')
          .eq('vendor_id', user.id);

        if (totalsError) {
          console.error('Error fetching totals:', totalsError);
        }

        // Get fee information if available (platform commission)
        // This would require a separate query or calculation
        
        // Calculate summary data
        const totalEarnings = allPayouts?.reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;
        const completedEarnings = allPayouts
          ?.filter(p => p.status === 'completed')
          .reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;
        const pendingEarnings = allPayouts
          ?.filter(p => p.status === 'pending')
          .reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;
        const failedEarnings = allPayouts
          ?.filter(p => p.status === 'failed')
          .reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;

        setEarningsData({
          balance: vendorData?.balance || 0,
          totalEarnings: vendorData?.total_earnings || completedEarnings,
          completedEarnings,
          pendingEarnings,
          failedEarnings,
          lastPayoutDate: vendorData?.last_payout_date,
          lastPayoutAmount: vendorData?.last_payout_amount || 0
        });

        // Format the transactions for display
        const formattedTransactions = enrichedPayouts.map(payout => ({
          id: payout.id,
          date: payout.created_at,
          description: `Payout for ${payout.product_name || 'order'} #${payout.order_reference?.slice(0, 8) || 'N/A'}`,
          amount: payout.amount,
          status: payout.status,
          reference: payout.transaction_id,
          error: payout.notes, // Using notes field for error messages
          productImage: payout.product_image,
          operator: payout.operator
        }));
        
        setTransactions(formattedTransactions);
        setTotalPages(Math.ceil((totalCount || 0) / ITEMS_PER_PAGE));

      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError(t('vendor.failed_to_load_earnings'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarningsData();
  }, [user, t, dateRange, currentPage]);
  
  // Update the VendorEarnings component with more accurate data
  useEffect(() => {
    if (earningsData) {
      const vendorEarningsData = {
        balance: earningsData.balance || 0,
        totalEarnings: earningsData.totalEarnings || 0,
        pendingEarnings: earningsData.pendingEarnings || 0,
        lastPayout: earningsData.lastPayoutAmount || 0
      };
    }
  }, [earningsData]);
  
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
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('vendor.earnings')}</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Current Balance */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('vendor.current_balance')}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(earningsData?.balance || 0)}</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            {earningsData?.balance > 0 ? (
              <button className="bg-primary text-white px-4 py-2 rounded-md text-sm">
                {t('vendor.request_payout')}
              </button>
            ) : (
              <span className="text-sm text-gray-500">{t('vendor.minimum_payout_not_reached')}</span>
            )}
          </div>
        </div>
        
        {/* Total Earnings */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">{t('vendor.total_earnings')}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(earningsData?.total_earnings || 0)}</p>
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {t('vendor.lifetime_earnings')}
          </div>
        </div>
        
        {/* Last Payout */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">{t('vendor.last_payout')}</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(earningsData?.last_payout_amount || 0)}</p>
          <div className="mt-4 text-sm text-gray-500">
            {earningsData?.last_payout_date 
              ? formatDate(earningsData.last_payout_date)
              : t('vendor.no_payouts_yet')}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-medium">{t('vendor.earnings_history')}</h2>
          
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
              {t('vendor.filter_by_date')}
            </label>
            <select
              id="date-range"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="all_time">{t('vendor.all_time')}</option>
              <option value="last_30_days">{t('vendor.last_30_days')}</option>
              <option value="last_90_days">{t('vendor.last_90_days')}</option>
              <option value="this_year">{t('vendor.this_year')}</option>
            </select>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
            <Download className="h-4 w-4 mr-2" />
            {t('vendor.export_csv')}
          </button>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  {t('vendor.order_id')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor.gross_amount')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor.fee')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor.net_amount')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vendor.status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description || t('vendor.order_earnings')}
                    </td>                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.reference ? `#${transaction.reference.slice(-8)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(transaction.amount * 0.05)} {/* Assuming 5% platform fee */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount * 0.95)} {/* Net amount after platform fee */}
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
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <p>{t('vendor.no_transactions_for_period')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('previous')}
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages 
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('showing')} <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> {t('to')}{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}
                  </span>{' '}
                  {t('of')} <span className="font-medium">{transactions.length}</span> {t('results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">{t('previous')}</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'bg-primary text-white border-primary z-10'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">{t('next')}</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsPage;
