import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, FilterIcon, X, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

export const CategoryPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ 
    min: parseInt(searchParams.get('minPrice') || '0', 10), 
    max: parseInt(searchParams.get('maxPrice') || '1000000', 10) 
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "newest");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  
  // State to hold Supabase data
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch data from Supabase (like HomePage.jsx)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id, description');
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Find current category by slug
        let currentCategory = null;
        if (slug) {
          currentCategory = (categoriesData || []).find(cat => cat.slug === slug);
          setCategory(currentCategory || null);
        } else {
          // If no slug, we're showing all categories - this is valid
          setCategory({ id: "all", name: "All Categories", slug: "all", description: "Browse all categories" });
        }

        // Find subcategories
        let subcats = [];
        if (currentCategory) {
          subcats = (categoriesData || []).filter(cat => cat.parent_id === currentCategory.id);
        } else {
          subcats = (categoriesData || []).filter(cat => !cat.parent_id);
        }
        setSubcategories(subcats);

        // Generate breadcrumbs
        const breadcrumbsArray = [];
        if (currentCategory && currentCategory.id !== "all") {
          let current = currentCategory;
          breadcrumbsArray.unshift(current);
          
          while (current.parent_id) {
            const parent = (categoriesData || []).find(cat => cat.id === current.parent_id);
            if (parent) {
              breadcrumbsArray.unshift(parent);
              current = parent;
            } else {
              break;
            }
          }
        }
        setBreadcrumbs(breadcrumbsArray);

        // Fetch products
        let productsQuery = supabase
          .from('products')
          .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status, description, category_id')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (currentCategory && currentCategory.id !== "all") {
          productsQuery = productsQuery.eq('category_id', currentCategory.id);
        }

        const { data: productsData, error: productsError } = await productsQuery;
        if (productsError) throw productsError;

        // Process products to extract images (like HomePage.jsx)
        const processedProducts = (productsData || []).map(product => {
          let imageArray = [];
          try {
            if (typeof product.images === 'string') {
              imageArray = JSON.parse(product.images);
            } else if (Array.isArray(product.images)) {
              imageArray = product.images;
            }
          } catch (e) {}
          const firstImage = Array.isArray(imageArray) && imageArray.length > 0
            ? imageArray[0]
            : "/product-placeholder.jpg";
          return {
            ...product,
            imageUrl: firstImage
          };
        });

        setProducts(processedProducts);
        setTotalCount(processedProducts.length);
        applyFiltersAndSort(processedProducts);

      } catch (err) {
        console.error("Error fetching data:", err);
        setCategories([]);
        setCategory(null);
        setSubcategories([]);
        setProducts([]);
        setFilteredProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug]);
  
  // Apply filters and sorting to products
  const applyFiltersAndSort = (productsList = products) => {
    // Apply price filter
    let filtered = productsList.filter(product => {
      const productPrice = product.sale_price || product.price;
      return productPrice >= priceRange.min && productPrice <= priceRange.max;
    });
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const priceA = a.sale_price || a.price;
      const priceB = b.sale_price || b.price;
      
      switch(sortBy) {
        case "price_low":
          return priceA - priceB;
        case "price_high":
          return priceB - priceA;
        case "rating":
          return b.rating - a.rating;
        case "newest":
        default:
          return 0; // In mock data, we don't have real dates
      }
    });
    
    // Apply pagination
    const pageSize = 4;
    const totalFilteredProducts = filtered.length;
    const pages = Math.ceil(totalFilteredProducts / pageSize);
    
    setTotalPages(pages || 1);
    setTotalCount(totalFilteredProducts);
    
    // Slice for current page
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    setFilteredProducts(filtered.slice(startIndex, endIndex));
  };
  
  // Toggle filters on mobile
  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);
  
  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    setSearchParams(prev => {
      prev.set('sort', value);
      return prev;
    });
    
    // Apply new sort
    applyFiltersAndSort();
  };
  
  // Handle price range change
  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value, 10) };
    setPriceRange(newRange);
    
    // Update URL params
    setSearchParams(prev => {
      if (newRange.min > 0) prev.set('minPrice', newRange.min);
      else prev.delete('minPrice');
      
      if (newRange.max < 1000000) prev.set('maxPrice', newRange.max);
      else prev.delete('maxPrice');
      
      return prev;
    });
    
    // Apply new price filter
    applyFiltersAndSort();
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchParams(prev => {
      prev.set('page', page);
      return prev;
    });
    
    // Re-apply filters for the new page
    applyFiltersAndSort();
  };
  
  // Handle subcategory filter
  const handleSubcategoryClick = (subcategorySlug) => {
    navigate(`/category/${subcategorySlug}`);
  };

  // Handle adding product to cart
  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      vendor_id: product.vendor_id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.imageUrl,
      quantity: 1,
      stock_quantity: product.stock_quantity
    });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 1000000 });
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
    applyFiltersAndSort();
  };

  // Gradient background for categories (like HomePage)
  const getCategoryGradient = (index) => {
    const gradients = [
      "from-primary to-secondary",
      "from-pink-500 to-yellow-500",
      "from-green-400 to-blue-500",
      "from-purple-500 to-indigo-500",
      "from-yellow-400 to-red-500",
      "from-blue-400 to-cyan-500",
      "from-orange-400 to-pink-500",
      "from-teal-400 to-green-500"
    ];
    return gradients[index % gradients.length];
  };

  // Loading state
  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Category not found - only show this if we have a slug but no matching category
  if (!loading && slug && !category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">{t("common.category_not_found")}</h1>
        <p className="mb-8">{t("common.category_not_found_message")}</p>
        <Button as={Link} to="/products" variant="primary">
          {t("common.browse_all_products")}
        </Button>
      </div>
    );
  }

  // Simple Product Card component
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`}>
        <img 
          src={product.imageUrl || "/product-placeholder.jpg"} 
          alt={product.name} 
          className="w-full h-48 object-cover hover:scale-105 transition-transform"
        />
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium">
          <Link to={`/products/${product.id}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="text-primary font-semibold mt-2">
          {product.sale_price
            ? <>
                <span>
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(product.sale_price)}
                </span>
                <span className="text-gray-400 text-sm line-through ml-2">
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(product.price)}
                </span>
              </>
            : new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0
              }).format(product.price)
          }
        </div>
        <div className="flex-1"></div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleAddToCart(product)}
            disabled={product.stock_quantity <= 0}
            className="flex items-center justify-center"
          >
            {t('common.add_to_cart')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            as={Link}
            to={`/products/${product.id}`}
          >
            {t('common.view_details')}
          </Button>
        </div>
      </div>
    </div>
  );

  // A nested component definition inside CategoryPage
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    
    // Add first page
    pages.push(1);
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pages.push("...");
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    
    // Add last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // This is the RETURN for the Pagination component
    return (
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Prev
        </button>
        
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? "bg-primary text-white"
                : page === "..."

                ? "bg-white text-gray-700 cursor-default"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  // This is the RETURN for the main CategoryPage component
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary">
            {t("common.home")}
          </Link>
          <span className="mx-2">›</span>
          <Link to="/categories" className="hover:text-primary">
            {t("common.products")}
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{category?.name || t("common.categories")}</h1>
          {category?.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Categories grid (like HomePage) - Show when no specific category selected */}
        {!slug && (
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.length > 0 ? (
                categories
                  .filter(cat => !cat.parent_id)
                  .map((cat, idx) => (
                    <Link key={cat.id} to={`/category/${cat.slug}`}>
                      <div className={`relative overflow-hidden rounded-lg h-40 group bg-gradient-to-r ${getCategoryGradient(idx)}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <h3 className="text-white text-lg font-semibold">{cat.name}</h3>
                        </div>
                      </div>
                    </Link>
                  ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {t("common.no_categories")}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Products section - Show when a specific category is selected */}
        {slug && (
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
                <h2 className="font-bold text-lg">{t("common.filters")}</h2>
                <button onClick={toggleFilters}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-white shadow-md rounded-md p-4 md:sticky md:top-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{t("common.filters")}</h3>
                  <button 
                    className="text-sm text-primary hover:underline"
                    onClick={clearAllFilters}
                  >
                    {t("common.clear_all")}
                  </button>
                </div>
                
                {/* Subcategories filter */}
                {subcategories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">{t("common.subcategories")}</h4>
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
                  <h4 className="font-medium mb-3">{t("common.price_range")}</h4>
                  <div className="space-y-4">
                    <div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1000000" 
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange("max", e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm mt-2">
                        <div className="flex gap-1 items-center">
                          <span>{t("common.min")}:</span>
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
                          <span>{t("common.max")}:</span>
                          <Input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange("max", e.target.value)}
                            className="w-20 py-1 px-2 text-sm"
                            min={priceRange.min}
                            max="1000000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sort options for mobile only */}
                <div className="md:hidden mb-6">
                  <h4 className="font-medium mb-3">{t("common.sort_by")}</h4>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="newest">{t("common.newest")}</option>
                    <option value="price_low">{t("common.price_low_to_high")}</option>
                    <option value="price_high">{t("common.price_high_to_low")}</option>
                    <option value="rating">{t("common.highest_rating")}</option>
                  </select>
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
                    {loading ? (
                      t("common.loading_products")
                    ) : (
                      `${t("common.showing")} ${filteredProducts.length} ${t("common.of")} ${totalCount || 0} ${t("common.products")}`
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
                    {t("common.filters")}
                  </Button>
                  
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t("common.sort_by")}:</span>
                    <select
                      className="p-2 border border-gray-300 rounded-md text-sm w-40"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="newest">{t("common.newest")}</option>
                      <option value="price_low">{t("common.price_low_to_high")}</option>
                      <option value="price_high">{t("common.price_high_to_low")}</option>
                      <option value="rating">{t("common.highest_rating")}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Products */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium mb-2">{t("common.no_products_found")}</h3>
                  <p className="text-gray-600 mb-6">{t("common.try_different_filters")}</p>
                  <Button variant="primary" onClick={clearAllFilters}>
                    {t("common.clear_all_filters")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
