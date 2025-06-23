import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Package, Calendar, Phone, Mail } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const VendorApproval = ({ isOpen, onClose, vendor }) => {
  const { t } = useTranslation();

  if (!vendor) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
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
      onClose={() => onClose(false)}
      title={vendor.storeName}
      size="lg"
    >
      <div className="space-y-6">
        {/* Vendor Header */}
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {vendor.logoUrl ? (
              <img
                src={vendor.logoUrl}
                alt={vendor.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{vendor.storeName}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{t('common.member_since')}: {formatDate(vendor.createdAt)}</span>
              </div>
              <Badge variant={getStatusBadgeVariant(vendor.status)}>
                {t(`admin.${vendor.status}`)}
              </Badge>
            </div>
            {vendor.rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{vendor.rating}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({vendor.reviewCount || 0} reviews)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Store Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('vendor.store_information')}</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">{t('vendor.store_name')}</span>
                <p className="font-medium">{vendor.storeName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('admin.owner')}</span>
                <p>{vendor.ownerName || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('admin.products')}</span>
                <p>{vendor.productCount || 0} products</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('admin.commission')}</span>
                <p>{vendor.commissionRate || 0}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('vendor.contact_information')}</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm">{vendor.email}</span>
              </div>
              {vendor.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">{vendor.phone}</span>
                </div>
              )}
              {vendor.storeAddress && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                  <span className="text-sm">{vendor.storeAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Description */}
        {vendor.storeDescription && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('vendor.store_description')}</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{vendor.storeDescription}</p>
            </div>
          </div>
        )}

        {/* Documents/Business Information */}
        {vendor.businessInfo && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {vendor.businessInfo.businessType && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Business Type:</span>
                  <p className="text-sm">{vendor.businessInfo.businessType}</p>
                </div>
              )}
              {vendor.businessInfo.registrationNumber && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Registration Number:</span>
                  <p className="text-sm font-mono">{vendor.businessInfo.registrationNumber}</p>
                </div>
              )}
              {vendor.businessInfo.taxId && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Tax ID:</span>
                  <p className="text-sm font-mono">{vendor.businessInfo.taxId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
          >
            {t('common.close')}
          </Button>
          {vendor.status === 'pending' && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  // Handle reject - this would be implemented by parent component
                  onClose(false);
                }}
              >
                {t('admin.reject')}
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  // Handle approve - this would be implemented by parent component
                  onClose(true);
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
