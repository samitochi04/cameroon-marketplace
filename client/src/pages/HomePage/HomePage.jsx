import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from '@/lib/supabase';

// Mock data as fallback
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Mock Product 1",
    price: 10000,
    sale_price: 8000,
    images: '["/mock-image-1.jpg"]',
    stock_quantity: 10,
    slug: "mock-product-1",
    vendor_id: 1,
    status: "published"
  },
  {
    id: 2,
    name: "Mock Product 2",
    price: 15000,
    sale_price: null,
    images: '["/mock-image-2.jpg"]',
    stock_quantity: 5,
    slug: "mock-product-2",
    vendor_id: 2,
    status: "published"
  },
  {
    id: 3,
    name: "Mock Product 3",
    price: 20000,
    sale_price: 18000,
    images: '["/mock-image-3.jpg"]',
    stock_quantity: 0,
    slug: "mock-product-3",
    vendor_id: 3,
    status: "published"
  },
  {
    id: 4,
    name: "Mock Product 4",
    price: 25000,
    sale_price: null,
    images: '["/mock-image-4.jpg"]',
    stock_quantity: 8,
    slug: "mock-product-4",
    vendor_id: 4,
    status: "published"
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Fashion", slug: "fashion" },
  { id: 3, name: "Home & Living", slug: "home-living" },
  { id: 4, name: "Health & Beauty", slug: "health-beauty" },
];

export const HomePage = () => {
  const { t, i18n } = useTranslation('common');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get cart functions from context
  const { addToCart, cartItemsCount } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        try {
          // Fetch featured products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status')
            .eq('is_featured', true)
            .eq('status', 'published')
            .limit(8);
            
          if (productsError) throw productsError;
          
          // Fetch categories
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name, slug')
            .limit(8);
            
          if (categoriesError) throw categoriesError;
          
          // Fetch approved vendors with their banner
          const { data: vendorsData, error: vendorsError } = await supabase
            .from('vendors')
            .select('id, store_name, banner_url, logo_url, store_city, store_country')
            .eq('status', 'approved')
            .order('total_earnings', { ascending: false })
            .limit(4);
            
          if (vendorsError) throw vendorsError;
          
          // Process products to extract the first image
          const processedProducts = productsData.map(product => {
            // Parse images if it's a JSON string
            let imageArray = [];
            try {
              if (typeof product.images === 'string') {
                imageArray = JSON.parse(product.images);
              } else if (Array.isArray(product.images)) {
                imageArray = product.images;
              }
            } catch (e) {
              console.warn("Error parsing images for product:", product.id, e);
            }
            
            // Get first image or use a placeholder
            const firstImage = Array.isArray(imageArray) && imageArray.length > 0
              ? imageArray[0]
              : "/product-placeholder.jpg";
              
            return {
              ...product,
              imageUrl: firstImage
            };
          });
          
          // Use fetched data or fallback to mock data
          setFeaturedProducts(processedProducts?.length ? processedProducts : MOCK_PRODUCTS);
          setCategories(categoriesData?.length ? categoriesData : MOCK_CATEGORIES);
          setTopVendors(vendorsData?.length ? vendorsData : []);
          
        } catch (e) {
          console.error("Failed to fetch data:", e);
          // Fall back to mock data
          setFeaturedProducts(MOCK_PRODUCTS);
          setCategories(MOCK_CATEGORIES);
          setTopVendors([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in HomePage data fetching:", err);
        setError(err);
        setLoading(false);
        
        // Set fallback data
        setFeaturedProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setTopVendors([]);
      }
    };
    
    fetchData();
  }, []);

  // Handle adding product to cart with feedback
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

  // Component for displaying product card
  const ProductCard = ({ product }) => (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img 
            src={product.imageUrl || "/product-placeholder.jpg"} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </Link>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">
          <Link to={`/products/${product.id}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex justify-between items-center">
          <div>
            {product.sale_price ? (
              <>
                <span className="text-primary font-semibold">
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(product.sale_price)}
                </span>
                <span className="text-gray-500 text-sm line-through ml-2">
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(product.price)}
                </span>
              </>
            ) : (
              <span className="text-primary font-semibold">
                {new Intl.NumberFormat('fr-CM', {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 0
                }).format(product.price)}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => handleAddToCart(product)}
            disabled={product.stock_quantity <= 0}
            className="flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {t("common.add_to_cart")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            as={Link}
            to={`/products/${product.id}`}
          >
            {t("common.view_details")}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("home.discover_quality_products")}</h1>
          <p className="text-lg md:text-xl mb-8">{t("home.hero_subtitle")}</p>
          <Link to="/products" className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-gray-100">
            {t("home.shop_now")}
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("home.featured_products")}</h2>
            <Link to="/products" className="text-primary flex items-center">
              {t("home.view_all")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{t("error_loading_products")}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {t("home.no_products_available")}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("home.shop_by_category")}</h2>
            <Link to="/categories" className="text-primary flex items-center">
              {t("home.all_categories")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link key={category.id} to={`/category/${category.slug || category.id}`}>
                  <div className="relative overflow-hidden rounded-lg h-40 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center">
                      <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                {t("home.no_categories_available")}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Vendors */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("home.top_vendors")}</h2>
            <Link to="/vendors" className="text-primary flex items-center">
              {t("home.all_vendors")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topVendors.length > 0 ? (
              topVendors.map((vendor) => (
                <Link key={vendor.id} to={`/vendor/${vendor.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <img
                        src={vendor.banner_url || "/vendor-placeholder.jpg"}
                        alt={vendor.store_name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4 flex items-start">
                      {vendor.logo_url && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm mr-3 flex-shrink-0">
                          <img
                            src={vendor.logo_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{vendor.store_name}</h3>
                        <div className="text-sm text-gray-600">
                          {vendor.store_city && (
                            <span>{vendor.store_city}, {vendor.store_country || 'Cameroon'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                {t("home.no_vendors_available")}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("home.special_offers")}</h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4">{t("home.special_offer_title")}</h3>
                <p className="text-gray-600 mb-6">{t("home.special_offer_description")}</p>
                <div>
                  <Button
                    variant="primary"
                    as={Link}
                    to="/products/special-offers"
                  >
                    {t("home.shop_now")}
                  </Button>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                <img
                  src="/special-offer.jpg"
                  alt="Special offer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart animation effect */}
      <div 
        className="fixed bottom-4 right-4 bg-primary text-white rounded-full p-3 shadow-lg z-50 hover:bg-primary-dark transition-all transform hover:scale-110"
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          animation: cartItemsCount > 0 ? 'pulse 1.5s infinite' : 'none',
        }}
      >
        <Link to="/cart" className="flex items-center">
          <ShoppingCart className="w-6 h-6" />
          {cartItemsCount > 0 && (
            <span className="ml-2 font-bold">{cartItemsCount}</span>
          )}
        </Link>
      </div>

      {/* Add a keyframe animation for the cart pulse effect */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(var(--color-primary-rgb), 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
