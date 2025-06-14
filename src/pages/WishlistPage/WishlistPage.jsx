import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Heart, ChevronLeft, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const WishlistPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { 
    wishlistItems, 
    isLoading, 
    error, 
    removeFromWishlist, 
    refreshWishlist 
  } = useWishlist();
  const { addToCart } = useCart();

  // Refresh wishlist when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    }
  }, [refreshWishlist, isAuthenticated]);

  // Handle removing item from wishlist
  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  // Handle adding item to cart
  const handleAddToCart = async (item) => {
    await addToCart({
      id: item.product.id,
      name: item.product.name,
      price: item.product.salePrice || item.product.price,
      image: item.product.imageUrl,
      quantity: 1
    });
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            {t("wishlist.please_login")}
          </h2>
          <p className="text-gray-500 mb-8">
            {t("wishlist.login_to_view_wishlist")}
          </p>
          <Button as={Link} to="/login" variant="primary">
            {t("auth.login")}
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">{t("wishlist.your_wishlist")}</h1>
        <div className="flex justify-center py-12">
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">{t("wishlist.your_wishlist")}</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            {t("wishlist.empty_wishlist")}
          </h2>
          <p className="text-gray-500 mb-8">{t("wishlist.discover_and_save")}</p>
          <Button as={Link} to="/products" variant="primary">
            {t("common.browse_products")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">{t("wishlist.your_wishlist")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-w-1 aspect-h-1">
              <Link to={`/products/${item.product?.slug || item.productId}`}>
                <img
                  src={item.product?.imageUrl || "https://placehold.co/400x400?text=Product"}
                  alt={item.product?.name || "Product"}
                  className="w-full h-48 object-cover"
                />
              </Link>
            </div>
            <div className="p-4">
              <Link to={`/products/${item.product?.slug || item.productId}`} className="block">
                <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-primary">
                  {item.product?.name || "Product"}
                </h3>
              </Link>
              <div className="flex items-center justify-between mb-4">
                <div>
                  {item.product?.salePrice ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-primary">
                        ${item.product.salePrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${item.product.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold">
                      ${item.product?.price || "N/A"}
                    </span>
                  )}
                </div>
                <div>
                  {item.product?.stockQuantity > 0 ? (
                    <span className="text-sm text-green-600">
                      {t("wishlist.in_stock")}
                    </span>
                  ) : (
                    <span className="text-sm text-red-600">
                      {t("wishlist.out_of_stock")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.product?.stockQuantity || item.product?.stockQuantity <= 0}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t("common.add_to_cart")}
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center justify-center"
                  onClick={() => handleRemove(item.productId)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <Link to="/products" className="flex items-center text-primary hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("common.continue_shopping")}
        </Link>
      </div>
    </div>
  );
};

export default WishlistPage;
