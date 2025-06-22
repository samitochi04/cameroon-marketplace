import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { supabase } from '@/lib/supabase';

export const useWishlist = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useUI();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            sale_price,
            images,
            stock_quantity,
            status,
            vendor_id
          )
        `)
        .eq('user_id', user.id)
        .eq('products.status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        addToast({
          title: 'Error',
          message: 'Failed to load wishlist',
          type: 'error'
        });
      } else {        // Process the data to include image URLs
        const processedItems = (data || []).map(item => {
          let imageArray = [];
          try {
            if (item.products?.images) {
              if (typeof item.products.images === 'string') {
                imageArray = JSON.parse(item.products.images);
              } else if (Array.isArray(item.products.images)) {
                imageArray = item.products.images;
              }
            }
          } catch (e) {
            console.warn('Error parsing product images:', e);
          }

          // Log if vendor_id is missing for debugging
          if (!item.products?.vendor_id) {
            console.warn('Product missing vendor_id in wishlist:', item.products);
          }

          return {
            ...item,
            productId: item.product_id,
            product: {
              ...item.products,
              imageUrl: imageArray.length > 0 ? imageArray[0] : '/product-placeholder.jpg'
            }
          };
        });

        setWishlistItems(processedItems);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      addToast({
        title: 'Error',
        message: 'Failed to load wishlist',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated, addToast]);

  // Load wishlist on mount and when user changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated || !user?.id) {
      addToast({
        title: 'Login Required',
        message: 'Please log in to add items to your wishlist',
        type: 'warning'
      });
      return { success: false, message: 'Not authenticated' };
    }

    // Check if item already exists
    const existingItem = wishlistItems.find(item => item.productId === productId);
    if (existingItem) {
      addToast({
        title: 'Already in Wishlist',
        message: 'This item is already in your wishlist',
        type: 'info'
      });
      return { success: false, message: 'Already in wishlist' };
    }

    // Optimistically update UI first by adding a temporary item
    const tempItem = {
      id: `temp_${Date.now()}`,
      productId: productId,
      product: { id: productId, name: 'Loading...', imageUrl: '/product-placeholder.jpg' }
    };
    setWishlistItems(prev => [tempItem, ...prev]);

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert([{
          user_id: user.id,
          product_id: productId
        }])
        .select();

      if (error) {
        // Revert optimistic update on error
        setWishlistItems(prev => prev.filter(item => item.id !== tempItem.id));
        console.error('Error adding to wishlist:', error);
        addToast({
          title: 'Error',
          message: 'Failed to add item to wishlist',
          type: 'error'
        });
        return { success: false, message: error.message };
      }      // Fetch the product details for the newly added item
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          sale_price,
          images,
          stock_quantity,
          status,
          vendor_id
        `)
        .eq('id', productId)
        .eq('status', 'published')
        .single();

      if (!productError && productData) {
        let imageArray = [];
        try {
          if (productData.images) {
            if (typeof productData.images === 'string') {
              imageArray = JSON.parse(productData.images);
            } else if (Array.isArray(productData.images)) {
              imageArray = productData.images;
            }
          }
        } catch (e) {
          console.warn('Error parsing product images:', e);
        }

        const newWishlistItem = {
          id: data[0].id,
          productId: productId,
          product: {
            ...productData,
            imageUrl: imageArray.length > 0 ? imageArray[0] : '/product-placeholder.jpg'
          }
        };

        // Replace temp item with real item
        setWishlistItems(prev => 
          prev.map(item => item.id === tempItem.id ? newWishlistItem : item)
        );
      } else {
        // If product fetch fails, still keep the temp item but refresh wishlist
        fetchWishlist();
      }
      
      addToast({
        title: 'Added to Wishlist',
        message: 'Item added to your wishlist',
        type: 'success'
      });

      return { success: true };
    } catch (error) {
      // Revert optimistic update on error
      setWishlistItems(prev => prev.filter(item => item.id !== tempItem.id));
      console.error('Error adding to wishlist:', error);
      addToast({
        title: 'Error',
        message: 'Failed to add item to wishlist',
        type: 'error'
      });
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated || !user?.id) {
      return { success: false, message: 'Not authenticated' };
    }

    // Optimistically update UI first
    const previousItems = wishlistItems;
    setWishlistItems(prev => prev.filter(item => item.productId !== productId));

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        // Revert optimistic update on error
        setWishlistItems(previousItems);
        console.error('Error removing from wishlist:', error);
        addToast({
          title: 'Error',
          message: 'Failed to remove item from wishlist',
          type: 'error'
        });
        return { success: false, message: error.message };
      }
      
      addToast({
        title: 'Removed from Wishlist',
        message: 'Item removed from your wishlist',
        type: 'success'
      });

      return { success: true };
    } catch (error) {
      // Revert optimistic update on error
      setWishlistItems(previousItems);
      console.error('Error removing from wishlist:', error);
      addToast({
        title: 'Error',
        message: 'Failed to remove item from wishlist',
        type: 'error'
      });
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated || !user?.id) {
      return { success: false, message: 'Not authenticated' };
    }

    // Optimistically update UI first
    const previousItems = wishlistItems;
    setWishlistItems([]);

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        // Revert optimistic update on error
        setWishlistItems(previousItems);
        console.error('Error clearing wishlist:', error);
        addToast({
          title: 'Error',
          message: 'Failed to clear wishlist',
          type: 'error'
        });
        return { success: false, message: error.message };
      }
      
      addToast({
        title: 'Wishlist Cleared',
        message: 'All items removed from your wishlist',
        type: 'success'
      });

      return { success: true };
    } catch (error) {
      // Revert optimistic update on error
      setWishlistItems(previousItems);
      console.error('Error clearing wishlist:', error);
      addToast({
        title: 'Error',
        message: 'Failed to clear wishlist',
        type: 'error'
      });
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist: fetchWishlist,
    wishlistCount: wishlistItems.length // This will now update immediately with optimistic updates
  };
};
