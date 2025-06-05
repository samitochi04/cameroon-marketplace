import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { useAuth } from '@/context/AuthContext';

export const useAdmin = () => {
  const { user, isAdmin } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  
  // API hooks
  const { get, post, put, delete: deleteMethod } = useApi();
  const { data: statsData, loading: statsLoading, fetchData: fetchStats } = useGet('/api/admin/stats');
  const { loading: createLoading } = usePost();
  const { loading: updateLoading } = usePut();
  const { loading: deleteLoading } = useDelete();

  // Load dashboard stats when component mounts if user is admin
  useEffect(() => {
    if (isAdmin && user) {
      fetchStats();
    }
  }, [isAdmin, user, fetchStats]);

  // Update dashboard stats when data changes
  useEffect(() => {
    if (statsData && !statsLoading) {
      setDashboardStats(statsData.stats);
    }
  }, [statsData, statsLoading]);

  // User management functions
  const getUsers = useCallback(async (filters = {}) => {
    try {
      const { data } = await fetchStats('/api/admin/users', filters);
      return data.users;
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }, [fetchStats]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const response = await put(`/api/admin/users/${userId}`, userData);
      return response.data.user;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [put]);

  // Vendor management functions
  const getVendors = useCallback(async (filters = {}) => {
    try {
      const { data } = await fetchStats('/api/admin/vendors', filters);
      return data.vendors;
    } catch (error) {
      console.error('Failed to get vendors:', error);
      return [];
    }
  }, [fetchStats]);

  const approveVendor = useCallback(async (vendorId) => {
    try {
      const response = await put(`/api/admin/vendors/${vendorId}/approve`);
      return response.data.vendor;
    } catch (error) {
      console.error('Failed to approve vendor:', error);
      throw error;
    }
  }, [put]);

  const rejectVendor = useCallback(async (vendorId) => {
    try {
      const response = await put(`/api/admin/vendors/${vendorId}/reject`);
      return response.data.vendor;
    } catch (error) {
      console.error('Failed to reject vendor:', error);
      throw error;
    }
  }, [put]);

  // Product management functions
  const getAdminProducts = useCallback(async (filters = {}) => {
    try {
      const { data } = await fetchStats('/api/admin/products', filters);
      return data.products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }, [fetchStats]);

  const updateProduct = useCallback(async (productId, productData) => {
    try {
      const response = await put(`/api/admin/products/${productId}`, productData);
      return response.data.product;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }, [put]);

  const deleteProduct = useCallback(async (productId) => {
    try {
      await deleteMethod(`/api/admin/products/${productId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }, [deleteMethod]);

  // Order management functions
  const getAdminOrders = useCallback(async (filters = {}) => {
    try {
      const { data } = await fetchStats('/api/admin/orders', filters);
      return data.orders;
    } catch (error) {
      console.error('Failed to get orders:', error);
      return [];
    }
  }, [fetchStats]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const response = await put(`/api/admin/orders/${orderId}/status`, { status });
      return response.data.order;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }, [put]);

  // Category management functions
  const createCategory = useCallback(async (categoryData) => {
    try {
      const response = await post('/api/admin/categories', categoryData);
      return response.data.category;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }, [post]);

  const updateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      const response = await put(`/api/admin/categories/${categoryId}`, categoryData);
      return response.data.category;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }, [put]);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      await deleteMethod(`/api/admin/categories/${categoryId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }, [deleteMethod]);

  return {
    dashboardStats,
    statsLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    getUsers,
    updateUser,
    getVendors,
    approveVendor,
    rejectVendor,
    getAdminProducts,
    updateProduct,
    deleteProduct,
    getAdminOrders,
    updateOrderStatus,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
