import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { supabase } from '@/lib/supabase';

// Mock data as fallback
const MOCK_PRODUCTS = [
  { id: 1, name: "Product 1", price: 99.99, imageUrl: "/product1.jpg" },
  { id: 2, name: "Product 2", price: 149.99, imageUrl: "/product2.jpg" },
  { id: 3, name: "Product 3", price: 79.99, imageUrl: "/product3.jpg" },
  { id: 4, name: "Product 4", price: 199.99, imageUrl: "/product4.jpg" },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Electronics", slug: "electronics", imageUrl: "/electronics.jpg" },
  { id: 2, name: "Fashion", slug: "fashion", imageUrl: "/fashion.jpg" },
  { id: 3, name: "Home & Garden", slug: "home-garden", imageUrl: "/home.jpg" },
  { id: 4, name: "Beauty & Health", slug: "beauty-health", imageUrl: "/beauty.jpg" },
];

const MOCK_VENDORS = [
  { id: 1, name: "Vendor 1", imageUrl: "/vendor1.jpg", rating: 4.8, productCount: 120 },
  { id: 2, name: "Vendor 2", imageUrl: "/vendor2.jpg", rating: 4.7, productCount: 95 },
  { id: 3, name: "Vendor 3", imageUrl: "/vendor3.jpg", rating: 4.9, productCount: 210 },
  { id: 4, name: "Vendor 4", imageUrl: "/vendor4.jpg", rating: 4.6, productCount: 87 },
];

export const HomePage = () => {
  const { t, i18n } = useTranslation('common');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products from Supabase directly instead of using hooks
        try {
          // Fetch featured products
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .limit(8);
            
          if (productsError) throw productsError;
          
          // Fetch categories
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .limit(8);
            
          if (categoriesError) throw categoriesError;
          
          // Use fetched data or fallback to mock data
          setFeaturedProducts(productsData?.length ? productsData : MOCK_PRODUCTS);
          setCategories(categoriesData?.length ? categoriesData : MOCK_CATEGORIES);
        } catch (e) {
          console.error("Failed to fetch data:", e);
          // Fall back to mock data
          setFeaturedProducts(MOCK_PRODUCTS);
          setCategories(MOCK_CATEGORIES);
        }
        
        // Always use mock vendors for now
        setTopVendors(MOCK_VENDORS);
        setLoading(false);
      } catch (err) {
        console.error("Error in HomePage data fetching:", err);
        setError(err);
        setLoading(false);
        
        // Set fallback data
        setFeaturedProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
        setTopVendors(MOCK_VENDORS);
      }
    };
    
    fetchData();
  }, []);

  // For debugging translation issues
  useEffect(() => {
    console.log("Current language:", i18n.language);
    console.log("Available languages:", i18n.languages);
    console.log("Translation test:", t("welcome"));
  }, [i18n.language, t]);

  const handleAddToCart = (productId) => {
    console.log("Add to cart:", productId);
    // This would use CartContext in a real implementation
  };

  const handleAddToWishlist = (productId) => {
    console.log("Add to wishlist:", productId);
  };

  // Component for displaying product card to avoid errors with missing components
  const SimpleProductCard = ({ id, name, price, imageUrl }) => (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <img src={imageUrl || "/product-placeholder.jpg"} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-medium">{name}</h3>
        <p className="text-primary font-semibold mt-2">${price?.toFixed(2)}</p>
        <button 
          className="mt-2 bg-primary text-white px-4 py-2 rounded-md w-full"
          onClick={() => handleAddToCart(id)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Simplified */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("discover_quality_products")}</h1>
          <p className="text-lg md:text-xl mb-8">{t("hero_subtitle")}</p>
          <Link to="/products" className="bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-gray-100">
            {t("shop_now")}
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("featured_products")}</h2>
            <Link to="/products" className="text-primary flex items-center">
              {t("view_all")} <ChevronRight className="h-4 w-4 ml-1" />
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
              {featuredProducts.slice(0, 8).map((product) => (
                <SimpleProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("shop_by_category")}</h2>
            <Link to="/categories" className="text-primary flex items-center">
              {t("all_categories")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <div className="relative overflow-hidden rounded-lg h-40 group">
                  <img
                    src={category.imageUrl || "/category-placeholder.jpg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Vendors */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("top_vendors")}</h2>
            <Link to="/vendors" className="text-primary flex items-center">
              {t("all_vendors")} <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topVendors.map((vendor) => (
              <Link key={vendor.id} to={`/vendor/${vendor.id}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={vendor.imageUrl || "/vendor-placeholder.jpg"}
                      alt={vendor.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{vendor.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                          <svg
                            key={index}
                            className={`w-4 h-4 ${
                              index < Math.floor(vendor.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-gray-600">{vendor.rating}</span>
                      </div>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-600">
                        {vendor.productCount} {t("products")}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">{t("special_offers")}</h2>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold mb-4">{t("special_offer_title")}</h3>
                <p className="text-gray-600 mb-6">{t("special_offer_description")}</p>
                <div>
                  <Button
                    variant="primary"
                    as={Link}
                    to="/products/special-offers"
                  >
                    {t("shop_now")}
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-4">{t('welcome')}</h1>
        <p className="text-lg text-gray-700 mb-8">{t('tagline')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Featured Categories</h2>
            <ul className="space-y-2">
              <li className="text-primary hover:underline cursor-pointer">Electronics</li>
              <li className="text-primary hover:underline cursor-pointer">Fashion</li>
              <li className="text-primary hover:underline cursor-pointer">Home & Garden</li>
              <li className="text-primary hover:underline cursor-pointer">Beauty & Health</li>
            </ul>
          </div>
          
          {/* About section */}
          <div className="bg-white rounded-lg shadow p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4">About Our Marketplace</h2>
            <p className="text-gray-700">
              Welcome to Cameroon's premier online shopping destination, connecting local vendors with customers
              across the country. Discover unique products, support local businesses, and enjoy secure shopping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
