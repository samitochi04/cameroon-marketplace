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
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle
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
        
        // Build query for vendor_earnings based on date range
        let query = supabase
          .from('vendor_earnings')
          .select(`
            id,
            vendor_id,
            order_item_id,
            amount,
            fee,
            net_amount,
            status,
            description,
            created_at,
            transaction_id
          `, { count: 'exact' })
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false });

        // Apply date range filter
        const currentDate = new Date();
        let startDate;
        
        switch (dateRange) {
          case 'last_7_days':
            startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'last_30_days':
            startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'last_3_months':
            startDate = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
            query = query.gte('created_at', startDate.toISOString());
            break;
          case 'all_time':
          default:
            // No date filter for all time
            break;
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE - 1;
        
        const { data: earnings, error: earningsError, count: totalCount } = await query
          .range(startIndex, endIndex);

        if (earningsError) {
          console.error('Error fetching earnings:', earningsError);
          throw new Error('Failed to fetch earnings data');
        }

        // Calculate totals for all earnings (not just current page)
        const { data: allEarnings, error: totalsError } = await supabase
          .from('vendor_earnings')
          .select('amount, fee, net_amount, status')
          .eq('vendor_id', user.id);

        if (totalsError) {
          console.error('Error fetching totals:', totalsError);
        }

        // Calculate summary data
        const totalEarnings = allEarnings?.reduce((sum, earning) => sum + (earning.amount || 0), 0) || 0;
        const totalFees = allEarnings?.reduce((sum, earning) => sum + (earning.fee || 0), 0) || 0;
        const netEarnings = allEarnings?.reduce((sum, earning) => sum + (earning.net_amount || 0), 0) || 0;
        const pendingEarnings = allEarnings?.filter(e => e.status === 'pending')
          .reduce((sum, earning) => sum + (earning.net_amount || 0), 0) || 0;

        setEarningsData({
          balance: vendorData?.balance || 0,
          totalEarnings: vendorData?.total_earnings || totalEarnings,
          totalFees,
          netEarnings,
          pendingEarnings,
          lastPayoutDate: vendorData?.last_payout_date,
          lastPayoutAmount: vendorData?.last_payout_amount || 0
        });

        setTransactions(earnings || []);
        setTotalPages(Math.ceil((totalCount || 0) / ITEMS_PER_PAGE));

      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError(err.message || 'Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user, dateRange, currentPage]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    
    const icons = {
      'pending': <Clock className="w-3 h-3 mr-1" />,
      'processing': <TrendingUp className="w-3 h-3 mr-1" />,
      'completed': <CheckCircle className="w-3 h-3 mr-1" />,
      'failed': <AlertCircle className="w-3 h-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {icons[status] || icons.pending}
        {status || 'pending'}
      </span>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gains & Revenus</h1>
          <p className="text-gray-600 mt-1">Suivez vos revenus et l'historique des paiements</p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all_time', label: 'Tout le temps' },
            { key: 'last_7_days', label: '7 derniers jours' },
            { key: 'last_30_days', label: '30 derniers jours' },
            { key: 'last_3_months', label: '3 derniers mois' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                dateRange === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Solde Actuel</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {formatCurrency(earningsData?.balance || 0)}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus Totaux</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {formatCurrency(earningsData?.totalEarnings || 0)}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending Earnings */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Attente</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(earningsData?.pendingEarnings || 0)}
                </h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Last Payout */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dernier Paiement</p>
                <h3 className="text-2xl font-bold text-purple-600">
                  {formatCurrency(earningsData?.lastPayoutAmount || 0)}
                </h3>
                {earningsData?.lastPayoutDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(earningsData.lastPayoutDate)}
                  </p>
                )}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Historique des Transactions
              </h2>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frais
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description || 'Vente de produit'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -{formatCurrency(transaction.fee || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(transaction.net_amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} sur {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune transaction
              </h3>
              <p className="text-gray-500">
                Vos revenus apparaîtront ici une fois que vous aurez commencé à vendre.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;