import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Package, User, MapPin, Calendar } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const ProductDetailModal = ({ isOpen, onClose, product }) => {
  const { t } = useTranslation();

  if (!product) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.product_details')}
      size="lg"
    >
      <div className="space-y-6">
        {/* Product Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{t('admin.created')}: {formatDate(product.createdAt)}</span>
              </div>
              <Badge variant={getStatusBadgeVariant(product.status)}>
                {t(`admin.${product.status || 'pending'}`)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('admin.basic_information')}</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">{t('admin.price')}</span>
                <p className="font-semibold text-lg">{formatCurrency(product.price || 0)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('admin.stock')}</span>
                <p className="font-medium">{product.stock || 0} {t('admin.units')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('admin.category')}</span>
                <p>{product.category?.name || t('admin.uncategorized')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">SKU</span>
                <p className="font-mono text-sm">{product.sku || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('admin.vendor_information')}</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  {product.vendor?.logoUrl ? (
                    <img
                      src={product.vendor.logoUrl}
                      alt={product.vendor.storeName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{product.vendor?.storeName || 'Unknown Store'}</p>
                  <p className="text-sm text-gray-500">{product.vendor?.email}</p>
                </div>
              </div>
              {product.vendor?.storeAddress && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <p className="text-sm">{product.vendor.storeAddress}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t('admin.product_description')}</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">
              {product.description || t('admin.no_description_available')}
            </p>
          </div>
        </div>

        {/* Product Images */}
        {product.images && product.images.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('admin.product_images')}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t('common.close')}
          </Button>
          {product.status === 'pending' && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  // Handle reject action
                  onClose();
                }}
              >
                {t('admin.reject')}
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  // Handle approve action
                  onClose();
                }}
              >
                {t('admin.approve')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};