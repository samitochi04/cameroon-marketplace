import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVendor } from "@/hooks/useVendor";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/common/Pagination";
import { ProductsTable } from "@/components/vendor/tables/ProductsTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Get vendor products
  const { 
    getVendorProducts, 
    deleteProduct, 
    updateProduct, 
    createLoading,
    updateLoading
  } = useVendor();
  
  // Get categories for filtering
  const { categories } = useCategories();
  
  // Product state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Load products
  const loadProducts = async () => {
    setLoading(true);
    
    try {
      const filters = {
        page: currentPage,
        pageSize: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        categoryId: categoryFilter || undefined,
        search: searchQuery || undefined,
      };
      
      const { products, pagination } = await getVendorProducts(filters);
      
      setProducts(products);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadProducts();
  }, [currentPage, statusFilter, categoryFilter, searchQuery]);
  
  // Create new product
  const handleCreateProduct = () => {
    navigate("/vendor/products/new");
  };
  
  // Edit product
  const handleEditProduct = (productId) => {
    navigate(`/vendor/products/edit/${productId}`);
  };
  
  // Delete product
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setConfirmDelete(true);
  };
  
  const confirmProductDelete = async () => {
    if (selectedProduct) {
      try {
        await deleteProduct(selectedProduct.id);
        loadProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
      } finally {
        setSelectedProduct(null);
        setConfirmDelete(false);
      }
    }
  };
  
  // Update product status
  const handleStatusChange = async (productId, status) => {
    try {
      await updateProduct(productId, { status });
      loadProducts();
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("vendor_products")}</h1>
          <p className="text-gray-500">{t("manage_your_products")}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            variant="primary"
            onClick={handleCreateProduct}
            leftIcon={Plus}
          >
            {t("add_new_product")}
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder={t("search_products")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </form>
          
          {/* Status filter */}
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: t("all_statuses") },
                { value: "draft", label: t("draft") },
                { value: "published", label: t("published") },
                { value: "archived", label: t("archived") },
              ]}
              placeholder={t("filter_by_status")}
            />
          </div>
          
          {/* Category filter */}
          <div className="w-full md:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: "", label: t("all_categories") },
                ...categories.map(cat => ({
                  value: cat.id,
                  label: cat.name
                }))
              ]}
              placeholder={t("filter_by_category")}
            />
          </div>
        </div>
      </Card>
      
      {/* Products table */}
      <Card>
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
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {searchQuery || statusFilter !== "all" || categoryFilter
                ? t("no_products_with_filters")
                : t("no_products_yet")}
            </p>
            <Button
              variant="primary"
              onClick={handleCreateProduct}
              leftIcon={Plus}
            >
              {t("add_new_product")}
            </Button>
          </div>
        ) : (
          <>
            <ProductsTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              onStatusChange={handleStatusChange}
            />
            
            {totalPages > 1 && (
              <div className="flex justify-center p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmProductDelete}
        title={t("delete_product")}
        description={t("delete_product_confirmation", { productName: selectedProduct?.name })}
        confirmText={t("delete")}
        confirmVariant="danger"
      />
    </div>
  );
};
