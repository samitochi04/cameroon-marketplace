import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import React from 'react';
import { Truck, Package } from 'lucide-react'; 

import { ShippingMethod } from '@/components/checkout/ShippingMethod/ShippingMethod';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps/CheckoutSteps';
import { AddressForm } from '@/components/checkout/AddressForm/AddressForm';
import { OrderReview } from '@/components/checkout/OrderReview/OrderReview';
import { PaymentMethod } from '@/components/checkout/PaymentMethod/PaymentMethod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const STEPS = ['address', 'shipping', 'review', 'payment'];

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('kora');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      shippingAddress: {
        fullName: '',
        phoneNumber: '',
        address: '',
        city: '',
        region: '',
      },
      billingAddress: {
        sameAsShipping: true,
        fullName: '',
        phoneNumber: '',
        address: '',
        city: '',
        region: '',
      },
    },
  });

  const { 
    cartItems, 
    subtotal, 
    tax, 
    total, 
    isEmpty, 
    shipping, 
    clearCart,
    appliedPromo
  } = useCart();
  
  const { isAuthenticated, user } = useAuth();
  const { post } = useApi();

  // Prefill form with user data if available
  useEffect(() => {
    if (user) {
      methods.setValue('shippingAddress.fullName', user.name || '');
      methods.setValue('shippingAddress.phoneNumber', user.phone || '');
    }
  }, [user, methods]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (isEmpty) {
      navigate('/cart');
    }
  }, [isEmpty, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(current => current + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    try {
      setIsSubmitting(true);
      setOrderError(null);

      const formData = methods.getValues();

      // Extract billing address based on sameAsShipping flag
      const billingAddress = formData.billingAddress.sameAsShipping
        ? { ...formData.shippingAddress }
        : { ...formData.billingAddress };

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress,
        shippingMethod,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        discount: appliedPromo ? appliedPromo.discountAmount : 0,
        promoCode: appliedPromo ? appliedPromo.code : null,
      };

      // Send order to the API
      const response = await post('/orders', orderData);
      
      // Handle payment initiation if needed
      if (paymentMethod === 'kora') {
        // Redirect to payment page with order ID
        navigate(`/payment/${response.data.order.id}`);
      } else {
        // For other payment methods or COD, go to confirmation
        clearCart();
        navigate(`/order-confirmation/${response.data.order.id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderError(
        error.response?.data?.message || t('failed_to_place_order')
      );
      // Scroll to error message
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the current step is valid and can proceed
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Address step
        return methods.formState.isValid;
      case 1: // Shipping step
        return !!shippingMethod;
      case 2: // Review step
        return true;
      case 3: // Payment step
        return !!paymentMethod;
      default:
        return false;
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <AddressForm />;
      case 1:
        return (
          <ShippingMethod 
            selectedMethod={shippingMethod} 
            onSelectMethod={handleShippingMethodChange} 
          />
        );
      case 2:
        return (
          <OrderReview 
            shippingAddress={methods.getValues('shippingAddress')}
            billingAddress={
              methods.getValues('billingAddress.sameAsShipping')
                ? methods.getValues('shippingAddress')
                : methods.getValues('billingAddress')
            }
            shippingMethod={shippingMethod}
          />
        );
      case 3:
        return (
          <PaymentMethod 
            selectedMethod={paymentMethod}
            onSelectMethod={handlePaymentMethodChange}
            total={total}
          />
        );
      default:
        return <div>{t('unknown_step')}</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('checkout')}</h1>
      
      {/* Error message */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {orderError}
        </div>
      )}
      
      {/* Checkout steps */}
      <CheckoutSteps 
        steps={[
          t('address'),
          t('shipping'),
          t('review'),
          t('payment')
        ]} 
        currentStep={currentStep} 
      />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <FormProvider {...methods}>
              {renderStepContent()}
              
              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                {currentStep > 0 && (
                  <Button 
                    variant="outline"
                    onClick={prevStep}
                    disabled={isSubmitting}
                  >
                    {t('back')}
                  </Button>
                )}
                
                {currentStep < STEPS.length - 1 ? (
                  <Button 
                    variant="primary"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="ml-auto"
                  >
                    {t('continue')}
                  </Button>
                ) : (
                  <Button 
                    variant="primary"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !canProceed()}
                    isLoading={isSubmitting}
                    className="ml-auto"
                  >
                    {t('place_order')}
                  </Button>
                )}
              </div>
            </FormProvider>
          </Card>
        </div>
        
        {/* Order summary */}
        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">{t('order_summary')}</h2>
            
            <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    {item.quantity} x {item.name}
                    {item.variant && (
                      <span className="text-gray-500 text-xs block">
                        {Object.values(item.variant).join(', ')}
                      </span>
                    )}
                  </div>
                  <div>
                    {new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                      maximumFractionDigits: 0
                    }).format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span>
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    maximumFractionDigits: 0
                  }).format(subtotal)}
                </span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')}</span>
                  <span>
                    -{new Intl.NumberFormat('fr-CM', {
                      style: 'currency',
                      currency: 'XAF',
                      maximumFractionDigits: 0
                    }).format(appliedPromo.discountAmount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>{t('shipping')}</span>
                <span>
                  {shipping > 0 
                    ? new Intl.NumberFormat('fr-CM', {
                        style: 'currency',
                        currency: 'XAF',
                        maximumFractionDigits: 0
                      }).format(shipping)
                    : t('free')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>{t('tax')}</span>
                <span>
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    maximumFractionDigits: 0
                  }).format(tax)}
                </span>
              </div>
              
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-lg">
                <span>{t('total')}</span>
                <span>
                  {new Intl.NumberFormat('fr-CM', {
                    style: 'currency',
                    currency: 'XAF',
                    maximumFractionDigits: 0
                  }).format(total)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
