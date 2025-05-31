import React, { useState } from "react";
import { NavBar } from "../../components/common/NavBar";
import { ProductGrid } from "../../components/products/ProductGrid";
import { Button } from "../../components/ui/Button";
import { FilterIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ProductListPage = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{t("products")}</h1>

          {/* Mobile filter button */}
          <Button
            variant="outline"
            className="md:hidden"
            onClick={toggleFilters}
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            {t("filters")}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Hidden on mobile until toggled */}
          <div
            className={`
            fixed md:relative inset-0 bg-white md:bg-transparent z-40 md:z-0
            transform transition-transform duration-300 ease-in-out
            ${
              isFilterOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
            w-3/4 md:w-64 p-4 md:p-0
          `}
          >
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="font-bold text-lg">{t("filters")}</h2>
              <button onClick={toggleFilters}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white md:shadow-md rounded-md p-4">
              {/* Filter content */}
              <h3 className="font-semibold mb-3">{t("categories")}</h3>
              <div className="space-y-2 mb-6">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Category 1</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Category 2</span>
                </label>
              </div>

              <h3 className="font-semibold mb-3">{t("price")}</h3>
              <div className="space-y-2">
                <input type="range" min="0" max="1000" className="w-full" />
                <div className="flex justify-between text-sm">
                  <span>$0</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay for mobile filters */}
          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={toggleFilters}
            ></div>
          )}

          {/* Product grid */}
          <div className="flex-1">
            <ProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        </div>
      </main>
    </div>
  );
};