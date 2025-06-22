import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import axios from 'axios'; // Import axios directly
import React from 'react';
import { Truck, Package } from 'lucide-react';

import { ShippingMethod } from '@/components/checkout/ShippingMethod/ShippingMethod';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps/CheckoutSteps';
import { AddressForm } from '@/components/checkout/AddressForm/AddressForm';
import { OrderReview } from '@/components/checkout/OrderReview/OrderReview';
import { PaymentMethod } from '@/components/checkout/PaymentMethod/PaymentMethod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const SHIPPING_PRICES = {
  standard: 0,
  express: 0,
  pickup: 0
};

const STEPS = ['address', 'shipping', 'review', 'payment']; // Add payment step back

export const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();  const [currentStep, setCurrentStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('mtn_mobile_money');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [shippingCost, setShippingCost] = useState(SHIPPING_PRICES.standard); // Default shipping cost

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
    total, 
    isEmpty, 
    clearCart,
    updateShipping,
    shipping
  } = useCart();
  
  const { isAuthenticated, user } = useAuth();

  // Prefill form with user data if available
  useEffect(() => {
    if (user) {
      methods.setValue('shippingAddress.fullName', user.name || '');
      methods.setValue('shippingAddress.phoneNumber', user.phonenumber || '');
      
      // Populate address data if available
      if (user.address) {
        // Try to parse the address if it contains city and region information
        const addressParts = user.address.split(',').map(part => part.trim());
        
        methods.setValue('shippingAddress.address', addressParts[0] || user.address);
        
        // If address has city information (assuming format: street, city, region)
        if (addressParts.length > 1) {
          methods.setValue('shippingAddress.city', addressParts[1]);
        }
        
        // If address has region information
        if (addressParts.length > 2) {
          methods.setValue('shippingAddress.region', addressParts[2]);
        }
      }
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
    // Update shipping cost based on selected method
    const newShippingCost = SHIPPING_PRICES[method] || 0;
    setShippingCost(newShippingCost);

    // Update shipping cost in cart context
    if (typeof updateShipping === 'function') {
      updateShipping(newShippingCost);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  // This function is called when the user clicks "Place Order" on the payment step
  const handlePay = async () => {
    setIsSubmitting(true);
    setOrderError(null);

    const formData = methods.getValues();
    const billingAddress = formData.billingAddress.sameAsShipping
      ? { ...formData.shippingAddress }
      : { ...formData.billingAddress };

    // Check if in development mode
    const isDevelopmentMode = import.meta.env.VITE_DEVELOPMENT_MODE === 'true';

    // Prepare order data for backend
    const orderData = {
      userId: user?.id,
      items: cartItems.map(item => ({
        productId: item.id,
        vendor_id: item.vendor_id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      shippingAddress: formData.shippingAddress,
      billingAddress: billingAddress,
      shippingMethod: shippingMethod,
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      shipping: shipping || 0,
      totalAmount: total
    };

    try {
      console.log('Creating order:', orderData);

      // Get auth token for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data?.success) {
        // Clear cart after successful order creation
        clearCart();
        
        // In development mode, go directly to confirmation
        if (isDevelopmentMode) {
          navigate(`/order-confirmation/${response.data.order.id}`);
        } else {
          // In production mode, redirect to payment page with order ID
          navigate(`/payment/${response.data.order.id}`, {
            state: {
              orderId: response.data.order.id,
              amount: total,
              paymentMethod: paymentMethod,
              customerInfo: formData.shippingAddress
            }
          });
        }
      } else {
        setOrderError(response.data.message || 'Failed to create order.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setOrderError(error.response?.data?.message || t('failed_to_place_order'));
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
            paymentMethod={paymentMethod}
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

  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('checkout.checkout')}</h1>
      
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
                  </Button>                ) : (
                  <Button 
                    variant="primary"
                    onClick={handlePay}
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
            <h2 className="text-xl font-semibold mb-4">{t('checkout.order_summary')}</h2>
            
            <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
              {console.log('cartItems:', JSON.stringify(cartItems, null, 2))}
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
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span>
                  {formatCurrency(subtotal)}
                </span>
              </div>
              
              {/* {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')}</span>
                  <span>
                    -{formatCurrency(appliedPromo.discountAmount)}
                  </span>
                </div>
              )} */}
              
              <div className="flex justify-between">
                <span>{t('shipping')}</span>
                <span className="text-green-600">{t('free')}</span>
                
                {/* Show shipping method name if selected */}
                {shippingMethod && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({shippingMethod === 'express' 
                      ? t('checkout.express_shipping')
                      : shippingMethod === 'pickup'
                      ? t('checkout.store_pickup')
                      : t('checkout.standard_shipping')})
                  </span>
                )}
              </div>
              
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-lg">
                <span>{t('total')}</span>
                <span>
                  {formatCurrency(subtotal + shippingCost )}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};