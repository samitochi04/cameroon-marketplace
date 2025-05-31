import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Store, 
  Check, 
  X,
  Eye, 
  ChevronDown
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const AdminVendors = () => {
  const { t } = useTranslation();
  const { get, post } = useApi();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selected vendor and modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors when search term or status filter changes
  useEffect(() => {
    let filtered = [...vendors];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vendor => 
        vendor.storeName?.toLowerCase().includes(term) || 
        vendor.user?.email?.toLowerCase().includes(term) || 
        vendor.user?.firstName?.toLowerCase().includes(term) || 
        vendor.user?.lastName?.toLowerCase().includes(term)
      );
    }
    
    setFilteredVendors(filtered);
  }, [vendors, searchTerm, statusFilter]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await get('/vendors');
      setVendors(response.data || []);
      setFilteredVendors(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(t('failed_to_load_vendors'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const handleApproveVendor = async (id) => {
    try {
      await post(`/vendors/${id}/approve`);
      // Update vendor in the list
      setVendors(vendors.map(vendor => 
        vendor.id === id ? { ...vendor, status: 'approved' } : vendor
      ));
    } catch (error) {
      console.error('Error approving vendor:', error);
      setError(t('failed_to_approve_vendor'));
    }
  };

  const handleRejectVendor = async (id) => {
    try {
      await post(`/vendors/${id}/reject`);
      // Update vendor in the list
      setVendors(vendors.map(vendor => 
        vendor.id === id ? { ...vendor, status: 'rejected' } : vendor
      ));
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      setError(t('failed_to_reject_vendor'));
    }
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
      <h1 className="text-2xl font-bold mb-6">{t('vendors')}</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('search_vendors')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Status filter */}
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="approved">{t('approved')}</option>
              <option value="rejected">{t('rejected')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('store')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('owner')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('products')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                          {vendor.logoUrl ? (
                            <img 
                              src={vendor.logoUrl} 
                              alt={vendor.storeName}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <Store className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.storeName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('joined')} {new Date(vendor.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vendor.user?.firstName || ''} {vendor.user?.lastName || ''}
                      </div>
                      <div className="text-sm text-gray-500">{vendor.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.productCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                        vendor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {t(vendor.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(vendor)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title={t('view_details')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {vendor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveVendor(vendor.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title={t('approve')}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectVendor(vendor.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('reject')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? t('no_matching_vendors') : t('no_vendors')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Vendor Details Modal */}
      {showDetailsModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('vendor_details')}</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Store Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{t('store_information')}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mb-2 sm:mb-0">
                    {selectedVendor.logoUrl ? (
                      <img 
                        src={selectedVendor.logoUrl} 
                        alt={selectedVendor.storeName}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <Store className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div className="sm:ml-4">
                    <h4 className="text-xl font-semibold">{selectedVendor.storeName}</h4>
                    <p className="text-gray-500">
                      {t('joined')}: {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium mb-1">{t('store_description')}</h5>
                  <p className="text-gray-700">{selectedVendor.description || t('no_description')}</p>
                </div>
                
                {selectedVendor.bannerUrl && (
                  <div className="mt-4">
                    <h5 className="font-medium mb-1">{t('store_banner')}</h5>
                    <img 
                      src={selectedVendor.bannerUrl} 
                      alt="Store Banner" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{t('contact_information')}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">{t('owner_name')}</h5>
                    <p>{selectedVendor.user?.firstName || ''} {selectedVendor.user?.lastName || ''}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">{t('email')}</h5>
                    <p>{selectedVendor.user?.email || ''}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">{t('phone_number')}</h5>
                    <p>{selectedVendor.storePhone || t('not_provided')}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">{t('address')}</h5>
                    <p>{selectedVendor.storeAddress || t('not_provided')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">{t('business_information')}</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">{t('commission_rate')}</h5>
                    <p>{selectedVendor.commissionRate || 10}%</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">{t('payment_method')}</h5>
                    <p>{selectedVendor.paymentMethod || t('not_provided')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('close')}
              </button>
              
              {selectedVendor.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleRejectVendor(selectedVendor.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    {t('reject')}
                  </button>
                  <button
                    onClick={() => {
                      handleApproveVendor(selectedVendor.id);
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {t('approve')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
