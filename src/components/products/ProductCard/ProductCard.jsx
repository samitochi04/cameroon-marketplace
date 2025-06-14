import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";

export const ProductCard = ({
  product,
  showVendor = true,
  showRating = true,
  showActions = true,
}) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const discount =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Product image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded">
            -{discount}%
          </div>
        )}

        {/* Action buttons */}
        {showActions && (
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full ${
                isInWishlist(product.id)
                  ? "bg-red-100 text-red-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              } shadow-sm transition-colors`}
              aria-label={
                isInWishlist(product.id)
                  ? t("remove_from_wishlist")
                  : t("add_to_wishlist")
              }
            >
              <Heart
                size={18}
                fill={isInWishlist(product.id) ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={handleAddToCart}
              className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm transition-colors"
              aria-label={t("add_to_cart")}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4">
        {/* Vendor name */}
        {showVendor && product.vendor && (
          <p className="text-xs text-gray-500 mb-1">{product.vendor.name}</p>
        )}

        {/* Product name */}
        <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
          {product.name}
        </h3>

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(product.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                  fill={
                    i < Math.round(product.rating) ? "currentColor" : "none"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center">
          {product.salePrice ? (
            <>
              <span className="font-semibold text-primary">
                {formatPrice(product.salePrice)}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    salePrice: PropTypes.number,
    image: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    vendor: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  showVendor: PropTypes.bool,
  showRating: PropTypes.bool,
  showActions: PropTypes.bool,
};