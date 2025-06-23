import { useState, useEffect } from 'react';
import { useApi } from './useApi'; // Fix the import - useGet doesn't exist

export function useProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { get } = useApi(); // Use useApi hook instead of useGet

  const {
    page = 1,
    pageSize = 12,
    filters = {},
    sort = '',
    category = null,
    search = '',
    featured = false,
  } = options;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiFilters = { ...filters };
        if (category) apiFilters.categoryId = category;
        if (featured) apiFilters.featured = true;

        const query = {
          filters: apiFilters,
          page,
          pageSize,
          orderBy: sort ? { field: sort.field, direction: sort.direction } : undefined,
          search
        };

        // Use the get method from useApi hook
        const { data, error, count } = await get('/products', query);

        if (error) {
          throw error;
        }

        setProducts(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, pageSize, category, sort, search, featured, filters, get]);

  return {
    products,
    isLoading,
    error,
    totalCount,
    page,
    pageSize,
  };
}

// Hook for product details
export const useProductDetail = (productId) => {
  const [product, setProduct] = useState(null);
  const { data, loading, error, fetchData } = useGet(`/api/products/${productId}`);

  useEffect(() => {
    if (productId) {
      fetchData();
    }
  }, [productId, fetchData]);

  useEffect(() => {
    if (data && !loading) {
      setProduct(data.product);
    }
  }, [data, loading]);

  return {
    product,
    loading,
    error,
    refreshProduct: fetchData
  };
};
