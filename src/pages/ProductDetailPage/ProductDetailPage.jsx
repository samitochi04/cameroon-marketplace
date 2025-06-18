import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Star, ShoppingCart, Share2, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";

export const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addToCart, user } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Fetch product data from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // First try to fetch by ID (UUID), then by slug
        let productData = null;
        let productError = null;
        
        // Check if the ID looks like a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUUID) {
          // Try fetching by ID first
          const { data, error } = await supabase
            .from('products')
            .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status, description, category_id')
            .eq('id', id)
            .eq('status', 'published')
            .single();
          
          productData = data;
          productError = error;
        } else {
          // Try fetching by slug
          const { data, error } = await supabase
            .from('products')
            .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status, description, category_id')
            .eq('slug', id)
            .eq('status', 'published')
            .single();
          
          productData = data;
          productError = error;
        }

        if (productError) throw productError;

        if (productData) {
          // Process product images - handle multiple images properly
          let imageArray = [];
          try {
            if (typeof productData.images === 'string') {
              imageArray = JSON.parse(productData.images);
            } else if (Array.isArray(productData.images)) {
              imageArray = productData.images;
            }
          } catch (e) {
            console.warn("Error parsing product images:", e);
          }
          
          // Ensure we have at least one image
          if (!Array.isArray(imageArray) || imageArray.length === 0) {
            imageArray = ["/product-placeholder.jpg"];
          }
          
          const processedProduct = {
            ...productData,
            images: imageArray,
            rating: 4.5, // Default rating
            reviewCount: 0, // Default review count
            stockQuantity: productData.stock_quantity,
            salePrice: productData.sale_price,
            shortDescription: productData.description || 'No description available',
            sku: productData.id, // Use ID as SKU if no SKU field
            specifications: [], // Default empty specifications
            reviews: [] // Default empty reviews
          };

          setProduct(processedProduct);

          // Fetch related products from same category
          if (productData.category_id) {
            const { data: relatedData } = await supabase
              .from('products')
              .select('id, name, price, sale_price, images, stock_quantity, slug, vendor_id, status, description, category_id')
              .eq('category_id', productData.category_id)
              .eq('status', 'published')
              .neq('id', productData.id)
              .limit(4);

            if (relatedData) {
              const processedRelated = relatedData.map(prod => {
                let imgArray = [];
                try {
                  if (typeof prod.images === 'string') {
                    imgArray = JSON.parse(prod.images);
                  } else if (Array.isArray(prod.images)) {
                    imgArray = prod.images;
                  }
                } catch (e) {}
                
                return {
                  ...prod,
                  images: imgArray.length > 0 ? imgArray : ["/product-placeholder.jpg"],
                  stockQuantity: prod.stock_quantity,
                  salePrice: prod.sale_price
                };
              });
              setRelatedProducts(processedRelated);
            }
          }
        } else {
          setError("Product not found");
        }

      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  useEffect(() => {
    // Reset selected image and quantity when product changes
    setSelectedImage(0);
    setQuantity(1);
  }, [product]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{t("product_not_found")}</h2>
        <p className="mb-8">{t("product_not_found_message")}</p>
        <Button as={Link} to="/products" variant="primary">
          {t("back_to_products")}
        </Button>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
      return;
    }

    // Check if vendor is trying to buy their own product
    if (user.role === 'vendor' && user.id === product.vendor_id) {
      toast.error('You cannot purchase your own products');
      return;
    }

    if (product.stock_quantity && quantity > product.stock_quantity) {
      toast.error(`Only ${product.stock_quantity} items available`);
      return;
    }

    addToCart(product, quantity);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // Navigate to next image
  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  // Navigate to previous image
  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };
  
  const isOwnProduct = user && user.role === 'vendor' && user.id === product?.vendor_id;
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">
            {t("common.home")}
          </Link>
          <span className="mx-2">›</span>
          <Link to="/products" className="hover:text-primary">
            {t("common.products")}
          </Link>
          <span className="mx-2">›</span>
          <span className="truncate max-w-[200px]">{product.name}</span>
        </div>
        
        {/* Back Button (Mobile) */}
        <div className="mb-4 md:hidden">
          <Button
            variant="outline"
            size="sm"
            as={Link}
            to="/products"
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("back_to_products")}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 p-4 md:p-8">
            {/* Product Images - Left Column */}
            <div className="lg:col-span-3">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Thumbnails - Show only if more than one image */}
                {product.images.length > 1 && (
                  <div className="order-2 md:order-1 md:w-20 flex md:flex-col gap-2 overflow-auto">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className={`
                          border-2 rounded cursor-pointer flex-shrink-0 w-16 h-16
                          ${selectedImage === index ? 'border-primary' : 'border-transparent'}
                        `}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - view ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/product-placeholder.jpg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Main Image */}
                <div className="order-1 md:order-2 flex-grow">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "/product-placeholder.jpg";
                      }}
                    />
                    
                    {/* Navigation arrows - Show only if more than one image */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image indicator dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                selectedImage === index ? 'bg-primary' : 'bg-white/60'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info - Right Column */}
            <div className="lg:col-span-2">
              <div className="flex flex-col h-full">
                {/* Product Name */}
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.reviewCount} {t("reviews")})
                  </span>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  {product.salePrice ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0
                        }).format(product.salePrice)}
                      </span>
                      <span className="ml-2 text-gray-500 line-through">
                        {new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0
                        }).format(product.price)}
                      </span>
                      <Badge variant="danger" className="ml-2">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% {t("off")}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('fr-CM', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0
                      }).format(product.price)}
                    </span>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="mb-6">
                  {product.stockQuantity > 0 ? (
                    <Badge variant="success">
                      {product.stockQuantity > 10
                        ? t("common.in_stock")
                        : t("only_x_left", { count: product.stockQuantity })}
                    </Badge>
                  ) : (
                    <Badge variant="danger">{t("common.out_of_stock")}</Badge>
                  )}
                </div>
                
                {/* Quantity Selector */}
                {product.stockQuantity > 0 && (
                  <div className="flex items-center mb-6">
                    <span className="text-sm font-medium mr-4">{t("common.quantity")}:</span>
                    <div className="flex border border-gray-300 rounded-md">
                      <button
                        type="button"
                        className="px-3 py-1 border-r border-gray-300 text-gray-600 hover:bg-gray-100"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        className="w-12 text-center border-0 focus:ring-0"
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0 && value <= product.stockQuantity) {
                            setQuantity(value);
                          }
                        }}
                        min="1"
                        max={product.stockQuantity}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 border-l border-gray-300 text-gray-600 hover:bg-gray-100"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stockQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={product.stockQuantity === 0}
                    onClick={handleAddToCart}
                    leftIcon={ShoppingCart}
                  >
                    {t("common.add_to_cart")}
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {product.shortDescription}
                </p>
                
                {/* Product Metadata */}
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">{t("sku")}:</span> {product.sku}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {["description"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-6 inline-flex items-center border-b-2 text-sm font-medium
                    ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {t(tab)}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t("product_description")}</h3>
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts?.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t("related_products")}</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Link to={`/products/${relatedProduct.id}`}>
                    <img 
                      src={relatedProduct.images[0]} 
                      alt={relatedProduct.name} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = "/product-placeholder.jpg";
                      }}
                    />
                  </Link>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 truncate">
                      <Link to={`/products/${relatedProduct.id}`} className="hover:text-primary">
                        {relatedProduct.name}
                      </Link>
                    </h3>
                    <div className="text-primary font-semibold">
                      {relatedProduct.salePrice ? (
                        <>
                          <span>
                            {new Intl.NumberFormat('fr-CM', {
                              style: 'currency',
                              currency: 'XAF',
                              minimumFractionDigits: 0
                            }).format(relatedProduct.salePrice)}
                          </span>
                          <span className="text-gray-500 text-sm line-through ml-2">
                            {new Intl.NumberFormat('fr-CM', {
                              style: 'currency',
                              currency: 'XAF',
                              minimumFractionDigits: 0
                            }).format(relatedProduct.price)}
                          </span>
                        </>
                      ) : (
                        new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0
                        }).format(relatedProduct.price)
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
