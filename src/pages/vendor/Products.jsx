import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus, ShoppingBag, Edit, Archive, AlertTriangle, Check, X } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const VendorProducts = () => {
  const { t } = useTranslation();
  const { get, post } = useApi();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await get('/products/vendor/products');
        setProducts(response.data || []);
        setFilteredProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(t('failed_to_load_products'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [get, t]);

  // Filter products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, statusFilter]);

  // Handle updating product status
  const handleStatusChange = async (productId, newStatus) => {
    try {
      await post(`/products/${productId}/${newStatus === 'published' ? 'publish' : 'archive'}`);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, status: newStatus } 
            : product
        )
      );
    } catch (error) {
      console.error(`Error updating product status:`, error);
    }
  };

  // Delete confirmation
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await post(`/products/${productToDelete.id}/archive`);
      
      // Remove from list or update status based on your requirements
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productToDelete.id)
      );
      
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Format currency
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <p className="text-xl font-semibold mt-4">{t('something_went_wrong')}</p>
        <p className="text-gray-600 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
        >
          {t('try_again')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('my_products')}</h1>
        
        <Link 
          to="/vendor-portal/products/new"
          className="mt-3 md:mt-0 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('add_new_product')}
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('search_products')}
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
              className="appearance-none pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('all_products')}</option>
              <option value="published">{t('published')}</option>
              <option value="draft">{t('drafts')}</option>
              <option value="archived">{t('archived')}</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Products list */}
      {filteredProducts.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('product')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('price')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('stock')}
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      {product.salePrice && (
                        <div className="text-sm text-red-500">
                          {formatCurrency(product.salePrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stockQuantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'published' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <Link
                          to={`/vendor-portal/products/edit/${product.id}`}
                          className="text-primary hover:text-primary-dark"
                          title={t('edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        
                        {product.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(product.id, 'published')}
                            className="text-green-600 hover:text-green-800"
                            title={t('publish')}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        
                        {product.status === 'published' && (
                          <button
                            onClick={() => handleStatusChange(product.id, 'draft')}
                            className="text-amber-600 hover:text-amber-800"
                            title={t('unpublish')}
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => confirmDelete(product)}
                          className="text-red-600 hover:text-red-800"
                          title={t('delete')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-500 mb-1">
            {searchTerm || statusFilter !== 'all' 
              ? t('no_products_match_filters')
              : t('no_products_yet')}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? t('try_adjusting_filters')
              : t('add_your_first_product')}
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              {t('clear_filters')}
            </button>
          ) : (
            <Link
              to="/vendor-portal/products/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('add_new_product')}
            </Link>
          )}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('confirm_delete')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('confirm_delete_message', { name: productToDelete.name })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
