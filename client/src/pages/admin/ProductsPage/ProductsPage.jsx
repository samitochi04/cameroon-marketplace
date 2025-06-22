import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Plus, Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/common/Pagination";
import { ProductDetailModal } from "@/components/admin/modals/ProductDetailModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { exportProductsData } from "@/utils/exportHelpers";
import { useAdmin } from "@/hooks/useAdmin";

export const ProductsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const {
    products = [],
    categories = [],
    vendors = [],
    loading,
    approveProduct,
    rejectProduct
  } = useAdmin();

  const itemsPerPage = 10;

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || product.status === statusFilter;
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
    const matchesVendor = !vendorFilter || product.vendorId === vendorFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesVendor;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleApproveProduct = (product) => {
    setConfirmAction({
      type: 'approve',
      product,
      title: t('admin.approve_product_confirmation_title'),
      message: t('admin.approve_product_confirmation_message', { name: product.name }),
      confirmText: t('admin.approve'),
      onConfirm: async () => {
        await approveProduct(product.id);
        setShowConfirmDialog(false);
      }
    });
    setShowConfirmDialog(true);
  };

  const handleRejectProduct = (product) => {
    setConfirmAction({
      type: 'reject',
      product,
      title: t('admin.reject_product_confirmation_title'),
      message: t('admin.reject_product_confirmation_message', { name: product.name }),
      confirmText: t('admin.reject'),
      confirmVariant: 'danger',
      onConfirm: async () => {
        await rejectProduct(product.id);
        setShowConfirmDialog(false);
      }
    });
    setShowConfirmDialog(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCategoryFilter("");
    setVendorFilter("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportProductsData(filteredProducts, 'products-export');
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.manage_products')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.manage_products_description')}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{t('admin.export_products')}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('admin.search_products')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: t('admin.all_statuses') },
              { value: "approved", label: t('admin.approved') },
              { value: "pending", label: t('admin.pending') },
              { value: "rejected", label: t('admin.rejected') }
            ]}
          />

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: "", label: t('admin.all_categories') },
              ...categories.map(category => ({
                value: category.id,
                label: category.name
              }))
            ]}
          />

          {/* Vendor Filter */}
          <Select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            options={[
              { value: "", label: t('admin.all_vendors') },
              ...vendors.map(vendor => ({
                value: vendor.id,
                label: vendor.storeName
              }))
            ]}
          />
        </div>

        {/* Filter Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {t('admin.showing_results', { 
              count: filteredProducts.length, 
              total: products.length 
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center space-x-1"
          >
            <Filter className="w-3 h-3" />
            <span>{t('admin.clear_filters')}</span>
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {currentProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Plus className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredProducts.length === 0 && products.length > 0
                ? t('admin.no_products_with_filters')
                : t('admin.no_products_found')
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {filteredProducts.length === 0 && products.length > 0
                ? t('admin.no_products_with_filters')
                : t('admin.no_products_yet')
              }
            </p>
            {filteredProducts.length === 0 && products.length > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                {t('admin.clear_filters')}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.product')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.vendor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.price')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.stock')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={product.images[0]}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <Plus className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.vendor?.storeName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category?.name || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.stock || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {t(`admin.${product.status || 'pending'}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProduct(product)}
                          className="inline-flex items-center"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('admin.view')}
                        </Button>
                        {product.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveProduct(product)}
                              className="inline-flex items-center"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t('admin.approve')}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectProduct(product)}
                              className="inline-flex items-center"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {t('admin.reject')}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductModal && (
        <ProductDetailModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          confirmVariant={confirmAction.confirmVariant}
        />
      )}
    </div>
  );
};
