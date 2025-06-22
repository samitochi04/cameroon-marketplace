import { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';

export const AddressForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  const { 
    register, 
    control, 
    formState: { errors }, 
    watch, 
    setValue,
    getValues,
  } = useFormContext();
  
  const shippingAddress = watch('shippingAddress');
  
  useEffect(() => {
    if (sameAsShipping) {
      const shippingValues = getValues('shippingAddress');
      Object.keys(shippingValues).forEach(field => {
        setValue(`billingAddress.${field}`, shippingValues[field]);
      });
    }
  }, [shippingAddress, sameAsShipping, setValue, getValues]);
  
  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    setValue('billingAddress.sameAsShipping', checked);
    
    if (checked) {
      const shippingValues = watch('shippingAddress');
      Object.keys(shippingValues).forEach(field => {
        setValue(`billingAddress.${field}`, shippingValues[field]);
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Shipping Address */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('checkout.shipping_address')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('full_name')} <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('shippingAddress.fullName', { 
                required: t('full_name_required') 
              })}
              error={errors.shippingAddress?.fullName?.message}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone_number')} <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('shippingAddress.phoneNumber', { 
                required: t('phone_number_required'),
                pattern: {
                  value: /^[0-9+\s-]{8,15}$/,
                  message: t('invalid_phone_number')
                }
              })}
              error={errors.shippingAddress?.phoneNumber?.message}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('address')} <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('shippingAddress.address', { 
                required: t('address_required') 
              })}
              error={errors.shippingAddress?.address?.message}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('city')} <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('shippingAddress.city', { 
                required: t('city_required') 
              })}
              error={errors.shippingAddress?.city?.message}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.more_info')} <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('shippingAddress.region', {
                required: t('region_required')
              })}
              error={errors.shippingAddress?.region?.message}
            />
          </div>
        </div>
      </div>
      
      {/* Billing Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('checkout.billing_address')}</h2>
          
          <div className="flex items-center">
            <label htmlFor="same-as-shipping" className="mr-2 text-sm">
              {t('checkout.same_as_shipping')}
            </label>
            <Controller
              name="billingAddress.sameAsShipping"
              control={control}
              render={({ field }) => (
                <Switch
                  id="same-as-shipping"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    handleSameAsShippingChange(checked);
                  }}
                />
              )}
            />
          </div>
        </div>
        
        {!sameAsShipping && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('full_name')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('billingAddress.fullName', { 
                  required: !sameAsShipping ? t('full_name_required') : false
                })}
                error={errors.billingAddress?.fullName?.message}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone_number')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('billingAddress.phoneNumber', { 
                  required: !sameAsShipping ? t('phone_number_required') : false,
                  pattern: {
                    value: /^[0-9+\s-]{8,15}$/,
                    message: t('invalid_phone_number')
                  }
                })}
                error={errors.billingAddress?.phoneNumber?.message}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('address')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('billingAddress.address', { 
                  required: !sameAsShipping ? t('address_required') : false
                })}
                error={errors.billingAddress?.address?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('city')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('billingAddress.city', { 
                  required: !sameAsShipping ? t('city_required') : false
                })}
                error={errors.billingAddress?.city?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('region')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('billingAddress.region', {
                  required: !sameAsShipping ? t('region_required') : false
                })}
                error={errors.billingAddress?.region?.message}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
