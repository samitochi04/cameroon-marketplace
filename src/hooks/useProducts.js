import { useState, useCallback, useEffect } from 'react';
import { useGet, usePost } from './useApi';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  });

  // Using the useGet hook from our API utilities
  const { 
    data, 
    loading, 
    error, 
    fetchData: fetchProducts 
  } = useGet('/api/products');

  // Load products with current filters and pagination
  const loadProducts = useCallback(async () => {
    try {
      const params = {
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      const response = await fetchProducts(params);
      setProducts(response.data.products);
      setTotalCount(response.data.totalCount);
      return response.data;
    } catch (error) {
      console.error('Failed to load products:', error);
      return { products: [], totalCount: 0 };
    }
  }, [filters, pagination, fetchProducts]);

  // Update filters and reset pagination
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  }, []);

  // Get a single product by ID
  const getProductById = useCallback(async (productId) => {
    try {
      const { data } = await fetchProducts({ id: productId });
      return data.products[0] || null;
    } catch (error) {
      console.error(`Failed to get product ${productId}:`, error);
      return null;
    }
  }, [fetchProducts]);

  // Search products
  const searchProducts = useCallback(async (query) => {
    try {
      const params = {
        search: query,
        page: 1,
        pageSize: pagination.pageSize,
      };
      
      const response = await fetchProducts(params);
      return response.data.products;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }, [fetchProducts, pagination.pageSize]);

  // Effect to load products when filters or pagination change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    totalCount,
    loading,
    error,
    filters,
    pagination,
    loadProducts,
    updateFilters,
    changePage,
    changePageSize,
    getProductById,
    searchProducts,
  };
};

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
