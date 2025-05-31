import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Tag, AlertCircle, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CartItem } from "@/components/cart/CartItem/CartItem";
import { Card } from "@/components/ui/Card";

export const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  const { 
    cartItems, 
    subtotal, 
    tax, 
    shipping, 
    total, 
    isEmpty, 
    applyPromoCode, 
    removePromoCode,
    appliedPromo 
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

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">{t("your_cart_is_empty")}</h2>
          <p className="text-gray-500 mb-8">{t("explore_products_to_add")}</p>
          <Button as={Link} to="/products" variant="primary">
            {t("browse_products")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">{t("your_cart")}</h1>
      
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          
          <Link to="/products" className="flex items-center text-primary mt-8 hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("continue_shopping")}
          </Link>
        </div>

        {/* Order Summary */}
        <div className="mt-8 lg:mt-0">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">{t("order_summary")}</h2>
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="mb-6">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={t("enter_promo_code")}
                  leftIcon={Tag}
                  disabled={isApplyingPromo || !!appliedPromo}
                  className="flex-grow"
                />
                <Button 
                  type="submit" 
                  variant={appliedPromo ? "danger" : "outline"}
                  onClick={appliedPromo ? handleRemovePromo : undefined}
                  disabled={isApplyingPromo || (!promoCode && !appliedPromo)}
                >
                  {appliedPromo ? t("remove") : t("apply")}
                </Button>
              </div>
              
              {promoError && (
                <div className="mt-2 text-red-600 text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}
              
              {promoSuccess && (
                <div className="mt-2 text-green-600 text-sm">
                  {promoSuccess}
                </div>
              )}
              
              {appliedPromo && (
                <div className="mt-2 text-green-600 text-sm">
                  {t("promo_applied")}: {appliedPromo.code}
                </div>
              )}
            </form>
            
            {/* Order Totals */}
            <div className="space-y-2 py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(subtotal)}
                </span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>{t("discount")}</span>
                  <span>
                    -{new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                      minimumFractionDigits: 0
                    }).format(appliedPromo.discountAmount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t("tax")}</span>
                <span>
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(tax)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t("shipping")}</span>
                <span>
                  {shipping > 0 ? new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    minimumFractionDigits: 0
                  }).format(shipping) : t("free")}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>{t("total")}</span>
                  <span>
                    {new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                      minimumFractionDigits: 0
                    }).format(total)}
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              onClick={() => navigate("/checkout")}
              className="w-full mt-4"
            >
              {t("proceed_to_checkout")}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
