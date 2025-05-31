import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';

// List of regions in Cameroon
const REGIONS = [
  'Adamaoua',
  'Centre',
  'East',
  'Far North',
  'Littoral',
  'North',
  'Northwest',
  'South',
  'Southwest',
  'West'
];

export const AddressForm = () => {
  const { t } = useTranslation();
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  const { 
    register, 
    control, 
    formState: { errors }, 
    watch, 
    setValue,
  } = useFormContext();
  
  // Toggle same as shipping
  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    setValue('billingAddress.sameAsShipping', checked);
    
    if (checked) {
      // Copy shipping address values to billing address
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
        <h2 className="text-xl font-semibold mb-4">{t('shipping_address')}</h2>
        
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
              {t('region')} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="shippingAddress.region"
              control={control}
              rules={{ required: t('region_required') }}
              render={({ field }) => (
                <Select
                  {...field}
                  error={errors.shippingAddress?.region?.message}
                >
                  <option value="">{t('select_region')}</option>
                  {REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </Select>
              )}
            />
          </div>
        </div>
      </div>
      
      {/* Billing Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('billing_address')}</h2>
          
          <div className="flex items-center">
            <label htmlFor="same-as-shipping" className="mr-2 text-sm">
              {t('same_as_shipping')}
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
        
        {/* Show billing address fields only if not same as shipping */}
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
              <Controller
                name="billingAddress.region"
                control={control}
                rules={{ required: !sameAsShipping ? t('region_required') : false }}
                render={({ field }) => (
                  <Select
                    {...field}
                    error={errors.billingAddress?.region?.message}
                  >
                    <option value="">{t('select_region')}</option>
                    {REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </Select>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
