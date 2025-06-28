import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterIcon, SlidersHorizontal, X, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/common/Pagination";

export const ProductsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  // Add notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success" // success or error
  });
  
  // Get filters from URL
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  
  // Set initial state based on URL params
  useEffect(() => {
    if (category) {
      setSelectedCategories(category.split(","));
    }
    if (minPrice || maxPrice) {
      setPriceRange({ 
        min: minPrice ? parseInt(minPrice, 10) : 0, 
        max: maxPrice ? parseInt(maxPrice, 10) : 1000 
      });
    }
    setSortBy(sort);
    setCurrentPage(page);
  }, [category, minPrice, maxPrice, sort, page]);
  
  // Create filter object for products hook
  const filters = {
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
    search: search || undefined,
    sort: sortBy,
    page: currentPage,
    pageSize: 12,
  };
  
  const { products, loading, error, totalCount, pagination } = useProducts(filters);
  const { categories, loading: categoriesLoading } = useCategories();
  
  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);
  
  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    updateFilters({
      category: newCategories.length > 0 ? newCategories.join(",") : null,
      page: 1 // Reset to first page on filter change
    });
  };
  
  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value, 10) };
    setPriceRange(newRange);
    
    // Debounce this in a real implementation
    updateFilters({
      minPrice: newRange.min > 0 ? newRange.min : null,
      maxPrice: newRange.max < 1000 ? newRange.max : null,
      page: 1 // Reset to first page on filter change
    });
  };
  
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateFilters({ sort: newSort });
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateFilters({ page: newPage });
  };
  
  const updateFilters = (newFilters) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({
      ...current,
      ...newFilters
    });
  };
  
  const handleAddToCart = (productId) => {
    setNotification({
      show: true,
      message: t('product_added_to_cart', 'Produit ajouté au panier avec succès'),
      type: "success"
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
    
    // This would use CartContext in a real implementation
  };

  const handleAddToWishlist = (productId) => {
    setNotification({
      show: true,
      message: t('product_added_to_wishlist', 'Produit ajouté à la liste de souhaits'),
      type: "success"
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000 });
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification component */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 transition-opacity duration-300
          ${notification.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          <div className="flex items-center">
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            )}
            <p>{notification.message}</p>
            <button 
              className="ml-4 text-gray-500 hover:text-gray-700"
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {search ? `${t("search_results_for")} "${search}"` : t("products")}
          </h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="md:hidden"
              onClick={toggleFilters}
              size="sm"
            >
              <FilterIcon className="w-4 h-4 mr-2" />
              {t("filters")}
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-gray-600">{t("sort_by")}:</span>
              <Select
                className="w-40"
                value={sortBy}
                onChange={handleSortChange}
                options={[
                  { value: "newest", label: t("newest") },
                  { value: "price_low", label: t("price_low_to_high") },
                  { value: "price_high", label: t("price_high_to_low") },
                  { value: "rating", label: t("highest_rating") },
                ]}
              />
            </div>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? (
              t("loading_products")
            ) : error ? (
              t("error_loading_products")
            ) : (
              `${t("showing")} ${products.length} ${t("of")} ${totalCount} ${t("products")}`
            )}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Hidden on mobile until toggled */}
          <div
            className={`
              fixed md:relative inset-0 bg-white md:bg-transparent z-40 md:z-0
              transform transition-transform duration-300 ease-in-out
              ${isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
              w-3/4 md:w-64 p-4 md:p-0 overflow-y-auto h-full md:h-auto
            `}
          >
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="font-bold text-lg">{t("filters")}</h2>
              <button onClick={toggleFilters}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white shadow-md rounded-md p-4 md:sticky md:top-4">
              {/* Filter header with clear all button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{t("filters")}</h3>
                <button 
                  className="text-sm text-primary hover:underline"
                  onClick={clearAllFilters}
                >
                  {t("clear_all")}
                </button>
              </div>
              
              {/* Categories filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t("categories")}</h4>
                <div className="space-y-2">
                  {categoriesLoading ? (
                    <p className="text-sm">{t("loading_categories")}</p>
                  ) : (
                    categories.map(category => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Price range filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t("price_range")}</h4>
                <div className="space-y-4">
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1000" 
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm mt-2">
                      <div className="flex gap-1 items-center">
                        <span>{t("min")}:</span>
                        <Input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => handlePriceChange("min", e.target.value)}
                          className="w-20 py-1 px-2 text-sm"
                          min="0"
                          max={priceRange.max}
                        />
                      </div>
                      <div className="flex gap-1 items-center">
                        <span>{t("max")}:</span>
                        <Input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => handlePriceChange("max", e.target.value)}
                          className="w-20 py-1 px-2 text-sm"
                          min={priceRange.min}
                          max="1000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort options for mobile only */}
              <div className="md:hidden mb-6">
                <h4 className="font-medium mb-3">{t("sort_by")}</h4>
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  options={[
                    { value: "newest", label: t("newest") },
                    { value: "price_low", label: t("price_low_to_high") },
                    { value: "price_high", label: t("price_high_to_low") },
                    { value: "rating", label: t("highest_rating") },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Overlay for mobile filters */}
          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={toggleFilters}
            />
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{t("error_loading_products")}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">{t("no_products_found")}</h3>
                <p className="text-gray-600 mb-6">{t("try_different_filters")}</p>
                <Button variant="primary" onClick={clearAllFilters}>
                  {t("clear_all_filters")}
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
