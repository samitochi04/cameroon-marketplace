import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const { get, post, del } = useApi();

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await get('/wishlist');
      setWishlistItems(response.data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to fetch wishlist items');
    } finally {
      setIsLoading(false);
    }
  }, [get, isAuthenticated]);

  // Load wishlist on initial render and auth state changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, user?.id]);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  // Add to wishlist
  const addToWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return false;
    }

    try {
      await post('/wishlist', { productId: product.id });
      
      // Update local state
      setWishlistItems(prev => [
        ...prev, 
        { 
          id: `temp-${Date.now()}`, 
          productId: product.id,
          product
        }
      ]);
      
      return true;
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist');
      return false;
    }
  }, [isAuthenticated, post]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) return false;

    try {
      await del(`/wishlist/${productId}`);
      
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      
      return true;
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
      return false;
    }
  }, [isAuthenticated, del]);

  // Toggle wishlist item
  const toggleWishlistItem = useCallback(async (product) => {
    if (isInWishlist(product.id)) {
      return await removeFromWishlist(product.id);
    } else {
      return await addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  // Refresh wishlist data
  const refreshWishlist = useCallback(() => {
    return fetchWishlist();
  }, [fetchWishlist]);

  return {
    wishlistItems,
    isLoading,
    error,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    refreshWishlist
  };
};
