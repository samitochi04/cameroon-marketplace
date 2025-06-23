import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useUI();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [shipping, setShipping] = useState(2000); // Default shipping cost
  const syncAttempted = useRef(false);

  // Calculate cart items count
  const cartItemsCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Sync cart with backend when authentication state changes
  useEffect(() => {
    // Prevent repeated sync attempts
    if (syncAttempted.current) return;
    
    const syncCart = async () => {
      syncAttempted.current = true;
      try {
        // Check for window/localStorage availability
        if (typeof window === 'undefined' || !window.localStorage) {
          setCartItems([]);
          setIsCartLoaded(true);
          return;
        }
        
        // Use local storage cart regardless of auth state
        const savedCart = window.localStorage.getItem("cart");
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

  // Add item to cart with proper checking
  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) {
      console.error("Invalid product passed to addToCart", product);
      return;
    }    // Ensure vendor_id is available
    if (!product.vendor_id) {
      console.error("Product missing vendor_id:", product);
      
      // In development mode, allow adding products without vendor_id with a default value
      if (import.meta.env.MODE === 'development' || import.meta.env.VITE_DEVELOPMENT_MODE === 'true') {
        console.warn("Development mode: Adding product without vendor_id, using default");
        product.vendor_id = 'default-vendor'; // Temporary fallback for development
      } else {
        addToast({
          title: "Error",
          message: "Unable to add product to cart: missing vendor information",
          type: "error"
        });
        return;
      }
    }

    // Check if current user is a vendor trying to buy their own product
    if (user && user.role === 'vendor' && user.id === product.vendor_id) {
      addToast({
        title: "Cannot Add Product",
        message: "You cannot purchase your own products",
        type: "warning"
      });
      return;
    }

    // Make sure we have all the required fields
    const cartProduct = {
      id: product.id,
      vendor_id: product.vendor_id, 
      name: product.name,
      price: parseFloat(product.price) || 0,
      image: product.image || "/product-placeholder.jpg",
      quantity: quantity,
      stock_quantity: product.stock_quantity || 10
    };
    
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Check if we're exceeding stock
        if (product.stock_quantity && newQuantity > product.stock_quantity) {
          addToast({
            title: "Maximum stock reached",
            message: `Only ${product.stock_quantity} items available`,
            type: "warning"
          });
          updatedItems[existingItemIndex].quantity = product.stock_quantity;
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        
        // Show success toast
        addToast({
          title: "Cart updated",
          message: `${product.name} quantity updated in cart`,
          type: "success"
        });
        
        return updatedItems;
      } else {
        // Add new item
        addToast({
          title: "Added to cart",
          message: `${product.name} added to your cart`,
          type: "success"
        });
        
        return [...prevItems, cartProduct];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === productId);
      if (itemToRemove) {
        addToast({
          title: "Item removed",
          message: `${itemToRemove.name} removed from cart`,
          type: "info"
        });
      }
      return prevItems.filter(item => item.id !== productId);
    });
  };

  // Update item quantity
  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    addToast({
      title: "Cart cleared",
      message: "All items removed from your cart",
      type: "info"
    });
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  // Calculate discount amount
  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    return appliedPromo.discountAmount;
  }, [appliedPromo]);

  // Calculate total
  const total = useMemo(() => {
    return subtotal - discount + shipping;
  }, [subtotal, discount, shipping]);

  // Update shipping cost
  const updateShipping = (cost) => {
    setShipping(cost);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: Array.isArray(cartItems) ? cartItems : [],
        cartItemsCount,
        subtotal,
        shipping,
        total,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        isCartLoaded,
        isEmpty: cartItemsCount === 0,
        loading,
        appliedPromo,
        discount,
        updateShipping,
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
