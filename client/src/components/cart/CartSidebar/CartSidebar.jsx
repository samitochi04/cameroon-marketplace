import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { CartItem } from "@/components/cart/CartItem/CartItem";
import { Button } from "@/components/ui/Button";

export const CartSidebar = () => {
  const { t } = useTranslation();
  const { cartItems, subtotal, total, itemCount, isEmpty } = useCart();
  const { closeSidebar } = useUI();
  
  return (
    <div className="flex flex-col h-full bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-medium flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2" />
          {t("your_cart")} 
          {itemCount > 0 && (
            <span className="ml-1 text-sm text-gray-600">
              ({itemCount} {itemCount === 1 ? t("item") : t("items")})
            </span>
          )}
        </h2>
        <button
          onClick={closeSidebar}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("your_cart_is_empty")}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("looks_like_you_havent_added_anything_yet")}
            </p>
            <Button
              variant="outline"
              onClick={closeSidebar}
              as={Link}
              to="/products"
              className="mt-2"
            >
              {t("browse_products")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                variant="compact" 
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with Totals and Checkout */}
      {!isEmpty && (
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="flex justify-between mb-2 font-medium">
            <span className="text-gray-600">{t("subtotal")}</span>
            <span>
              {new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0
              }).format(subtotal)}
            </span>
          </div>
          
          <div className="flex justify-between mb-4 font-semibold">
            <span>{t("total")}</span>
            <span className="text-lg">
              {new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0
              }).format(total)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              as={Link}
              to="/cart"
              onClick={closeSidebar}
            >
              {t("view_cart")}
            </Button>
            <Button
              variant="primary"
              as={Link}
              to="/checkout"
              onClick={closeSidebar}
            >
              {t("checkout")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
