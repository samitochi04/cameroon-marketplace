import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, AlertCircle, Eye, Edit, Trash, Check, X, Download } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useCategories } from "@/hooks/useCategories";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/ui/Badge";
import { ProductDetailModal } from "@/components/admin/modals/ProductDetailModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { exportToCsv } from "@/utils/exportHelpers";

export const ProductsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  // Fetch dependencies from custom hooks
  const { 
    getAllProducts,
    approveProduct,
    rejectProduct,
    deleteProduct,
    getVendorsList,
    loading 
  } = useAdmin();
  
  const { categories } = useCategories();

  // State for products data
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [vendors, setVendors] = useState([]);

  // Load vendors list
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsList = await getVendorsList();
        setVendors(vendorsList);
      } catch (error) {
        console.error("Failed to load vendors:", error);
      }
    };

    fetchVendors();
  }, [getVendorsList]);

  // Load products with filters
  const loadProducts = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
        search: searchQuery || undefined,
      };

      const { data, pagination } = await getAllProducts(filters);
      
      setProducts(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    loadProducts();
  }, [currentPage, statusFilter, categoryFilter, vendorFilter]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  // Handle product approval
  const handleApproveProduct = (product) => {
    setSelectedProduct(product);
    setConfirmAction("approve");
    setIsConfirmDialogOpen(true);
  };

  // Handle product rejection
  const handleRejectProduct = (product) => {
    setSelectedProduct(product);
    setConfirmAction("reject");
    setIsConfirmDialogOpen(true);
  };

  // Handle product deletion
  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setConfirmAction("delete");
    setIsConfirmDialogOpen(true);
  };

  // Confirm dialog action
  const handleConfirmAction = async () => {
    try {
      if (confirmAction === "approve") {
        await approveProduct(selectedProduct.id);
      } else if (confirmAction === "reject") {
        await rejectProduct(selectedProduct.id);
      } else if (confirmAction === "delete") {
        await deleteProduct(selectedProduct.id);
      }
      
      loadProducts();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error(`Failed to ${confirmAction} product:`, error);
    }
  };

  // View product details
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Status badge color variants
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "published":
        return "success";
      case "pending":
        return "warning";
      case "draft":
        return "secondary";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  // Export products to CSV
  const handleExportProducts = () => {
    const dataToExport = products.map(product => ({
      ID: product.id,
      Name: product.name,
      Price: product.price,
      Status: product.status,
      Vendor: product.vendor.name || product.vendor.storeName,
      Category: product.category.name,
      Stock: product.stockQuantity,
      Created: new Date(product.createdAt).toLocaleDateString()
    }));

    exportToCsv(dataToExport, 'products-export');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setVendorFilter("all");
    setCurrentPage(1);
    loadProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("manage_products")}</h1>
          <p className="text-gray-500">{t("manage_products_description")}</p>
        </div>
        <Button
          onClick={handleExportProducts}
          leftIcon={Download}
          variant="outline"
        >
          {t("export_products")}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder={t("search_products")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              icon={Filter}
            >
              <option value="all">{t("all_statuses")}</option>
              <option value="published">{t("published")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="draft">{t("draft")}</option>
              <option value="rejected">{t("rejected")}</option>
            </Select>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{t("all_categories")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            {/* Vendor Filter */}
            <Select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{t("all_vendors")}</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.storeName || vendor.name}
                </option>
              ))}
            </Select>
          </div>
          
          {/* Clear Filters Button */}
          {(statusFilter !== "all" || categoryFilter !== "all" || vendorFilter !== "all" || searchQuery) && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              {t("clear_filters")}
            </Button>
          )}
          
          {/* Search Button (for mobile) */}
          <div className="block lg:hidden">
            <Button
              type="submit"
              onClick={handleSearch}
              leftIcon={Search}
              className="w-full"
            >
              {t("search")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results info */}
      <div>
        <p className="text-sm text-gray-500">
          {t("showing_results", { count: products.length, total: totalCount })}
        </p>
      </div>

      {/* Products Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("no_products_found")}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all" || vendorFilter !== "all"
                ? t("no_products_with_filters")
                : t("no_products_yet")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("product")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("vendor")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("price")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("category")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-100 overflow-hidden">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center bg-gray-200 text-gray-500">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description?.substring(0, 50)}
                            {product.description?.length > 50 ? "..." : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.vendor?.storeName || product.vendor?.name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          maximumFractionDigits: 0
                        }).format(product.price)}
                      </div>
                      {product.salePrice && (
                        <div className="text-xs text-red-600">
                          {new Intl.NumberFormat('fr-CM', {
                            style: 'currency',
                            currency: 'XAF',
                            maximumFractionDigits: 0
                          }).format(product.salePrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {t(product.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category?.name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewProduct(product)}
                          className="text-gray-600 hover:text-gray-900"
                          aria-label={t("view")}
                          title={t("view")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {product.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApproveProduct(product)}
                              className="text-green-600 hover:text-green-800"
                              aria-label={t("approve")}
                              title={t("approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRejectProduct(product)}
                              className="text-red-600 hover:text-red-800"
                              aria-label={t("reject")}
                              title={t("reject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={t("delete")}
                          title={t("delete")}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="py-4 border-t border-gray-200 px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          onProductUpdate={loadProducts}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === "approve"
            ? t("approve_product_title")
            : confirmAction === "reject"
            ? t("reject_product_title")
            : t("delete_product_title")
        }
        message={
          confirmAction === "approve"
            ? t("approve_product_confirmation", { name: selectedProduct?.name })
            : confirmAction === "reject"
            ? t("reject_product_confirmation", { name: selectedProduct?.name })
            : t("delete_product_confirmation", { name: selectedProduct?.name })
        }
        confirmText={
          confirmAction === "approve"
            ? t("approve")
            : confirmAction === "reject"
            ? t("reject")
            : t("delete")
        }
        confirmVariant={
          confirmAction === "approve"
            ? "success"
            : "danger"
        }
      />
    </div>
  );
};
