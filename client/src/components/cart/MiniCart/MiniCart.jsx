import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const MiniCart = () => {
  const { t } = useTranslation();
  const { cartItems, itemCount, total, isEmpty } = useCart();
  const { openSidebar } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleCartIconClick = (e) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      // On mobile, open the full cart sidebar
      openSidebar("cart");
    } else {
      // On desktop, toggle the dropdown
      setIsOpen(!isOpen);
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon and Badge */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
        onClick={handleCartIconClick}
        aria-label={t("cart")}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 p-0 text-xs"
            variant="primary"
          >
            {itemCount}
          </Badge>
        )}
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">
                {t("your_cart")} ({itemCount})
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">{t("close")}</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {isEmpty ? (
              <div className="text-center py-6">
                <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">{t("your_cart_is_empty")}</p>
              </div>
            ) : (
              <>
                {/* Cart Items Preview */}
                <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center py-2 border-b border-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-12 w-12 rounded-md object-cover flex-shrink-0" 
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {t("qty")}: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {cartItems.length > 3 && (
                    <div className="text-center text-xs text-gray-500 py-1">
                      {t("and_n_more_items", { count: cartItems.length - 3 })}
                    </div>
                  )}
                </div>
                
                {/* Cart Total and Actions */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{t("total")}</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      as={Link}
                      to="/cart"
                      onClick={() => setIsOpen(false)}
                      className="text-sm"
                    >
                      {t("view_cart")}
                    </Button>
                    <Button
                      variant="primary"
                      as={Link}
                      to="/checkout"
                      onClick={() => setIsOpen(false)}
                      className="text-sm"
                    >
                      {t("checkout")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
