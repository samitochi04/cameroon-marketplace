import { useState, useCallback, useEffect } from 'react';
import { useGet, usePost, usePut, useDelete } from './useApi';
import { useAuth } from '@/context/AuthContext';

export const useVendor = () => {
  const [vendorProfile, setVendorProfile] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);
  const { user, isVendor } = useAuth();
  
  // API hooks
  const { data, loading, error, fetchData: fetchVendorProfile } = useGet('/api/vendors/profile');
  const { data: statsData, loading: statsLoading, fetchData: fetchStats } = useGet('/api/vendors/stats');
  const { post, loading: createLoading } = usePost();
  const { put, loading: updateLoading } = usePut();
  
  // Check if current user is a vendor and load profile
  useEffect(() => {
    if (isVendor && user) {
      fetchVendorProfile();
      fetchStats();
    }
  }, [isVendor, user, fetchVendorProfile, fetchStats]);

  // Update vendor profile state when data changes
  useEffect(() => {
    if (data && !loading) {
      setVendorProfile(data.vendor);
    }
  }, [data, loading]);

  // Update vendor stats when stats data changes
  useEffect(() => {
    if (statsData && !statsLoading) {
      setVendorStats(statsData.stats);
    }
  }, [statsData, statsLoading]);

  // Update vendor profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const response = await put('/api/vendors/profile', profileData);
      setVendorProfile(response.data.vendor);
      return response.data.vendor;
    } catch (error) {
      console.error('Failed to update vendor profile:', error);
      throw error;
    }
  }, [put]);

  // Get vendor products
  const getVendorProducts = useCallback(async (filters = {}) => {
    try {
      const response = await fetchData('/api/vendors/products', filters);
      return response.data.products;
    } catch (error) {
      console.error('Failed to get vendor products:', error);
      return [];
    }
  }, [fetchData]);

  // Add new product
  const addProduct = useCallback(async (productData) => {
    try {
      const response = await post('/api/vendors/products', productData);
      return response.data.product;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  }, [post]);

  // Update product
  const updateProduct = useCallback(async (productId, productData) => {
    try {
      const response = await put(`/api/vendors/products/${productId}`, productData);
      return response.data.product;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }, [put]);

  // Get vendor orders
  const getVendorOrders = useCallback(async (filters = {}) => {
    try {
      const response = await fetchData('/api/vendors/orders', filters);
      return response.data.orders;
    } catch (error) {
      console.error('Failed to get vendor orders:', error);
      return [];
    }
  }, [fetchData]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const response = await put(`/api/vendors/orders/${orderId}/status`, { status });
      return response.data.order;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }, [put]);

  return {
    vendorProfile,
    vendorStats,
    loading,
    error,
    createLoading,
    updateLoading,
    statsLoading,
    updateProfile,
    getVendorProducts,
    addProduct,
    updateProduct,
    getVendorOrders,
    updateOrderStatus,
  };
};
