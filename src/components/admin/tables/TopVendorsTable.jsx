import React from 'react';
import { useTranslation } from 'react-i18next';
import { Store, Star } from 'lucide-react';

export const TopVendorsTable = ({ vendors = [], loading = false }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8">
        <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">{t('admin.no_vendors_yet')}</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      {vendors.map((vendor) => (
        <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {vendor.logoUrl ? (
                  <img
                    src={vendor.logoUrl}
                    alt={vendor.storeName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Store className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{vendor.storeName}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{vendor.productCount || 0} products</span>
                {vendor.rating && (
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span>{vendor.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(vendor.totalSales || 0)}
            </p>
            <p className="text-xs text-gray-500">
              {vendor.orderCount || 0} orders
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};