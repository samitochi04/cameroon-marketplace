import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CartItem } from "@/components/cart/CartItem/CartItem";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

export const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  const { 
    cartItems, 
    subtotal, 
    total, 
    isEmpty, 
    applyPromoCode, 
    removePromoCode,
    appliedPromo,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isCartLoaded,
  } = useCart();

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    
    if (!promoCode) return;
    
    setIsApplyingPromo(true);
    setPromoError("");
    setPromoSuccess("");
    
    try {
      const result = await applyPromoCode(promoCode);
      if (result.success) {
        setPromoSuccess(t("promo_applied_successfully"));
        setPromoCode("");
      } else {
        setPromoError(result.message || t("invalid_promo_code"));
      }
    } catch (error) {
      setPromoError(t("error_applying_promo"));
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoSuccess("");
  };

  // Handle quantity updates
  const handleQuantityUpdate = (productId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    updateCartItemQuantity(productId, newQuantity);
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { redirectTo: "/checkout" } });
    }
  };

  // Empty cart view
  if ((isEmpty && isCartLoaded) || !cartItems.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("cart.empty_cart")}</h2>
          <p className="text-gray-500 mb-8">{t("cart.empty_cart_message")}</p>
          <Button
            as={Link}
            to="/products"
            variant="primary"
            size="lg"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {t("cart.continue_shopping")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">{t("cart.your_cart")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card className="mb-6 overflow-hidden">
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 flex flex-wrap md:flex-nowrap gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={item.image || "/product-placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-lg mb-1">
                      <Link
                        to={`/products/${item.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <div className="text-primary font-semibold mb-3">
                      {new Intl.NumberFormat("fr-CM", {
                        style: "currency",
                        currency: "XAF",
                        minimumFractionDigits: 0,
                      }).format(item.price)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center">
                      <div className="flex items-center border rounded-md">
                        <button
                          className="p-1 px-2 hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleQuantityUpdate(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          className="p-1 px-2 hover:bg-gray-100 transition-colors"
                          onClick={() =>
                            handleQuantityUpdate(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= (item.stock_quantity || 10)}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        className="ml-4 p-1 text-red-500 hover:text-red-700 transition-colors"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="w-full md:w-auto flex-shrink-0 md:text-right mt-3 md:mt-0">
                    <div className="font-bold">
                      {new Intl.NumberFormat("fr-CM", {
                        style: "currency",
                        currency: "XAF",
                        minimumFractionDigits: 0,
                      }).format(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="bg-gray-50 p-4 flex justify-between items-center">
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-700"
                onClick={clearCart}
              >
                {t("cart.clear_cart")}
              </Button>

              <Button
                as={Link}
                to="/products"
                variant="outline"
                leftIcon={ArrowLeft}
              >
                {t("cart.continue_shopping")}
              </Button>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-5">
            <h2 className="text-xl font-bold mb-4">{t("cart.order_summary")}</h2>
            <div className="space-y-3 border-b pb-3 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("cart.subtotal")}</span>
                <span>
                  {new Intl.NumberFormat("fr-CM", {
                    style: "currency",
                    currency: "XAF",
                    minimumFractionDigits: 0,
                  }).format(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t("cart.shipping")}</span>
                <span className="text-green-600">{t("cart.free")}</span>
              </div>
            </div>

            <div className="flex justify-between items-center font-bold text-lg mb-5">
              <span>{t("cart.total")}</span>
              <span>
                {new Intl.NumberFormat("fr-CM", {
                  style: "currency",
                  currency: "XAF",
                  minimumFractionDigits: 0,
                }).format(total)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
            >
              {t("cart.proceed_to_checkout")}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              {t("cart.secure_checkout_message")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
