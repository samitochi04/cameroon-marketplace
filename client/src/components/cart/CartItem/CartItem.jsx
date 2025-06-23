import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Trash, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

export const CartItem = ({ item, variant = "default" }) => {
  const { t } = useTranslation();
  const { updateQuantity, removeItem } = useCart();
  const isCompact = variant === "compact";
  
  const handleQuantityChange = (amount) => {
    const newQuantity = item.quantity + amount;
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };
  
  const handleRemove = () => {
    removeItem(item.id);
  };
  
  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Calculate item total
  const itemTotal = item.price * item.quantity;
  
  return (
    <div className={`flex ${isCompact ? 'py-2' : 'p-4 border border-gray-200 rounded-md'}`}>
      {/* Product Image */}
      <Link to={`/products/${item.slug}`} className="flex-shrink-0">
        <img 
          src={item.image} 
          alt={item.name}
          className={`rounded-md object-cover ${isCompact ? 'h-16 w-16' : 'h-24 w-24'}`}
        />
      </Link>
      
      {/* Product Details */}
      <div className="flex-1 ml-4">
        <div className="flex justify-between">
          {/* Title and Vendor */}
          <div className="flex-1">
            <Link 
              to={`/products/${item.slug}`} 
              className={`text-gray-900 font-medium ${isCompact ? 'text-sm line-clamp-1' : 'line-clamp-2'}`}
            >
              {item.name}
            </Link>
            {!isCompact && (
              <div className="text-sm text-gray-500 mt-1">
                {t("sold_by")}: {item.vendor.name}
              </div>
            )}
            {item.variant && (
              <div className="text-xs text-gray-500 mt-1">
                {Object.entries(item.variant).map(([key, value]) => (
                  <span key={key} className="mr-2">
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className={`font-medium ${isCompact ? 'text-sm' : ''}`}>
              {formatPrice(item.price)}
            </div>
            
            {/* Item total price if not compact */}
            {!isCompact && item.quantity > 1 && (
              <div className="text-sm text-gray-600 mt-1">
                {t("total")}: {formatPrice(itemTotal)}
              </div>
            )}
          </div>
        </div>
        
        {/* Quantity Control and Remove */}
        <div className={`flex items-center justify-between ${isCompact ? 'mt-2' : 'mt-4'}`}>
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(-1)}
              className={`p-1 rounded-full border ${isCompact ? 'border-gray-200' : 'border-gray-300'} hover:bg-gray-100`}
              aria-label={t("decrease_quantity")}
            >
              <Minus className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-600`} />
            </button>
            <span className={`mx-2 font-medium ${isCompact ? 'text-sm' : ''}`}>
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className={`p-1 rounded-full border ${isCompact ? 'border-gray-200' : 'border-gray-300'} hover:bg-gray-100`}
              aria-label={t("increase_quantity")}
            >
              <Plus className={`${isCompact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-600`} />
            </button>
          </div>
          
          <Button
            variant="ghost"
            size={isCompact ? "sm" : "md"}
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            title={t("remove")}
            aria-label={t("remove_item")}
          >
            <Trash className={`${isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
            {!isCompact && <span className="ml-1">{t("remove")}</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
