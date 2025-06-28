import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FilterIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase, useSupabaseRefresh } from '@/lib/supabase';
import { useCart } from "@/context/CartContext";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { useRouteChange } from "@/hooks/useRouteChange";

// Mock data as fallback
const MOCK_PRODUCTS = [
  { id: 1, name: "Product 1", price: 99.99, imageUrl: "/product1.jpg", description: "This is product 1" },
  { id: 2, name: "Product 2", price: 149.99, imageUrl: "/product2.jpg", description: "This is product 2" },
  { id: 3, name: "Product 3", price: 79.99, imageUrl: "/product3.jpg", description: "This is product 3" },
  { id: 4, name: "Product 4", price: 199.99, imageUrl: "/product4.jpg", description: "This is product 4" },
  { id: 5, name: "Product 5", price: 129.99, imageUrl: "/product5.jpg", description: "This is product 5" },
  { id: 6, name: "Product 6", price: 89.99, imageUrl: "/product6.jpg", description: "This is product 6" },
];

export const ProductListPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState("newest");
  const { addToCart } = useCart();
  const { refreshCounter } = useSupabaseRefresh();
  const { hasRouteChanged, pathname } = useRouteChange();

  // Add search query state from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        setLoading(true);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status, description, category_id')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug');

        if (productsError) throw productsError;
        if (categoriesError) throw categoriesError;

        // Process products to extract the first image
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

        setAllProducts(processedProducts.length ? processedProducts : MOCK_PRODUCTS);
        setProducts(processedProducts.length ? processedProducts : MOCK_PRODUCTS);
        setCategories(categoriesData || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setAllProducts(MOCK_PRODUCTS);
        setProducts(MOCK_PRODUCTS);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, [refreshCounter, hasRouteChanged]);

  // Filtering and sorting logic (now includes search)
  useEffect(() => {
    let filtered = allProducts;

    // Filter by search query (case-insensitive, partial match in name or description)
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        product =>
          (product.name && product.name.toLowerCase().includes(q)) ||
          (product.description && product.description.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category_id)
      );
    }

    // Filter by price
    filtered = filtered.filter(product => {
      const price = product.sale_price || product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const priceA = a.sale_price || a.price;
      const priceB = b.sale_price || b.price;
      switch (sortBy) {
        case "price_low":
          return priceA - priceB;
        case "price_high":
          return priceB - priceA;
        case "newest":
        default:
          return 0;
      }
    });

    setProducts(filtered);
  }, [selectedCategories, allProducts, priceRange, sortBy, searchQuery]);

  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);

  const handleAddToCart = (product) => {
    if (!product) return;
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

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: Number(value)
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 1000000 });
    setSortBy("newest");
  };

  // Product Card
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
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{t("common.products")}</h1>
          <Button
            variant="outline"
            className="md:hidden"
            onClick={toggleFilters}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            {t("common.filters")}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <div
            className={`
              fixed md:relative inset-0 bg-white md:bg-transparent z-40 md:z-0
              transform transition-transform duration-300 ease-in-out
              ${
                isFilterOpen
                  ? "translate-x-0"
                  : "-translate-x-full md:translate-x-0"
              }
              w-3/4 md:w-64 p-4 md:p-0
            `}
          >
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="font-bold text-lg">{t("common.filters")}</h2>
              <button onClick={toggleFilters}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white md:shadow-md rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{t("common.filters")}</h3>
                <button 
                  className="text-sm text-primary hover:underline"
                  onClick={clearAllFilters}
                >
                  {t("common.clear_all")}
                </button>
              </div>
              {/* Category filter */}
              <h3 className="font-semibold mb-3">{t("common.categories")}</h3>
              <div className="space-y-2 mb-6">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))
                ) : (
                  <span className="text-gray-400">{t("common.no_categories")}</span>
                )}
              </div>
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
              {/* Sort options */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t("common.sort_by")}</h4>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="newest">{t("common.newest")}</option>
                  <option value="price_low">{t("common.price_low_to_high")}</option>
                  <option value="price_high">{t("common.price_high_to_low")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Overlay for mobile filters */}
          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={toggleFilters}
            ></div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                {t("common.showing")} {products.length} {t("common.products")}
              </span>
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
                </select>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{t("error_loading_products")}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {t("common.no_products_available")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductListPage;