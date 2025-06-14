import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, FilterIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Mock data for categories
const MOCK_CATEGORIES = {
  "electronics": {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Explore our range of electronics and gadgets",
    imageUrl: "/electronics.jpg",
    parentId: null
  },
  "smartphones": {
    id: "smartphones",
    name: "Smartphones",
    slug: "smartphones",
    description: "Latest smartphones and accessories",
    imageUrl: "/smartphones.jpg",
    parentId: "electronics"
  },
  "laptops": {
    id: "laptops",
    name: "Laptops",
    slug: "laptops",
    description: "Powerful laptops for work and play",
    imageUrl: "/laptops.jpg",
    parentId: "electronics"
  },
  "clothing": {
    id: "clothing",
    name: "Clothing",
    slug: "clothing",
    description: "Fashion for everyone",
    imageUrl: "/clothing.jpg",
    parentId: null
  },
  "mens-clothing": {
    id: "mens-clothing",
    name: "Men's Clothing",
    slug: "mens-clothing",
    description: "Men's fashion and accessories",
    imageUrl: "/mens-clothing.jpg",
    parentId: "clothing"
  },
  "womens-clothing": {
    id: "womens-clothing",
    name: "Women's Clothing",
    slug: "womens-clothing",
    description: "Women's fashion and accessories",
    imageUrl: "/womens-clothing.jpg",
    parentId: "clothing"
  }
};

