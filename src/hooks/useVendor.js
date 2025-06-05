import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useVendor = () => {
  const { user } = useAuth();
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch vendor profile
  const fetchVendorProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setVendorProfile(data);
      return data;
    } catch (err) {
      console.error('Error fetching vendor profile:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Get vendor products
  const getVendorProducts = useCallback(async (filters = {}) => {
    if (!user?.id) return { products: [], pagination: { totalPages: 0, totalCount: 0 } };
    
    try {
      const {
        page = 1,
        pageSize = 10,
        status,
        categoryId,
        search,
      } = filters;
      
      // Calculate offset
      const offset = (page - 1) * pageSize;
      
      // Start the query builder
      let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .eq('vendor_id', user.id);
      
      // Add filters if provided
      if (status) query = query.eq('status', status);
      if (categoryId) query = query.eq('category_id', categoryId);
      if (search) query = query.ilike('name', `%${search}%`);
      
      // Add pagination
      query = query.range(offset, offset + pageSize - 1).order('created_at', { ascending: false });
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Calculate pagination info
      const totalPages = Math.ceil(count / pageSize);
      
      return { 
        products: data || [], 
        pagination: { 
          totalPages, 
          totalCount: count || 0,
          currentPage: page,
          pageSize
        } 
      };
    } catch (err) {
      console.error('Error fetching vendor products:', err);
      throw err;
    }
  }, [user?.id]);

  // Get product by ID
  const getProductById = useCallback(async (productId) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('vendor_id', user.id)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fetching product:', err);
      throw err;
    }
  }, [user?.id]);

  // Add a new product
  const addProduct = useCallback(async (productData) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      setCreateLoading(true);
      console.log("Adding product with data:", productData);
      
      // Format data to match database schema
      const product = {
        vendor_id: user.id,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        sale_price: productData.sale_price,
        category_id: productData.category_id,
        stock_quantity: productData.stock_quantity,
        sku: productData.sku,
        status: productData.status,
        weight: productData.weight,
        dimensions: productData.dimensions,
        is_featured: productData.is_featured || false,
        images: productData.images || []
      };
      
      // Insert product data
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select();
        
      if (error) {
        console.error("Database error when adding product:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Product was not created properly');
      }
      
      console.log("Product added successfully:", data[0]);
      return data[0];
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  }, [user?.id]);

  // Update a product
  const updateProduct = useCallback(async (productId, productData) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      setUpdateLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .eq('vendor_id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  }, [user?.id]);

  // Delete a product
  const deleteProduct = useCallback(async (productId) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('vendor_id', user.id);
        
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  }, [user?.id]);

  // Initialize - load vendor profile on component mount
  useEffect(() => {
    if (user?.id) {
      fetchVendorProfile();
    }
  }, [user?.id, fetchVendorProfile]);

  return {
    vendorProfile,
    loading,
    error,
    createLoading,
    updateLoading,
    fetchVendorProfile,
    getVendorProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
