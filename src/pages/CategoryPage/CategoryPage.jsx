import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, FilterIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/common/Pagination";

export const CategoryPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ 
    min: parseInt(searchParams.get('minPrice') || '0', 10), 
    max: parseInt(searchParams.get('maxPrice') || '1000', 10) 
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "newest");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  
  // Get category data
  const { 
    getCategoryBySlug, 
    getCategoryPath,
    getSubcategories,
    categories,
    loading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();
  
  // Get category object
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Get products
  const { 
    products, 
    totalCount, 
    loading: productsLoading, 
    error: productsError,
    pagination,
    updateFilters,
    changePage
  } = useProducts({
    categorySlug: slug,
    sort: sortBy,
    page: currentPage,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
  });
  
  // Load category data on mount or when slug changes
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        const categoryData = await getCategoryBySlug(slug);
        if (categoryData) {
          setCategory(categoryData);
          
          // Get subcategories
          const subCats = await getSubcategories(categoryData.id);
          setSubcategories(subCats);
          
          // Get breadcrumb path
          const path = await getCategoryPath(categoryData.id);
          setBreadcrumbs(path);
        }
      } catch (error) {
        console.error("Failed to load category data:", error);
      }
    };
    
    loadCategoryData();
  }, [slug, getCategoryBySlug, getSubcategories, getCategoryPath]);
  
  // Toggle filters on mobile
  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    updateFilters({ sort: value });
    setSearchParams(prev => {
      prev.set('sort', value);
      return prev;
    });
  };
  
  // Handle price range change
  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value, 10) };
    setPriceRange(newRange);
    
    // Update URL params and filters
    setSearchParams(prev => {
      if (newRange.min > 0) prev.set('minPrice', newRange.min);
      else prev.delete('minPrice');
      
      if (newRange.max < 1000) prev.set('maxPrice', newRange.max);
      else prev.delete('maxPrice');
      
      return prev;
    });
    
    updateFilters({
      minPrice: newRange.min > 0 ? newRange.min : undefined,
      maxPrice: newRange.max < 1000 ? newRange.max : undefined,
    });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    changePage(page);
    setSearchParams(prev => {
      prev.set('page', page);
      return prev;
    });
  };
  
  // Handle category filter
  const handleSubcategoryClick = (subcategorySlug) => {
    navigate(`/category/${subcategorySlug}`);
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
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
    updateFilters({});
  };

  // Loading state
  if (categoriesLoading && !category) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (categoriesError || !category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{t("category_not_found")}</h1>
        <p className="mb-8">{t("category_not_found_message")}</p>
        <Button as={Link} to="/products" variant="primary">
          {t("browse_all_products")}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary">
            {t("home")}
          </Link>
          <span className="mx-2">›</span>
          <Link to="/products" className="hover:text-primary">
            {t("products")}
          </Link>
          
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <span className="mx-2">›</span>
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.name}</span>
              ) : (
                <Link to={`/category/${crumb.slug}`} className="hover:text-primary">
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
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
              
              {/* Subcategories filter */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t("subcategories")}</h4>
                  <ul className="space-y-2">
                    {subcategories.map(subcat => (
                      <li key={subcat.id}>
                        <button
                          onClick={() => handleSubcategoryClick(subcat.slug)}
                          className="text-gray-700 hover:text-primary hover:underline w-full text-left"
                        >
                          {subcat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-600">
                  {productsLoading ? (
                    t("loading_products")
                  ) : productsError ? (
                    t("error_loading_products")
                  ) : (
                    `${t("showing")} ${products.length} ${t("of")} ${totalCount || 0} ${t("products")}`
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
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : productsError ? (
              <div className="text-center text-red-500 py-8">{t("error_loading_products")}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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
