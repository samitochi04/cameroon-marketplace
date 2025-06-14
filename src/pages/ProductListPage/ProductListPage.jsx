import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FilterIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from '@/lib/supabase';

// Mock data as fallback
const MOCK_PRODUCTS = [
  { id: 1, name: "Product 1", price: 99.99, imageUrl: "/product1.jpg", description: "This is product 1" },
  { id: 2, name: "Product 2", price: 149.99, imageUrl: "/product2.jpg", description: "This is product 2" },
  { id: 3, name: "Product 3", price: 79.99, imageUrl: "/product3.jpg", description: "This is product 3" },
  { id: 4, name: "Product 4", price: 199.99, imageUrl: "/product4.jpg", description: "This is product 4" },
  { id: 5, name: "Product 5", price: 129.99, imageUrl: "/product5.jpg", description: "This is product 5" },
  { id: 6, name: "Product 6", price: 89.99, imageUrl: "/product6.jpg", description: "This is product 6" },
];

export const ProductListPage = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Try to fetch products from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Use fetched data or fallback to mock data
        setProducts(data?.length ? data : MOCK_PRODUCTS);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        // Fall back to mock data
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const toggleFilters = () => setIsFilterOpen(!isFilterOpen);

  const handleAddToCart = (productId) => {
    console.log("Add to cart:", productId);
    // Here you would use your cart context to add the product
  };

  const handleAddToWishlist = (productId) => {
    console.log("Add to wishlist:", productId);
    // Here you would handle adding to wishlist
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{t("error_loading_products")}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <img 
                      src={product.image_url || product.imageUrl || "/product-placeholder.jpg"} 
                      alt={product.name} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                      <p className="text-primary font-semibold mt-2">${product.price?.toFixed(2)}</p>
                      <button 
                        className="mt-3 bg-primary text-white px-4 py-2 rounded-md w-full"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        {t('add_to_cart')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductListPage;