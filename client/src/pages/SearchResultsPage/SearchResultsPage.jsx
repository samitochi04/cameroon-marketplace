import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FilterIcon, X, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/common/Pagination";

export const SearchResultsPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get('minPrice') || '0', 10),
    max: parseInt(searchParams.get('maxPrice') || '1000', 10)
  });
  const [selectedCategories, setSelectedCategories] = useState(searchParams.get('categories')?.split(',') || []);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Get categories for filtering
  const { categories, loading: categoriesLoading } = useCategories();

  // Products with search filter
  const {
    products,
    loading,
    error,
    totalCount,
    pagination,
    updateFilters,
    changePage
  } = useProducts({
    search: searchQuery,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
    sort: sortBy,
    page: currentPage
  });

  // Update URL when filters change
  const updateURLParams = (newParams) => {
    setSearchParams((prev) => {
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || 
           (Array.isArray(value) && value.length === 0)) {
          prev.delete(key);
        } else {
          prev.set(key, Array.isArray(value) ? value.join(',') : value);
        }
      });
      return prev;
    });
  };

  // Toggle mobile filters
  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    updateFilters({ categories: newCategories.length > 0 ? newCategories : undefined });
    updateURLParams({ categories: newCategories, page: 1 });
    setCurrentPage(1);
  };

  // Handle price change
  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value, 10) };
    setPriceRange(newRange);
    
    updateFilters({
      minPrice: newRange.min > 0 ? newRange.min : undefined,
      maxPrice: newRange.max < 1000 ? newRange.max : undefined,
    });
    
    updateURLParams({
      minPrice: newRange.min > 0 ? newRange.min : undefined,
      maxPrice: newRange.max < 1000 ? newRange.max : undefined,
      page: 1
    });
    
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateFilters({ sort: newSort });
    updateURLParams({ sort: newSort });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    changePage(page);
    updateURLParams({ page });
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      updateFilters({ search: searchInput });
      updateURLParams({ q: searchInput, page: 1 });
      setCurrentPage(1);
    }
  };

  // Handle add to cart
  const handleAddToCart = (productId) => {
    console.log("Add to cart:", productId);
    // This would use CartContext in a real implementation
  };

  // Handle add to wishlist
  const handleAddToWishlist = (productId) => {
    console.log("Add to wishlist:", productId);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 1000 });
    setSelectedCategories([]);
    setSortBy("newest");
    setCurrentPage(1);
    
    // Keep only the search query
    setSearchParams({ q: searchQuery });
    updateFilters({
      search: searchQuery,
      categories: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: "newest",
      page: 1
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {searchQuery ? t("search_results_for", { query: searchQuery }) : t("search_results")}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mb-6">
            <div className="flex gap-2">
              <Input 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("search_products_placeholder")}
                className="flex-1"
                leftIcon={Search}
              />
              <Button type="submit">{t("search")}</Button>
            </div>
          </form>
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categoriesLoading ? (
                    <p className="text-sm text-gray-500">{t("loading")}</p>
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

          {/* Results */}
          <div className="flex-1">
            {/* Results Bar */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-600">
                  {loading ? (
                    t("loading_results")
                  ) : error ? (
                    t("error_loading_results")
                  ) : (
                    `${t("showing")} ${products.length} ${t("of")} ${totalCount || 0} ${t("results")}`
                  )}
                </p>
              </div>

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
            
            {/* Products */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{t("error_loading_results")}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">{t("no_results_found")}</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? t("no_results_for_query", { query: searchQuery })
                    : t("try_different_search")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button as={Link} to="/products" variant="primary">
                    {t("browse_all_products")}
                  </Button>
                  {Object.keys(searchParams).length > 1 && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      {t("clear_filters")}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
                
                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
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
      </div>
    </div>
  );
};
