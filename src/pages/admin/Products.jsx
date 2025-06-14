import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, MoreVertical, CheckCircle, Eye, Edit, 
  AlertTriangle, Trash2, ArrowUp, ArrowDown, ShoppingBag,
  Plus, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const AdminProducts = () => {
  const { t } = useTranslation();
  const { get, post } = useApi();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Data lists for filters
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  // Selected products for bulk actions
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch categories, vendors, and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, vendorsRes] = await Promise.all([
          get('/categories'),
          get('/vendors?status=approved')
        ]);
        
        setCategories(categoriesRes.data || []);
        setVendors(vendorsRes.data || []);
        
        fetchProducts();
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(t('failed_to_load_data'));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [get, t]);

  // Fetch products with filters, sort and pagination
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let url = `/admin/products?page=${currentPage}&pageSize=${pageSize}&sortField=${sortField}&sortDirection=${sortDirection}`;
      
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (categoryFilter) url += `&categoryId=${categoryFilter}`;
      if (vendorFilter) url += `&vendorId=${vendorFilter}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const response = await get(url);
      
      if (response.data) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(t('failed_to_load_products'));
    } finally {
      setIsLoading(false);
    }
  }, [get, t, currentPage, pageSize, sortField, sortDirection, statusFilter, categoryFilter, vendorFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle filter changes
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handleVendorChange = (e) => {
    setVendorFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Product actions
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      await post(`/admin/products/${productToDelete.id}/delete`);
      
      // Remove from list
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setSelectedProducts(selectedProducts.filter(id => id !== productToDelete.id));
      
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(t('failed_to_delete_product'));
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedProducts.length === 0) return;
    
    try {
      await post(`/admin/products/bulk-status`, {
        productIds: selectedProducts,
        status
      });
      
      // Update local state
      const updatedProducts = products.map(product => {
        if (selectedProducts.includes(product.id)) {
          return { ...product, status };
        }
        return product;
      });
      
      setProducts(updatedProducts);
      setSelectedProducts([]);
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(t('failed_to_update_products'));
    }
  };

  // Handle select/deselect products
  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
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

  if (isLoading && !products.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('products_management')}</h1>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <Link 
            to="/admin/products/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('add_product')}
          </Link>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative col-span-1 md:col-span-3 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('search_products')}
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="appearance-none pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="published">{t('published')}</option>
              <option value="draft">{t('drafts')}</option>
              <option value="archived">{t('archived')}</option>
            </select>
          </div>
          
          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="appearance-none px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{t('all_categories')}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Vendor filter */}
          <div className="relative">
            <select
              value={vendorFilter}
              onChange={handleVendorChange}
              className="appearance-none px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{t('all_vendors')}</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.store_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
          <div>
            <span className="mr-2">
              {t('selected_products', { count: selectedProducts.length })}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkStatusChange('published')}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
            >
              {t('publish')}
            </button>
            <button
              onClick={() => handleBulkStatusChange('archived')}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              {t('archive')}
            </button>
            <button
              onClick={() => handleBulkStatusChange('draft')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
            >
              {t('mark_as_draft')}
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              {t('clear_selection')}
            </button>
          </div>
        </div>
      )}
      
      {/* Products table */}
      {filteredProducts.length > 0 ? (
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      {t('product')}
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('vendor_name')}
                    >
                      {t('vendor')}
                      {sortField === 'vendor_name' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('category_name')}
                    >
                      {t('category')}
                      {sortField === 'category_name' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      {t('price')}
                      {sortField === 'price' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('stock_quantity')}
                    >
                      {t('stock')}
                      {sortField === 'stock_quantity' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      {t('status')}
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="h-3 w-3 ml-1" /> : 
                          <ArrowDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
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
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </td>
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
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.vendor?.store_name || t('vendor_not_found')}
                      </div>
                      {product.vendor && (
                        <div className="text-xs text-primary hover:underline cursor-pointer">
                          <Link to={`/admin/vendors/${product.vendor_id}`}>
                            {t('view_vendor')}
                          </Link>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {product.category?.name || t('category_not_found')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      {product.sale_price && product.sale_price < product.price && (
                        <div className="text-sm text-red-600">
                          {formatCurrency(product.sale_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${product.stock_quantity < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                        {product.stock_quantity}
                      </span>
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
                          to={`/admin/products/${product.id}`}
                          className="text-gray-500 hover:text-gray-700"
                          title={t('view_details')}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-primary hover:text-primary-dark"
                          title={t('edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(product)}
                          className="text-red-500 hover:text-red-700"
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t('showing')} <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> {t('to')}{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, products.length)}
                    </span>{' '}
                    {t('of')} <span className="font-medium">{products.length}</span> {t('results')}
                  </p>
                </div>
                <div className="flex mt-2 sm:mt-0">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 border rounded-md mr-2 ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic to show current page in the middle when possible
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-md mx-1 ${
                          currentPage === pageNum 
                            ? 'bg-primary text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 border rounded-md ml-2 ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {searchTerm || statusFilter !== 'all' || categoryFilter || vendorFilter
              ? t('no_products_match_filters')
              : t('no_products_found')}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' || categoryFilter || vendorFilter
              ? t('try_different_filters')
              : t('add_your_first_product')}
          </p>
          {searchTerm || statusFilter !== 'all' || categoryFilter || vendorFilter ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('');
                setVendorFilter('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              {t('clear_filters')}
            </button>
          ) : (
            <Link
              to="/admin/products/new"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {t('add_product')}
            </Link>
          )}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('confirm_delete')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('confirm_delete_product_message', { name: productToDelete.name })}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
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

export default AdminProducts;
