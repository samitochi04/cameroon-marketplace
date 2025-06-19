import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, Star, ShoppingCart, Share2, Minus, Plus, ChevronLeft, ChevronRight, Check, Copy, Facebook, Twitter, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

export const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { addToCart, user } = useCart();
  const { isAuthenticated } = useAuth();
  const { 
    wishlistItems, 
    addToWishlist, 
    removeFromWishlist, 
    isLoading: wishlistLoading 
  } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Check if product is in wishlist
  const isInWishlist = wishlistItems.some(item => item.productId === id);
  
  // Fetch product data from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              slug
            ),
            vendors (
              id,
              store_name,
              logo_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          setError(t('product_not_found'));
          return;
        }

        // Process images
        let imageArray = [];
        try {
          if (typeof data.images === 'string') {
            imageArray = JSON.parse(data.images);
          } else if (Array.isArray(data.images)) {
            imageArray = data.images;
          }
        } catch (e) {
          console.warn("Error parsing images:", e);
        }

        setProduct({
          ...data,
          imageArray: imageArray.length > 0 ? imageArray : ['/product-placeholder.jpg']
        });

      } catch (err) {
        console.error('Error fetching product:', err);
        setError(t('error_loading_product'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, t]);
  
  useEffect(() => {
    // Reset selected image and quantity when product changes
    setSelectedImage(0);
    setQuantity(1);
  }, [product]);
  
  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category_id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, sale_price, images, slug')
          .eq('category_id', product.category_id)
          .eq('status', 'published')
          .neq('id', product.id)
          .limit(4);

        if (!error && data) {
          const processedProducts = data.map(p => {
            let imageArray = [];
            try {
              if (typeof p.images === 'string') {
                imageArray = JSON.parse(p.images);
              } else if (Array.isArray(p.images)) {
                imageArray = p.images;
              }
            } catch (e) {}
            return {
              ...p,
              imageUrl: imageArray.length > 0 ? imageArray[0] : '/product-placeholder.jpg'
            };
          });
          setRelatedProducts(processedProducts);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    };

    fetchRelatedProducts();
  }, [product]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('product_not_found')}</h1>
        <p className="text-gray-600 mb-6">{error || t('product_not_found_message')}</p>
        <Button as={Link} to="/products" variant="primary">
          {t('back_to_products')}
        </Button>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      vendor_id: product.vendor_id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images[0],
      quantity: quantity,
      stock_quantity: product.stock_quantity
    });
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
  
  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: location.pathname } });
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
      // No need to manually update state - the useWishlist hook handles it
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };
  
  // Handle share functionality
  const handleShare = () => {
    setShowShareModal(true);
  };

  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    return `Check out this product: ${product.name} - ${formatCurrency(product.sale_price || product.price)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const isOwnProduct = user && user.role === 'vendor' && user.id === product?.vendor_id;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-md border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Price */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.sale_price || product.price)}
              </span>
              {product.sale_price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
              {product.sale_price && (
                <Badge variant="error">
                  {Math.round((1 - product.sale_price / product.price) * 100)}% {t('off')}
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.stockQuantity > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">{t('in_stock')}</span>
                  {product.stockQuantity <= 5 && (
                    <span className="text-orange-600 text-sm">
                      {t('only_x_left', { count: product.stockQuantity })}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">{t('out_of_stock')}</span>
                </div>
              )}
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-gray-500 mb-4">
                {t('sku')}: {product.sku}
              </p>
            )}
          </div>

          {/* Quantity and Actions */}
          {!isOwnProduct && (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="font-medium">{t('quantity')}:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stockQuantity}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity <= 0}
                  className="flex-1 flex items-center justify-center"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('common.add_to_cart')}
                </Button>
                
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  size="lg"
                  disabled={wishlistLoading}
                  className="px-4"
                >
                  <Heart 
                    className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="px-4"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Own Product Notice */}
          {isOwnProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">{t('own_product_notice')}</p>
            </div>
          )}

          {/* Vendor Info */}
          {product.vendors && (
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                {product.vendors.logo_url && (
                  <img
                    src={product.vendors.logo_url}
                    alt={product.vendors.store_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{product.vendors.store_name}</p>
                  <Button
                    as={Link}
                    to={`/vendor/${product.vendor_id}`}
                    variant="link"
                    size="sm"
                  >
                    {t('visit_store')}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`product.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">{t('product_description')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || t('no_description_available')}
              </p>
            </div>
          )}
          
          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('specifications')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">{t('category')}:</span>
                  <span className="ml-2">{product.categories?.name || 'N/A'}</span>
                </div>
                {product.weight && (
                  <div>
                    <span className="font-medium">{t('weight')}:</span>
                    <span className="ml-2">{product.weight} kg</span>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="font-medium">{t('dimensions')}:</span>
                    <span className="ml-2">
                      {typeof product.dimensions === 'object' 
                        ? `${product.dimensions.length || 0} x ${product.dimensions.width || 0} x ${product.dimensions.height || 0} cm`
                        : product.dimensions
                      }
                    </span>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <span className="font-medium">{t('sku')}:</span>
                    <span className="ml-2">{product.sku}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('customer_reviews')}</h3>
              <p className="text-gray-500">{t('no_reviews_yet')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('related_products')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Link to={`/products/${relatedProduct.id}`}>
                  <img
                    src={relatedProduct.imageUrl}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform"
                  />
                </Link>
                <div className="p-4">
                  <h3 className="font-medium mb-2">
                    <Link to={`/products/${relatedProduct.id}`} className="hover:text-primary">
                      {relatedProduct.name}
                    </Link>
                  </h3>
                  <div className="text-primary font-semibold">
                    {formatCurrency(relatedProduct.sale_price || relatedProduct.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{t('share_product')}</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Facebook className="w-6 h-6 text-blue-600 mb-1" />
                  <span className="text-xs">Facebook</span>
                </button>
                
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <Twitter className="w-6 h-6 text-blue-400 mb-1" />
                  <span className="text-xs">Twitter</span>
                </button>
                
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <MessageCircle className="w-6 h-6 text-green-600 mb-1" />
                  <span className="text-xs">WhatsApp</span>
                </button>
              </div>
              
              {/* Copy Link */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 p-2 border rounded text-sm bg-gray-50"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              {copySuccess && (
                <p className="text-green-600 text-sm">{t('link_copied')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

