import React from "react";
import PropTypes from "prop-types";
import { ProductCard } from "@/components/products/ProductCard";
import { useTranslation } from "react-i18next";

export const ProductGrid = ({ 
  products, 
  loading = false, 
  error = null,
  columns = 4 
}) => {
  const { t } = useTranslation();
  
  // Calculate the grid columns class based on the columns prop
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  }[columns] || "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  // Show loading skeleton
  if (loading) {
    return (
      <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Show empty message if no products
  if (!products || products.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-md text-center">
        <p className="text-gray-500">{t('no_products_found')}</p>
      </div>
    );
  }

  // Show products grid
  return (
    <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.string,
  columns: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
};