// Mock products data
const MOCK_PRODUCTS = [
  {
    id: "p1",
    name: "iPhone 15 Pro",
    slug: "iphone-15-pro",
    price: 999.99,
    salePrice: 899.99,
    imageUrl: "https://placehold.co/300x300?text=iPhone+15",
    categoryId: "smartphones",
    rating: 4.8,
    stockQuantity: 15,
    description: "The latest iPhone with amazing features",
    vendor: { name: "Apple Store" }
  },
  {
    id: "p2",
    name: "Samsung Galaxy S24",
    slug: "samsung-galaxy-s24",
    price: 899.99,
    salePrice: null,
    imageUrl: "https://placehold.co/300x300?text=Galaxy+S24",
    categoryId: "smartphones",
    rating: 4.7,
    stockQuantity: 20,
    description: "Powerful Android smartphone",
    vendor: { name: "Samsung Electronics" }
  },
  {
    id: "p3",
    name: "MacBook Pro 14\"",
    slug: "macbook-pro-14",
    price: 1999.99,
    salePrice: 1799.99,
    imageUrl: "https://placehold.co/300x300?text=MacBook+Pro",
    categoryId: "laptops",
    rating: 4.9,
    stockQuantity: 8,
    description: "Powerful laptop for professionals",
    vendor: { name: "Apple Store" }
  },
  {
    id: "p4",
    name: "Dell XPS 13",
    slug: "dell-xps-13",
    price: 1299.99,
    salePrice: null,
    imageUrl: "https://placehold.co/300x300?text=Dell+XPS",
    categoryId: "laptops",
    rating: 4.6,
    stockQuantity: 12,
    description: "Lightweight and powerful Windows laptop",
    vendor: { name: "Dell Technologies" }
  },
  {
    id: "p5",
    name: "Men's Casual T-Shirt",
    slug: "mens-casual-tshirt",
    price: 29.99,
    salePrice: 19.99,
    imageUrl: "https://placehold.co/300x300?text=Men's+T-Shirt",
    categoryId: "mens-clothing",
    rating: 4.3,
    stockQuantity: 50,
    description: "Comfortable cotton t-shirt for everyday wear",
    vendor: { name: "Fashion Hub" }
  },
  {
    id: "p6",
    name: "Women's Summer Dress",
    slug: "womens-summer-dress",
    price: 59.99,
    salePrice: 49.99,
    imageUrl: "https://placehold.co/300x300?text=Women's+Dress",
    categoryId: "womens-clothing",
    rating: 4.5,
    stockQuantity: 35,
    description: "Elegant summer dress perfect for any occasion",
    vendor: { name: "Fashion Hub" }
  }
];

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
  
  // State to hold mock data
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Get category data from mock data
  useEffect(() => {
    const loadMockData = () => {
      // Simulate loading
      setLoading(true);
      
      console.log("Current slug:", slug);
      console.log("Available categories:", Object.keys(MOCK_CATEGORIES));
      
      // If no slug is provided, show all categories
      if (!slug) {
        // Set a flag to indicate we're showing all categories
        setCategory({ id: "all", name: "All Categories", slug: "all", description: "Browse all categories" });
        
        // Set all main categories (those without parents) as subcategories
        const mainCategories = Object.values(MOCK_CATEGORIES).filter(cat => cat.parentId === null);
        setSubcategories(mainCategories);
        
        // No need for breadcrumbs when showing all categories
        setBreadcrumbs([]);
        
        // Show all products
        const allProducts = MOCK_PRODUCTS;
        setProducts(allProducts);
        setTotalCount(allProducts.length);
        
        // Apply filters and sorting
        applyFiltersAndSort(allProducts);
        
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
        return;
      }
      
      // Get category by slug
      const currentCategory = MOCK_CATEGORIES[slug] || null;
      console.log("Found category:", currentCategory);
      setCategory(currentCategory);
      
      if (currentCategory) {
        // Get subcategories
        const subs = Object.values(MOCK_CATEGORIES).filter(cat => 
          cat.parentId === currentCategory.id
        );
        console.log("Found subcategories:", subs);
        setSubcategories(subs);
        
        // Generate breadcrumbs
        const breadcrumbsArray = [];
        let current = currentCategory;
        
        // Add current category
        breadcrumbsArray.unshift(current);
        
        // Add parent categories
        while (current.parentId) {
          const parent = MOCK_CATEGORIES[current.parentId];
          if (parent) {
            breadcrumbsArray.unshift(parent);
            current = parent;
          } else {
            break;
          }
        }
        
        setBreadcrumbs(breadcrumbsArray);
        
        // Get products for this category
        const categoryProducts = MOCK_PRODUCTS.filter(product => 
          product.categoryId === currentCategory.id
        );
        console.log("Found products:", categoryProducts);
        setProducts(categoryProducts);
        setTotalCount(categoryProducts.length);
        
        // Apply filters and sorting
        applyFiltersAndSort(categoryProducts);
      }
      
      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    
    loadMockData();
  }, [slug]);
  
  // Apply filters and sorting to products
  const applyFiltersAndSort = (productsList = products) => {
    // Apply price filter
    let filtered = productsList.filter(product => {
      const productPrice = product.salePrice || product.price;
      return productPrice >= priceRange.min && productPrice <= priceRange.max;
    });
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;
      
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
      
      if (newRange.max < 1000) prev.set('maxPrice', newRange.max);
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
    applyFiltersAndSort();
  };

  // Loading state
  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Category not found
  if (!category) {
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={product.imageUrl || "https://placehold.co/300x300?text=Product"} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        {product.salePrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sale
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.vendor.name}</p>
        
        <div className="flex items-center mb-2">
          <div className="flex">
            {[1,2,3,4,5].map(star => (
              <svg 
                key={star}
                className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-yellow-400" : "text-gray-300"}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {product.salePrice ? (
              <div>
                <span className="text-red-500 font-bold">${product.salePrice}</span>
                <span className="text-gray-400 text-sm line-through ml-2">${product.price}</span>
              </div>
            ) : (
              <span className="text-gray-900 font-bold">${product.price}</span>
            )}
          </div>
          <button 
            onClick={() => handleAddToCart(product.id)}
            className="bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-dark transition-colors"
          >
            Add
          </button>
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
            {t("common.home") || "Home"}
          </Link>
          <span className="mx-2">›</span>
          <Link to="/categories" className="hover:text-primary">
            {t("common.products") || "Products"}
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{category?.name}</h1>
          {category?.description && (
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
              <h2 className="font-bold text-lg">{t("filters") || "Filters"}</h2>
              <button onClick={toggleFilters}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white shadow-md rounded-md p-4 md:sticky md:top-4">
              {/* Filter header with clear all button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{t("filters") || "Filters"}</h3>
                <button 
                  className="text-sm text-primary hover:underline"
                  onClick={clearAllFilters}
                >
                  {t("clear_all") || "Clear All"}
                </button>
              </div>
              
              {/* Subcategories filter */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t("subcategories") || "Subcategories"}</h4>
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
                <h4 className="font-medium mb-3">{t("price_range") || "Price Range"}</h4>
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
                        <span>{t("min") || "Min"}:</span>
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
                        <span>{t("max") || "Max"}:</span>
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
                <h4 className="font-medium mb-3">{t("sort_by") || "Sort By"}</h4>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="newest">{t("newest") || "Newest"}</option>
                  <option value="price_low">{t("price_low_to_high") || "Price: Low to High"}</option>
                  <option value="price_high">{t("price_high_to_low") || "Price: High to Low"}</option>
                  <option value="rating">{t("highest_rating") || "Highest Rating"}</option>
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
                    t("loading_products") || "Loading products..."
                  ) : (
                    `${t("showing") || "Showing"} ${filteredProducts.length} ${t("of") || "of"} ${totalCount || 0} ${t("products") || "products"}`
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
                  {t("filters") || "Filters"}
                </Button>
                
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t("sort_by") || "Sort by"}:</span>
                  <select
                    className="p-2 border border-gray-300 rounded-md text-sm w-40"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="newest">{t("newest") || "Newest"}</option>
                    <option value="price_low">{t("price_low_to_high") || "Price: Low to High"}</option>
                    <option value="price_high">{t("price_high_to_low") || "Price: High to Low"}</option>
                    <option value="rating">{t("highest_rating") || "Highest Rating"}</option>
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
                <h3 className="text-lg font-medium mb-2">{t("no_products_found") || "No products found"}</h3>
                <p className="text-gray-600 mb-6">{t("try_different_filters") || "Try different filters"}</p>
                <Button variant="primary" onClick={clearAllFilters}>
                  {t("clear_all_filters") || "Clear All Filters"}
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
      </div>
    </div>
  );
};
