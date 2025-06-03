import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const syncAttempted = useRef(false);

  // Sync cart with backend when authentication state changes
  useEffect(() => {
    // Prevent repeated sync attempts
    if (syncAttempted.current) return;
    
    const syncCart = async () => {
      syncAttempted.current = true;
      try {
        // Use local storage cart regardless of auth state
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            // Ensure we have a valid array
            setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
          } catch (err) {
            console.error("Error parsing cart from localStorage:", err);
            setCartItems([]);
          }
        }
        
        // Cart is now synced, ready to use
        setIsCartLoaded(true);
      } catch (error) {
        console.error("Error syncing cart:", error);
        setIsCartLoaded(true); // Still mark as loaded to prevent loading issues
        setCartItems([]); // Ensure we have a valid array on error
      } finally {
        // Reset flag after a delay to allow future sync attempts
        setTimeout(() => {
          syncAttempted.current = false;
        }, 5000);
      }
    };

    syncCart();
  }, [isAuthenticated, user?.id]);

  // Update local storage when cart changes
  useEffect(() => {
    if (isCartLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems || []));
    }
  }, [cartItems, isCartLoaded]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, {
          productId: product.id,
          name: product.name,
          price: product.sale_price || product.price,
          image: product.image_url || product.thumbnail_url,
          quantity
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  // Update item quantity
  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart totals - ensure cartItems is an array before using reduce
  const cartItemsCount = Array.isArray(cartItems) 
    ? cartItems.reduce((count, item) => count + (item.quantity || 0), 0)
    : 0;
    
  const cartTotal = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems: Array.isArray(cartItems) ? cartItems : [],
        cartItemsCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        isCartLoaded
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
