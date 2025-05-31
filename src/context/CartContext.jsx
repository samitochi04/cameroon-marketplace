import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "@/services/cartService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Calculate cart totals
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Apply discounts if there's a promo code
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percentage") {
      discount = (subtotal * appliedPromo.value) / 100;
    } else {
      discount = appliedPromo.value;
    }
    
    // Cap discount at subtotal
    discount = Math.min(discount, subtotal);
  }
  
  // Calculate tax (e.g., 18% VAT)
  const tax = ((subtotal - discount) * 0.18);
  
  // Calculate shipping (free over 25,000 XAF)
  const shipping = subtotal > 25000 ? 0 : 1500;
  
  // Calculate total
  const total = subtotal - discount + tax + shipping;
  
  // Initialize cart from localStorage or database
  const initializeCart = useCallback(async () => {
    setIsLoading(true);
    
    try {
      if (isAuthenticated && user?.id) {
        // For logged-in users, sync with database
        const syncedCart = await cartService.syncCart(user.id);
        setCartItems(syncedCart?.items || []);
      } else {
        // For guest users, get cart from localStorage
        const localCart = cartService.getLocalCart();
        setCartItems(localCart?.items || []);
      }
    } catch (error) {
      console.error("Error initializing cart:", error);
      // Fallback to local cart
      const localCart = cartService.getLocalCart();
      setCartItems(localCart?.items || []);
    }
    
    setIsLoading(false);
  }, [isAuthenticated, user?.id]);
  
  // Update localStorage and database when cart changes
  const saveCart = useCallback(
    async (items) => {
      const cart = { items };
      
      // Always save to localStorage
      cartService.saveLocalCart(cart);
      
      // Save to database if user is logged in
      if (isAuthenticated && user?.id) {
        await cartService.saveCartToDatabase(user.id, cart);
      }
    },
    [isAuthenticated, user?.id]
  );
  
  // Initialize cart when component mounts or auth changes
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);
  
  // Add item to cart
  const addItem = async (item) => {
    const existingItem = cartItems.find((i) => 
      i.productId === item.productId && 
      JSON.stringify(i.variant) === JSON.stringify(item.variant)
    );
    
    let updatedItems;
    
    if (existingItem) {
      // Update quantity if item already exists
      updatedItems = cartItems.map((i) =>
        i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      // Add new item with a unique ID
      updatedItems = [...cartItems, { ...item, id: `${item.productId}_${Date.now()}` }];
    }
    
    setCartItems(updatedItems);
    await saveCart(updatedItems);
  };
  
  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    const updatedItems = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    
    setCartItems(updatedItems);
    await saveCart(updatedItems);
  };
  
  // Remove item from cart
  const removeItem = async (itemId) => {
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    
    setCartItems(updatedItems);
    await saveCart(updatedItems);
  };
  
  // Clear cart
  const clearCart = async () => {
    setCartItems([]);
    setAppliedPromo(null);
    await saveCart([]);
  };
  
  // Apply promo code
  const applyPromoCode = async (code) => {
    try {
      // This would be a real API call to validate the promo code
      // For now, we'll just simulate it
      
      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simulated codes for testing
      const promoCodes = {
        "WELCOME10": { code: "WELCOME10", type: "percentage", value: 10 },
        "SAVE5000": { code: "SAVE5000", type: "fixed", value: 5000 }
      };
      
      const promo = promoCodes[code.toUpperCase()];
      
      if (!promo) {
        return { success: false, message: "Invalid promo code" };
      }
      
      // Calculate discount amount for tracking
      let discountAmount = 0;
      if (promo.type === "percentage") {
        discountAmount = (subtotal * promo.value) / 100;
      } else {
        discountAmount = promo.value;
      }
      
      // Cap discount at subtotal
      discountAmount = Math.min(discountAmount, subtotal);
      
      // Apply the promo code
      setAppliedPromo({
        ...promo,
        discountAmount
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error applying promo code:", error);
      return { success: false, message: "An error occurred" };
    }
  };
  
  // Remove promo code
  const removePromoCode = () => {
    setAppliedPromo(null);
  };
  
  const value = {
    cartItems,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
    isEmpty: cartItems.length === 0,
    isLoading,
    appliedPromo,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromoCode,
    removePromoCode
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
