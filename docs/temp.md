# Database Security Policies

This document outlines the Row Level Security (RLS) policies for key tables in our Supabase database.

## 1. Categories Table Policies

```sql
-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories
FOR SELECT
USING (true);

-- Only admin can create categories
CREATE POLICY "Admin can create categories"
ON public.categories
FOR INSERT
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admin can update categories
CREATE POLICY "Admin can update categories"
ON public.categories
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admin can delete categories
CREATE POLICY "Admin can delete categories"
ON public.categories
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 2. Product Images Table Policies

```sql
-- Enable RLS on product_images table
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public read access for product images
CREATE POLICY "Product images are viewable by everyone"
ON public.product_images
FOR SELECT
USING (true);

-- Vendors can add images to their own products
CREATE POLICY "Vendors can add images to their own products"
ON public.product_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE
      products.id = product_images.product_id AND
      products.vendor_id = auth.uid()
  )
);

-- Vendors can update images of their own products
CREATE POLICY "Vendors can update images of their own products"
ON public.product_images
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE
      products.id = product_images.product_id AND
      products.vendor_id = auth.uid()
  )
);

-- Vendors can delete images of their own products
CREATE POLICY "Vendors can delete images of their own products"
ON public.product_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE
      products.id = product_images.product_id AND
      products.vendor_id = auth.uid()
  )
);

-- Admin can manage all product images
CREATE POLICY "Admin can manage all product images"
ON public.product_images
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 3. Orders Table Policies

```sql
-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Admin can view all orders
CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only authenticated users can create orders
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Customers can only update their own orders (limited fields)
CREATE POLICY "Customers can update their own orders"
ON public.orders
FOR UPDATE
USING (
  auth.uid() = user_id AND
  (SELECT status FROM public.orders WHERE id = orders.id) = 'pending'
);

-- Admin can update any order
CREATE POLICY "Admin can update any order"
ON public.orders
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admin can delete orders
CREATE POLICY "Only admin can delete orders"
ON public.orders
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 4. Order Items Table Policies

```sql
-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view items from their own orders
CREATE POLICY "Customers can view items from their own orders"
ON public.order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE
      orders.id = order_items.order_id AND
      orders.user_id = auth.uid()
  )
);

-- Vendors can view items containing their products
CREATE POLICY "Vendors can view items containing their products"
ON public.order_items
FOR SELECT
USING (vendor_id = auth.uid());

-- Admin can view all order items
CREATE POLICY "Admin can view all order items"
ON public.order_items
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Order items are created along with orders
CREATE POLICY "System can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE
      orders.id = order_items.order_id AND
      orders.user_id = auth.uid()
  )
);

-- Vendors can update status of their own order items
CREATE POLICY "Vendors can update their own order items"
ON public.order_items
FOR UPDATE
USING (
  vendor_id = auth.uid() AND
  (
    NEW.status = 'processing' OR
    NEW.status = 'shipped' OR
    NEW.status = 'delivered'
  )
);

-- Admin can update any order item
CREATE POLICY "Admin can update any order item"
ON public.order_items
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admin can delete order items
CREATE POLICY "Only admin can delete order items"
ON public.order_items
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 5. Reviews Table Policies

```sql
-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public read access for approved reviews
CREATE POLICY "Approved reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (is_approved = true);

-- Users can see all their own reviews regardless of status
CREATE POLICY "Users can view their own reviews"
ON public.reviews
FOR SELECT
USING (user_id = auth.uid());

-- Admin can see all reviews
CREATE POLICY "Admin can view all reviews"
ON public.reviews
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Users can create reviews
CREATE POLICY "Users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Users can only update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin can update any review (for moderation)
CREATE POLICY "Admin can update any review"
ON public.reviews
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (user_id = auth.uid());

-- Admin can delete any review
CREATE POLICY "Admin can delete any review"
ON public.reviews
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 6. Notifications Table Policies

```sql
-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' OR user_id = auth.uid());

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid() AND (OLD.is_read = false AND NEW.is_read = true));

-- Admin can update any notification
CREATE POLICY "Admin can update any notification"
ON public.notifications
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admin can delete notifications
CREATE POLICY "Only admin can delete notifications"
ON public.notifications
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 7. Carts Table Policies

```sql
-- Enable RLS on carts table
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own cart
CREATE POLICY "Users can view their own cart"
ON public.carts
FOR SELECT
USING (user_id = auth.uid());

-- Users can only create their own cart
CREATE POLICY "Users can create their own cart"
ON public.carts
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own cart
CREATE POLICY "Users can update their own cart"
ON public.carts
FOR UPDATE
USING (user_id = auth.uid());

-- Admin can view and manage all carts
CREATE POLICY "Admin can manage all carts"
ON public.carts
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

## 8. Cart Items Table Policies

```sql
-- Enable RLS on cart_items table
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can view items in their own cart
CREATE POLICY "Users can view items in their own cart"
ON public.cart_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE
      carts.id = cart_items.cart_id AND
      carts.user_id = auth.uid()
  )
);

-- Users can add items to their own cart
CREATE POLICY "Users can add items to their own cart"
ON public.cart_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE
      carts.id = cart_items.cart_id AND
      carts.user_id = auth.uid()
  )
);

-- Users can update items in their own cart
CREATE POLICY "Users can update items in their own cart"
ON public.cart_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE
      carts.id = cart_items.cart_id AND
      carts.user_id = auth.uid()
  )
);

-- Users can delete items from their own cart
CREATE POLICY "Users can delete items from their own cart"
ON public.cart_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE
      carts.id = cart_items.cart_id AND
      carts.user_id = auth.uid()
  )
);

-- Admin can manage all cart items
CREATE POLICY "Admin can manage all cart items"
ON public.cart_items
FOR ALL
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```
