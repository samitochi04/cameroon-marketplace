import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState(() => getDefaultEmailTemplates());
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalVendors: 0,
    recentOrders: [],
    topVendors: []
  });

  // Helper function for default email templates (moved up for initialization)
  function getDefaultEmailTemplates() {
    return [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to Cameroon Marketplace!',
        content: 'Dear {{user_name}},\n\nWelcome to Cameroon Marketplace! We\'re excited to have you join our community of local vendors and customers.\n\nBest regards,\nThe Cameroon Marketplace Team',
        variables: ['user_name', 'site_name'],
        active: true
      },
      {
        id: 'order_confirmation',
        name: 'Order Confirmation',
        subject: 'Order Confirmation - #{{order_number}}',
        content: 'Dear {{customer_name}},\n\nThank you for your order! Your order #{{order_number}} has been confirmed.\n\nOrder Total: {{total_amount}} XAF\n\nWe\'ll notify you when your order ships.\n\nBest regards,\nThe Cameroon Marketplace Team',
        variables: ['customer_name', 'order_number', 'total_amount'],
        active: true
      },
      {
        id: 'vendor_approval',
        name: 'Vendor Approval',
        subject: 'Your vendor application has been approved!',
        content: 'Dear {{vendor_name}},\n\nCongratulations! Your vendor application for {{store_name}} has been approved.\n\nYou can now start listing your products on Cameroon Marketplace.\n\nBest regards,\nThe Cameroon Marketplace Team',
        variables: ['vendor_name', 'store_name'],
        active: true
      },
      {
        id: 'password_reset',
        name: 'Password Reset',
        subject: 'Reset your password',
        content: 'Dear {{user_name}},\n\nYou requested to reset your password. Click the link below to reset it:\n\n{{reset_link}}\n\nIf you didn\'t request this, please ignore this email.\n\nBest regards,\nThe Cameroon Marketplace Team',
        variables: ['user_name', 'reset_link'],
        active: true
      },
      {
        id: 'product_approved',
        name: 'Product Approved',
        subject: 'Your product has been approved!',
        content: 'Dear {{vendor_name}},\n\nYour product "{{product_name}}" has been approved and is now live on Cameroon Marketplace.\n\nCustomers can now view and purchase your product.\n\nBest regards,\nThe Cameroon Marketplace Team',
        variables: ['vendor_name', 'product_name'],
        active: true
      },
      {
        id: 'order_shipped',
        name: 'Order Shipped',
        subject: 'Your order has shipped - #{{order_number}}',
        content: 'Dear {{customer_name}},\n\nGreat news! Your order #{{order_number}} has been shipped.\n\nTracking Number: {{tracking_number}}\n\nExpected Delivery: {{delivery_date}}\n\nBest regards,\nThe Cameroon Marketplace Team',
        variables: ['customer_name', 'order_number', 'tracking_number', 'delivery_date'],
        active: true
      }
    ];
  }

  // Fetch all admin data
  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from profiles table
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch vendors from vendors table
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorsError) {
        console.warn('Vendors table query failed:', vendorsError);
        // Fallback: Get vendors from profiles table where role = 'vendor'
        const { data: vendorUsersData, error: vendorUsersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'vendor')
          .order('created_at', { ascending: false });

        if (vendorUsersError) throw vendorUsersError;
        setVendors(vendorUsersData || []);
      } else {
        setVendors(vendorsData || []);
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch orders
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderItemsError) throw orderItemsError;
      setOrders(orderItemsData || []);

      

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Calculate dashboard stats
      const stats = calculateDashboardStats(usersData, vendorsData || [], ordersData);
      setDashboardStats(stats);

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate dashboard statistics
  const calculateDashboardStats = (usersData = [], vendorsData = [], ordersData = [], orderItemsData = []) => {
    const totalRevenue = ordersData
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const totalOrders = ordersData.length;
    const totalUsers = usersData.length;
    const totalVendors = vendorsData.length;

    // Get recent orders (last 10)
    const recentOrders = ordersData.slice(0, 10);

    // Calculate top vendors by sales (simplified without join data)
    const vendorSales = {};
    
    // For vendors from vendors table, group by vendor_id
    orderItemsData.forEach(orderItem => {
      // Since we don't have order_items join, we'll use basic order data
      const vendorId = orderItem.vendor_id; 
      if (vendorId) {
        if (!vendorSales[vendorId]) {
          vendorSales[vendorId] = {
            totalSales: 0,
            orderCount: 0
          };
        }
        vendorSales[vendorId].totalSales += orderItem.total || 0;
        vendorSales[vendorId].orderCount += 1;
      }
    });

    const topVendors = vendorsData
      .map(vendor => ({
        ...vendor,
        totalSales: vendorSales[vendor.id]?.totalSales || 0,
        orderCount: vendorSales[vendor.id]?.orderCount || 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalVendors,
      recentOrders,
      topVendors
    };
  };

  // Enhanced data getters with pagination support
  const getUsers = useCallback(async (options = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        roleFilter,
        statusFilter,
        searchQuery
      } = options;

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply filters
      if (roleFilter && roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Apply pagination and ordering
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        success: true,
        data: data || [],
        totalPages,
        totalCount: count || 0,
        currentPage: page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        totalPages: 0,
        totalCount: 0,
        currentPage: 1,
        pageSize: 10
      };
    }
  }, []);
  const getVendors = useCallback(async (options = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        statusFilter,
        searchQuery
      } = options;

      let query = supabase
        .from('vendors')
        .select('*', { count: 'exact' });

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.or(`store_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Apply pagination and ordering
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        // Fallback to profiles table if vendors table doesn't exist
        console.warn('Vendors table query failed, using profiles fallback');
        
        let profileQuery = supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('role', 'vendor');

        if (searchQuery) {
          profileQuery = profileQuery.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }

        const profileOffset = (page - 1) * pageSize;
        profileQuery = profileQuery
          .range(profileOffset, profileOffset + pageSize - 1)
          .order('created_at', { ascending: false });

        const { data: profileData, error: profileError, count: profileCount } = await profileQuery;
        
        if (profileError) throw profileError;

        const totalPages = Math.ceil((profileCount || 0) / pageSize);

        return {
          success: true,
          data: profileData || [],
          totalPages,
          totalCount: profileCount || 0,
          currentPage: page,
          pageSize
        };
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        success: true,
        data: data || [],
        totalPages,
        totalCount: count || 0,
        currentPage: page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        totalPages: 0,
        totalCount: 0,
        currentPage: 1,
        pageSize: 10
      };
    }
  }, []);

  // Get vendors list (simple version without pagination)
  const getVendorsList = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('store_name');

      if (error) {
        // Fallback to profiles table
        console.warn('Vendors table query failed, using profiles fallback');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'vendor')
          .order('name');
        
        if (profileError) throw profileError;
        return profileData || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching vendors list:', error);
      return [];
    }
  }, []);

  // Get all orders with pagination
  const getAllOrders = useCallback(async (options = {}) => {
    try {
      const {
        page = 1,
        pageSize = 10,
        statusFilter,
        vendorFilter,
        searchQuery
      } = options;

      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      // Apply filters
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (vendorFilter && vendorFilter !== 'all') {
        query = query.eq('vendor_id', vendorFilter);
      }

      if (searchQuery) {
        query = query.or(`order_number.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`);
      }

      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Apply pagination and ordering
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        success: true,
        data: data || [],
        totalPages,
        totalCount: count || 0,
        currentPage: page,
        pageSize
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        totalPages: 0,
        totalCount: 0,
        currentPage: 1,
        pageSize: 10
      };
    }
  }, []);

  // Get enriched data with relationships
  const getOrdersWithDetails = useCallback(async () => {
    try {
      const { data: ordersWithItems, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              vendor_id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch orders with details:', error);
        return orders; // Return basic orders if join fails
      }

      return ordersWithItems || [];
    } catch (err) {
      console.warn('Error fetching detailed orders:', err);
      return orders;
    }
  }, [orders]);

  // Get products with category and vendor info
  const getProductsWithDetails = useCallback(async () => {
    try {
      const { data: productsWithDetails, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Could not fetch products with details:', error);
        return products;
      }

      return productsWithDetails || [];
    } catch (err) {
      console.warn('Error fetching detailed products:', err);
      return products;
    }
  }, [products]);

  // Approve vendor
  const approveVendor = async (vendorId) => {
    try {
      // Update vendor status in vendors table
      const { error } = await supabase
        .from('vendors')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) {
        console.warn('Vendors table update failed:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, status: 'approved' }
          : vendor
      ));

      return { success: true };
    } catch (err) {
      console.error('Error approving vendor:', err);
      return { success: false, error: err.message };
    }
  };

  // Reject vendor
  const rejectVendor = async (vendorId) => {
    try {
      // Update vendor status in vendors table
      const { error } = await supabase
        .from('vendors')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) {
        console.warn('Vendors table update failed:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setVendors(prev => prev.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, status: 'rejected' }
          : vendor
      ));

      return { success: true };
    } catch (err) {
      console.error('Error rejecting vendor:', err);
      return { success: false, error: err.message };
    }
  };

  // Approve product
  const approveProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, status: 'approved' }
          : product
      ));

      return { success: true };
    } catch (err) {
      console.error('Error approving product:', err);
      return { success: false, error: err.message };
    }
  };

  // Reject product
  const rejectProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(prev => prev.map(product => 
        product.id === productId 
          ? { ...product, status: 'rejected' }
          : product
      ));

      return { success: true };
    } catch (err) {
      console.error('Error rejecting product:', err);
      return { success: false, error: err.message };
    }
  };

  // Create user
  const createUser = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUsers(prev => [data, ...prev]);

      return { success: true, data };
    } catch (err) {
      console.error('Error creating user:', err);
      return { success: false, error: err.message };
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? data : user
      ));

      return { success: true, data };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, error: err.message };
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      return { success: false, error: err.message };
    }
  };

  // Create category
  const createCategory = async (categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...categoryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCategories(prev => [...prev, data]);

      return { success: true, data };
    } catch (err) {
      console.error('Error creating category:', err);
      return { success: false, error: err.message };
    }
  };

  // Update category
  const updateCategory = async (categoryId, categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCategories(prev => prev.map(category => 
        category.id === categoryId ? data : category
      ));

      return { success: true, data };
    } catch (err) {
      console.error('Error updating category:', err);
      return { success: false, error: err.message };
    }
  };
  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      // Update local state
      setCategories(prev => prev.filter(category => category.id !== categoryId));

      return { success: true };
    } catch (err) {
      console.error('Error deleting category:', err);
      return { success: false, error: err.message };
    }
  };
  // Settings management
  const getSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        // If no settings table exists, return default settings
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.info('Settings table not found, returning default settings');
          return {
            success: true,
            data: getDefaultSettings()
          };
        }
        throw error;
      }

      return {
        success: true,
        data: data || getDefaultSettings()
      };
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {
        success: true, // Return success with defaults rather than failing
        data: getDefaultSettings()
      };
    }
  }, []);

  const updateSettings = async (settingsData) => {
    try {
      // First try to update existing settings
      const { data, error } = await supabase
        .from('settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1) // Assuming single settings record with id 1
        .select()
        .single();

      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        // If settings table doesn't exist, try to create it and insert
        console.warn('Settings table does not exist. Please create the settings table in your database.');
        return { 
          success: false, 
          error: 'Settings table not found. Please contact administrator to set up the database.' 
        };
      } else if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error updating settings:', err);
      return { success: false, error: err.message };
    }
  };  // Get commission rates (for compatibility with SettingsPage)
  const getCommissionRates = useCallback(async () => {
    try {
      // Try to get from settings first
      const settingsResult = await getSettings();
      if (settingsResult.success && settingsResult.data.commission_rate) {
        return {
          success: true,
          data: {
            platform_commission: settingsResult.data.commission_rate,
            payment_processing: 2.5, // Default payment processing fee
            vendor_commission: 100 - settingsResult.data.commission_rate - 2.5
          }
        };
      }

      // Fallback to default commission structure
      return {
        success: true,
        data: {
          platform_commission: 5.0,     // 5% platform fee
          payment_processing: 2.5,      // 2.5% payment processing
          vendor_commission: 92.5       // 92.5% to vendor
        }
      };
    } catch (error) {
      console.error('Error fetching commission rates:', error);
      return {
        success: true,
        data: {
          platform_commission: 5.0,
          payment_processing: 2.5,
          vendor_commission: 92.5
        }
      };
    }
  }, [getSettings]);

  // Get payment settings (for compatibility with SettingsPage)
  const getPaymentSettings = useCallback(async () => {
    try {
      // Try to get from settings first
      const settingsResult = await getSettings();
      if (settingsResult.success && settingsResult.data) {
        return {
          success: true,
          data: {
            payment_methods: settingsResult.data.payment_methods || ['momo', 'bank_transfer', 'cash_on_delivery'],
            currency: settingsResult.data.currency || 'XAF',
            tax_rate: settingsResult.data.tax_rate || 19.25,
            commission_rate: settingsResult.data.commission_rate || 5.0,
            // Payment gateway settings (mock for now)
            momo_settings: {
              enabled: true,
              api_key: '',
              secret_key: '',
              environment: 'sandbox'
            },
            bank_transfer_settings: {
              enabled: true,
              bank_name: '',
              account_number: '',
              account_name: ''
            },
            cash_on_delivery_settings: {
              enabled: true,
              delivery_fee: 1000 // Default delivery fee in XAF
            }
          }
        };
      }

      // Fallback to default payment settings
      return {
        success: true,
        data: getDefaultPaymentSettings()
      };
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      return {
        success: true,
        data: getDefaultPaymentSettings()
      };
    }
  }, [getSettings]);
  // Helper function for default payment settings
  const getDefaultPaymentSettings = () => ({
    payment_methods: ['momo', 'bank_transfer', 'cash_on_delivery'],
    currency: 'XAF',
    tax_rate: 19.25,
    commission_rate: 5.0,
    momo_settings: {
      enabled: true,
      api_key: '',
      secret_key: '',
      environment: 'sandbox'
    },
    bank_transfer_settings: {
      enabled: true,
      bank_name: '',
      account_number: '',
      account_name: ''
    },
    cash_on_delivery_settings: {
      enabled: true,
      delivery_fee: 1000
    }
  });
  // Get email templates (for compatibility with SettingsPage)
  const getEmailTemplates = useCallback(async () => {
    try {
      // Try to get from email_templates table first
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        // Email templates table doesn't exist, return default templates
        console.info('Email templates table not found, returning default templates');
        return {
          success: true,
          data: getDefaultEmailTemplates()
        };
      } else if (error) {
        throw error;
      }

      // Ensure data is always an array
      const templateData = Array.isArray(data) ? data : getDefaultEmailTemplates();

      return {
        success: true,
        data: templateData
      };
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return {
        success: true,
        data: getDefaultEmailTemplates()
      };
    }
  }, []);  // Simple email templates getter (returns array directly for compatibility)
  const getEmailTemplatesList = useCallback(async () => {
    try {
      const result = await getEmailTemplates();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return getDefaultEmailTemplates();
    } catch (error) {
      console.error('Error fetching email templates list:', error);
      return getDefaultEmailTemplates();
    }
  }, [getEmailTemplates]);  // Safe getter that always returns an array (for direct use in components)
  const getEmailTemplatesArray = useCallback(() => {
    // This is a synchronous function that returns the default templates
    // Use this if you need immediate access to templates without async
    return getDefaultEmailTemplates();
  }, []);

  // Update commission rates
  const updateCommissionRates = async (commissionData) => {
    try {
      // This would typically update a commission_rates table or settings
      const { error } = await supabase
        .from('settings')
        .update({
          commission_rate: commissionData.defaultRate,
          min_commission_rate: commissionData.minRate,
          max_commission_rate: commissionData.maxRate,
          commission_tiers: commissionData.tiers,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        console.warn('Settings table does not exist. Please create the settings table in your database.');
        return { 
          success: false, 
          error: 'Settings table not found. Please contact administrator to set up the database.' 
        };
      } else if (error) {
        throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating commission rates:', err);
      return { success: false, error: err.message };
    }
  };

  // Update payment settings
  const updatePaymentSettings = async (paymentData) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({
          payment_gateway: paymentData.paymentGateway,
          payment_test_mode: paymentData.testMode,
          kora_merchant_id: paymentData.koraMerchantId,
          kora_public_key: paymentData.koraPublicKey,
          kora_secret_key: paymentData.koraSecretKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        console.warn('Settings table does not exist. Please create the settings table in your database.');
        return { 
          success: false, 
          error: 'Settings table not found. Please contact administrator to set up the database.' 
        };
      } else if (error) {
        throw error;
      }

      return { success: true };
    } catch (err) {
      console.error('Error updating payment settings:', err);
      return { success: false, error: err.message };
    }
  };

  // Update email template
  const updateEmailTemplate = async (templateId, templateData) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: templateData.subject,
          content: templateData.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        console.warn('Email templates table does not exist. Template saved locally only.');
        
        // Update local state even if database doesn't exist
        setEmailTemplates(prev => 
          prev.map(template => 
            template.id === templateId 
              ? { ...template, subject: templateData.subject, content: templateData.body }
              : template
          )
        );
        
        return { success: true };
      } else if (error) {
        throw error;
      }

      // Update local state
      setEmailTemplates(prev => 
        prev.map(template => 
          template.id === templateId 
            ? { ...template, subject: templateData.subject, content: templateData.body }
            : template
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating email template:', err);
      return { success: false, error: err.message };
    }
  };

  // Helper function to get default settings
  const getDefaultSettings = () => ({
    site_name: 'Cameroon Marketplace',
    site_description: 'Your premier marketplace for local vendors',
    currency: 'XAF',
    tax_rate: 19.25,
    commission_rate: 5.0,
    allow_guest_checkout: true,
    require_vendor_approval: true,
    require_product_approval: true,
    email_notifications: true,
    sms_notifications: false,
    maintenance_mode: false,
    max_upload_size: 5, // MB
    allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    shipping_methods: ['standard', 'express', 'pickup'],
    payment_methods: ['momo', 'bank_transfer', 'cash_on_delivery'],
    default_language: 'en',
    timezone: 'Africa/Douala'
  });  // Load data on mount
  useEffect(() => {
    fetchAdminData();
    
    // Load email templates on mount
    const loadEmailTemplates = async () => {
      try {
        const result = await getEmailTemplates();
        if (result.success && Array.isArray(result.data)) {
          setEmailTemplates(result.data);
        }
      } catch (error) {
        console.error('Failed to load email templates:', error);
        // Keep default templates if loading fails
      }
    };
    
    loadEmailTemplates();
  }, [fetchAdminData, getEmailTemplates]);return {
    // Data
    users,
    vendors,
    products,
    orders,
    categories,
    emailTemplates,
    dashboardStats,
    
    // State
    loading,
    error,
    
    // Methods
    refetch: fetchAdminData,
    getOrdersWithDetails,
    getProductsWithDetails,
    
    // Data getters with pagination support
    getUsers,
    getVendors,
    getVendorsList,
    getAllOrders,
    getProducts: () => products,
    getOrders: () => orders,
    getCategories: () => categories,    // Settings management
    getSettings,
    updateSettings,
    getCommissionRates,
    updateCommissionRates,
    getPaymentSettings,
    updatePaymentSettings,
    getEmailTemplates,
    updateEmailTemplate,
    getEmailTemplatesList,
    getEmailTemplatesArray: getEmailTemplatesArray,
    
    // Vendor actions
    approveVendor,
    rejectVendor,
    
    // Product actions
    approveProduct,
    rejectProduct,
    
    // User actions
    createUser,
    updateUser,
    deleteUser,
    
    // Category actions
    createCategory,
    updateCategory,
    deleteCategory
  };
};
