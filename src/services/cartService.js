import { supabase } from "@/utils/supabase";

/**
 * Service for cart operations
 */
export const cartService = {
  /**
   * Get cart from local storage
   */
  getLocalCart() {
    try {
      const cart = localStorage.getItem("cart");
      return cart ? JSON.parse(cart) : { items: [], lastUpdated: new Date().toISOString() };
    } catch (error) {
      console.error("Error getting cart from localStorage:", error);
      return { items: [], lastUpdated: new Date().toISOString() };
    }
  },

  /**
   * Save cart to local storage
   */
  saveLocalCart(cart) {
    try {
      // Update the lastUpdated timestamp
      cart.lastUpdated = new Date().toISOString();
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  },

  /**
   * Get cart from database for logged in user
   */
  async getCartFromDatabase(userId) {
    try {
      // Get the cart record
      const { data: cartData, error: cartError } = await supabase
        .from("carts")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (cartError && cartError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error, which is fine if user has no cart yet
        console.error("Error fetching cart:", cartError);
        return null;
      }

      // If no cart exists yet, return null
      if (!cartData) return null;

      // Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            slug,
            price,
            sale_price,
            images,
            vendor:vendors (
              id,
              store_name
            )
          )
        `)
        .eq("cart_id", cartData.id);

      if (itemsError) {
        console.error("Error fetching cart items:", itemsError);
        return null;
      }

      // Format the cart items
      const formattedItems = cartItems.map((item) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.sale_price || item.product.price,
        image: item.product.images && item.product.images.length > 0 
          ? item.product.images[0] 
          : "/placeholder-product.jpg",
        vendor: {
          id: item.product.vendor.id,
          name: item.product.vendor.store_name
        }
      }));

      return {
        id: cartData.id,
        items: formattedItems,
        lastUpdated: cartData.updated_at
      };
    } catch (error) {
      console.error("Error in getCartFromDatabase:", error);
      return null;
    }
  },

  /**
   * Save cart to database for logged in user
   */
  async saveCartToDatabase(userId, cart) {
    try {
      // First check if the user already has a cart
      let { data: existingCart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      // If there's an error other than "no rows returned", handle it
      if (cartError && cartError.code !== "PGRST116") {
        console.error("Error checking for existing cart:", cartError);
        return false;
      }

      let cartId;

      // If no cart exists, create one
      if (!existingCart) {
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ user_id: userId })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating cart:", createError);
          return false;
        }

        cartId = newCart.id;
      } else {
        cartId = existingCart.id;
      }

      // Clear existing items for this cart
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (deleteError) {
        console.error("Error clearing cart items:", deleteError);
        return false;
      }

      // Skip if there are no items to add
      if (!cart.items || cart.items.length === 0) {
        return true;
      }

      // Prepare cart items for insertion
      const cartItemsToInsert = await Promise.all(
        cart.items.map(async (item) => {
          // Fetch product data to ensure price accuracy
          const { data: product } = await supabase
            .from("products")
            .select("id, price, sale_price")
            .eq("id", item.productId)
            .single();

          return {
            cart_id: cartId,
            product_id: item.productId,
            quantity: item.quantity
          };
        })
      );

      // Insert cart items
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert(cartItemsToInsert);

      if (insertError) {
        console.error("Error inserting cart items:", insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in saveCartToDatabase:", error);
      return false;
    }
  },

  /**
   * Merge local cart with database cart
   * Strategy: Keep items from both carts, preferring the newer one for duplicates
   */
  mergeLocalAndServerCarts(localCart, serverCart) {
    if (!serverCart || !serverCart.items || serverCart.items.length === 0) {
      return localCart;
    }

    if (!localCart || !localCart.items || localCart.items.length === 0) {
      return serverCart;
    }

    // Create a map of product IDs to items from both carts
    const productMap = new Map();

    // Add local cart items to the map
    localCart.items.forEach((item) => {
      productMap.set(item.productId, { ...item, source: "local" });
    });

    // Add or update with server cart items
    serverCart.items.forEach((item) => {
      if (productMap.has(item.productId)) {
        // Item exists in both carts
        const localItem = productMap.get(item.productId);
        
        // Use the item with the higher quantity
        if (item.quantity > localItem.quantity) {
          productMap.set(item.productId, { ...item, source: "server" });
        }
      } else {
        // Item only exists in server cart
        productMap.set(item.productId, { ...item, source: "server" });
      }
    });

    // Convert the map back to an array
    const mergedItems = Array.from(productMap.values());
    
    return {
      items: mergedItems,
      lastUpdated: new Date().toISOString()
    };
  },

  /**
   * Sync the local cart with the server for logged in users
   */
  async syncCart(userId) {
    if (!userId) return null;
    
    try {
      // Get local cart
      const localCart = this.getLocalCart();
      
      // Get server cart
      const serverCart = await this.getCartFromDatabase(userId);
      
      // Merge carts (local cart takes precedence for duplicates)
      const mergedCart = this.mergeLocalAndServerCarts(localCart, serverCart);
      
      // Save the merged cart locally
      this.saveLocalCart(mergedCart);
      
      // Save the merged cart to the server
      await this.saveCartToDatabase(userId, mergedCart);
      
      return mergedCart;
    } catch (error) {
      console.error("Error syncing cart:", error);
      return this.getLocalCart();
    }
  }
};
