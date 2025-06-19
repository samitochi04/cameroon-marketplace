import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const WishlistPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    wishlistItems, 
    isLoading, 
    error, 
    removeFromWishlist, 
    refreshWishlist,
    clearWishlist,
    wishlistCount 
  } = useWishlist();
  const { addToCart } = useCart();

  // Refresh wishlist when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    }
  }, [refreshWishlist, isAuthenticated]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle removing item from wishlist
  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  // Handle adding item to cart
  const handleAddToCart = async (item) => {
    await addToCart({
      id: item.product.id,
      vendor_id: item.product.vendor_id,
      name: item.product.name,
      price: item.product.sale_price || item.product.price,
      image: item.product.imageUrl,
      quantity: 1,
      stock_quantity: item.product.stock_quantity
    });
  };

  const handleClearWishlist = async () => {
    if (window.confirm(t('wishlist.confirm_clear_wishlist'))) {
      await clearWishlist();
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('wishlist.please_login')}</h1>
        <p className="text-gray-600 mb-6">{t('wishlist.login_to_view_wishlist')}</p>
        <Button
          onClick={() => navigate('/login')}
          variant="primary"
        >
          {t('auth.login')}
        </Button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">{t("wishlist.your_wishlist")}</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Show empty wishlist
  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('wishlist.empty_wishlist')}</h1>
        <p className="text-gray-600 mb-6">{t('wishlist.discover_and_save')}</p>
        <Button
          as={Link}
          to="/products"
          variant="primary"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          {t('dashboard.start_shopping')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t('wishlist.your_wishlist')}</h1>
          <p className="text-gray-600">
            {t('wishlist.items_count', { count: wishlistCount })}
          </p>
        </div>
        
        {wishlistItems.length > 0 && (
          <Button
            onClick={handleClearWishlist}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('wishlist.clear_wishlist')}
          </Button>
        )}
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <Link to={`/products/${item.product.id}`}>
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform"
                />
              </Link>
              
              {/* Remove from wishlist button */}
              <button
                onClick={() => handleRemove(item.product.id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              >
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              </button>

              {/* Sale badge */}
              {item.product.sale_price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {Math.round((1 - item.product.sale_price / item.product.price) * 100)}% {t('off')}
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2">
                <Link 
                  to={`/products/${item.product.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {item.product.name}
                </Link>
              </h3>

              <div className="mb-3">
                {item.product.sale_price ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.product.sale_price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(item.product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(item.product.price)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="mb-3">
                {item.product.stock_quantity > 0 ? (
                  <span className="text-sm text-green-600 font-medium">
                    {t('wishlist.in_stock')}
                  </span>
                ) : (
                  <span className="text-sm text-red-600 font-medium">
                    {t('wishlist.out_of_stock')}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.product.stock_quantity <= 0}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {t('common.add_to_cart')}
                </Button>
                
                <Button
                  onClick={() => handleRemove(item.product.id)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
