import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

export const VendorStorePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("products");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("");
  
  // State for vendor and products data
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch vendor data from Supabase
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        
        // Fetch vendor data - exactly like HomePage.jsx
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id, store_name, description, banner_url, logo_url, store_city, store_country, created_at, status')
          .eq('id', id)
          .eq('status', 'approved')
          .single();

        if (vendorError) {
          console.error("Vendor fetch error:", vendorError);
          throw vendorError;
        }

        if (vendorData) {
          // Process vendor data exactly like HomePage.jsx
          setVendor({
            id: vendorData.id,
            storeName: vendorData.store_name,
            description: vendorData.description || 'Quality products from a trusted vendor',
            logoUrl: vendorData.logo_url || "/vendor-placeholder.jpg",
            bannerUrl: vendorData.banner_url || "/vendor-banner-placeholder.jpg",
            location: vendorData.store_city ? `${vendorData.store_city}, ${vendorData.store_country || 'Cameroon'}` : 'Cameroon',
            joinDate: vendorData.created_at,
            rating: 4.5, // Default rating
            reviewCount: 0, // Default review count
            productCount: 0, // Will be updated when products are fetched
          });
        } else {
          setError("Vendor not found");
        }

      } catch (err) {
        console.error("Error fetching vendor:", err);
        setError(err.message || "Failed to fetch vendor");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id]);

  // Fetch vendor products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!vendor?.id) return;
      
      try {
        setProductsLoading(true);
        
        // Fetch products for this vendor - exactly like HomePage.jsx
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status, description, category_id')
          .eq('vendor_id', vendor.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error("Products fetch error:", productsError);
          throw productsError;
        }

        // Process products to extract images - exactly like HomePage.jsx
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
        
        // Update vendor product count
        setVendor(prev => prev ? { ...prev, productCount: processedProducts.length } : null);

      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [vendor?.id]);

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

  // Product Card Component
  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={product.imageUrl || "/product-placeholder.jpg"} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
        {product.sale_price && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sale
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        <div className="text-primary font-semibold mt-2">
          {product.sale_price ? (
            <>
              <span>
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
            new Intl.NumberFormat('fr-CM', {
              style: 'currency',
              currency: 'XAF',
              minimumFractionDigits: 0
            }).format(product.price)
          )}
        </div>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{t("vendors.vendor_not_found")}</h2>
        <p className="mb-8">{t("vendors.vendor_not_found_message")}</p>
        <Button as={Link} to="/vendors" variant="primary">
          {t("vendors.browse_vendors")}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Store Header/Banner */}
      <div className="relative h-64 md:h-80 w-full bg-gray-200 overflow-hidden">
        {vendor.bannerUrl ? (
          <img
            src={vendor.bannerUrl}
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Store Info */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-6 md:pb-8 flex flex-col md:flex-row items-center md:items-end gap-4">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg -mt-12 md:mt-0">
              <img
                src={vendor.logoUrl || "/vendor-placeholder.jpg"}
                alt={vendor.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-center md:text-left text-white flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{vendor.storeName}</h1>
              
              {/* Rating */}
              <div className="flex items-center justify-center md:justify-start mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(vendor.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-none text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm">
                  ({vendor.reviewCount} {t("reviews")})
                </span>
              </div>
              
              <p className="hidden md:block text-sm md:text-base max-w-xl">
                {vendor.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Description (Mobile) */}
      <div className="md:hidden container mx-auto px-4 py-4">
        <p className="text-sm text-gray-600">{vendor.description}</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "products"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("products")}
            >
              {t("common.products")}
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "about"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("about")}
            >
              {t("about")}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold">{t("common.products")}</h2>
                <Badge variant="secondary">
                  {vendor.productCount} {t("common.products")}
                </Badge>
              </div>
            </div>
            
            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">{t("common.no_products_found")}</h3>
                <p className="text-gray-600 mb-6">{t("vendor_no_products")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* About Tab */}
        {activeTab === "about" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">{t("about_store")}</h3>
            <p className="text-gray-600 mb-6">{vendor.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Info */}
              <div>
                <h4 className="font-medium mb-4">{t("store_information")}</h4>
                <ul className="space-y-3">
                  {vendor.location && (
                    <li className="flex">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{vendor.location}</span>
                    </li>
                  )}
                  {vendor.joinDate && (
                    <li className="flex">
                      <Clock className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">
                        {t("member_since")} {new Date(vendor.joinDate).getFullYear()}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorStorePage;

