# Step 3: Database Architecture (Supabase)

This document provides detailed instructions for setting up and configuring your database architecture using Supabase for the multi-vendor e-commerce platform.

## Prerequisites

Ensure you have the following:
- Supabase account (https://supabase.com)
- Access to Supabase dashboard
- Basic understanding of SQL and database design
- Project setup from Steps 1 and 2

## 1. Design Database Schema

In this section, we'll design the database schema for our multi-vendor marketplace, including all required tables and their relationships.

### 1.1 Create a new Supabase Project

1. Log in to your Supabase account at https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: "Cameroon Marketplace"
   - Database Password: Create a secure password
   - Region: Choose the region closest to Cameroon (likely eu-west-1)
4. Click "Create new project"

### 1.2 Core Tables Schema

Let's create the core tables for our database. Access the SQL Editor from the Supabase dashboard and run the following SQL commands:

```sql
-- Users table (extends Supabase Auth users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY REFERENCES auth.users,
  store_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  stripe_account_id TEXT,
  store_address TEXT,
  store_city TEXT,
  store_country TEXT,
  store_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_digital BOOLEAN NOT NULL DEFAULT FALSE,
  digital_url TEXT,
  weight DECIMAL(10,2),
  dimensions JSON,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Images table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_address JSON NOT NULL,
  billing_address JSON NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Carts table
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Cart Items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);
```

### 1.3 Additional Tables for Extended Features

Now let's add additional tables for extended features like coupons, wishlists, and more:

```sql
-- Coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(12,2),
  max_discount_amount DECIMAL(12,2),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vendor Payouts table
CREATE TABLE public.vendor_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  payout_method TEXT NOT NULL,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  product_id UUID NOT NULL REFERENCES public.products(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product Attributes table
CREATE TABLE public.product_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Product Attribute Values table
CREATE TABLE public.product_attribute_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.product_attributes(id),
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, attribute_id)
);
```

### 1.4 Add Indexes for Performance

Let's add indexes to improve query performance:

```sql
-- Create indexes for better performance
CREATE INDEX idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_vendor_id ON public.order_items(vendor_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
```

## 2. Configure Relationships Between Entities

Supabase automatically handles the foreign key constraints we've defined in the SQL above. Let's visualize these relationships for clarity:

### 2.1 Key Relationships

- **User → Vendor**: One-to-One (User with vendor role can have one vendor profile)
- **Vendor → Products**: One-to-Many (A vendor can have many products)
- **Category → Products**: One-to-Many (A category can have many products)
- **Category → Subcategories**: One-to-Many (A category can have many subcategories)
- **Product → Product Images**: One-to-Many (A product can have many images)
- **Product → Reviews**: One-to-Many (A product can have many reviews)
- **User → Orders**: One-to-Many (A user can have many orders)
- **Order → Order Items**: One-to-Many (An order can have many order items)
- **Vendor → Order Items**: One-to-Many (A vendor can fulfill many order items)
- **User → Notifications**: One-to-Many (A user can have many notifications)
- **User → Cart**: One-to-One (A user has one cart)
- **Cart → Cart Items**: One-to-Many (A cart can have many cart items)

### 2.2 Enable Foreign Key Constraints

Foreign key constraints are defined in our table creation scripts, but let's double-check that they're working correctly:

1. Go to the Supabase dashboard
2. Navigate to "Database" → "Tables"
3. Click on any table that contains foreign keys
4. Check the "Relationships" tab to see the connections between tables

### 2.3 Set On Delete Behaviors

We've already specified some ON DELETE behaviors in our schema. Here's a summary of what's configured:

- `ON DELETE CASCADE`: When a parent record is deleted, all related child records are deleted automatically.
  - Product Images when Product is deleted
  - Order Items when Order is deleted
  - Cart Items when Cart is deleted
  - Product Attribute Values when Product is deleted

- `No Action` (default): Prevents deletion of parent record if child records exist.
  - Cannot delete Users with Orders
  - Cannot delete Products with Reviews
  - Cannot delete Vendors with Products or Orders

## 3. Setup Supabase Authentication System

### 3.1 Configure Authentication Providers

1. Navigate to "Authentication" → "Providers" in the Supabase dashboard
2. Enable the authentication methods you want to support:

   **Email/Password (default):**
   - Enable "Email confirmations" for security
   - Enable "Secure email change" for enhanced security
   - Keep the default email template or customize it for your brand

   **Optional - Google OAuth:**
   - Toggle "Google" to enabled
   - Create a Google OAuth application at https://console.developers.google.com
   - Enter your Client ID and Client Secret

   **Optional - Facebook OAuth:**
   - Toggle "Facebook" to enabled
   - Create a Facebook app at https://developers.facebook.com
   - Enter your OAuth Client ID and Secret

### 3.2 Configure Authentication Settings

1. Navigate to "Authentication" → "Settings"
2. Configure the following settings:

   **User Signups:**
   - Enable or disable open signups based on your needs
   - For a production system, enable "Enable email confirmations"

   **Security:**
   - Set minimum password strength
   - Enable captcha protection (recommended)

   **Emails:**
   - Customize the sender name and email
   - Update email templates for branding consistency

### 3.3 Create Function to Automatically Create User Profiles

When a user signs up through Supabase Auth, we need to automatically create a record in our users table:

```sql
-- Create a trigger function to create a user profile upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', COALESCE(new.raw_user_meta_data->>'role', 'customer'));
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to create a vendor profile when role is vendor
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'vendor' THEN
    INSERT INTO public.vendors (id, store_name, description, status)
    VALUES (NEW.id, 'Store ' || (SELECT first_name FROM users WHERE id = NEW.id), 'New vendor store', 'pending');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user profile is created
CREATE OR REPLACE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();
```

### 3.4 Create Function to Handle User Profile Updates

```sql
-- Create a function to update auth.users when public.users is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'first_name', NEW.first_name,
    'last_name', NEW.last_name,
    'role', NEW.role
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a user profile is updated
CREATE OR REPLACE TRIGGER on_public_user_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
```

### 3.5 Create a Function to Create a Cart for New Users

```sql
-- Create a function to create a cart for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_cart()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.carts (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user profile is created
CREATE OR REPLACE TRIGGER on_user_created_create_cart
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_cart();
```

## 4. Implement Database Access Policies and Security Rules

Supabase uses Postgres Row Level Security (RLS) policies to control access to data. Let's set up policies for our tables:

### 4.1 Enable Row Level Security on All Tables

First, let's enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
```

### 4.2 Create Policies for Users Table

```sql
-- Users can read their own profile
CREATE POLICY "Users can read their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Admin can read all users
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Admin can create users
CREATE POLICY "Admins can create users"
ON public.users
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Admin can update any user
CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

### 4.3 Create Policies for Vendors Table

```sql
-- Vendor can read their own profile
CREATE POLICY "Vendors can read their own profile"
ON public.vendors
FOR SELECT
USING (auth.uid() = id);

-- Vendor can update their own profile
CREATE POLICY "Vendors can update their own profile"
ON public.vendors
FOR UPDATE
USING (auth.uid() = id);

-- Admin can read all vendors
CREATE POLICY "Admins can read all vendor profiles"
ON public.vendors
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Admin can update any vendor
CREATE POLICY "Admins can update any vendor"
ON public.vendors
FOR UPDATE
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Anyone can read approved vendors
CREATE POLICY "Anyone can read approved vendors"
ON public.vendors
FOR SELECT
USING (status = 'approved');
```

### 4.4 Create Policies for Products Table

```sql
-- Anyone can read published products
CREATE POLICY "Anyone can read published products"
ON public.products
FOR SELECT
USING (status = 'published');

-- Vendors can read their own products
CREATE POLICY "Vendors can read their own products"
ON public.products
FOR SELECT
USING (vendor_id = auth.uid());

-- Vendors can create their own products
CREATE POLICY "Vendors can create their own products"
ON public.products
FOR INSERT
WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own products
CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
USING (vendor_id = auth.uid());

-- Vendors can delete their own products
CREATE POLICY "Vendors can delete their own products"
ON public.products
FOR DELETE
USING (vendor_id = auth.uid());

-- Admin can read all products
CREATE POLICY "Admins can read all products"
ON public.products
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Admin can update any product
CREATE POLICY "Admins can update any product"
ON public.products
FOR UPDATE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Admin can delete any product
CREATE POLICY "Admins can delete any product"
ON public.products
FOR DELETE
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

### 4.5 Create Policies for Other Tables

Setting up policies for all tables would make this document too long. Here's guidance on creating policies for the remaining tables:

1. **Categories**: Public read, admin write
2. **Product Images**: Public read, vendor write (their products), admin write
3. **Orders**: Customer read (own orders), admin read all
4. **Order Items**: Customer read (own orders), vendor read (own products), admin read all
5. **Reviews**: Public read, owner write, admin moderate
6. **Notifications**: User read (own notifications)
7. **Carts**: User read/write (own cart)
8. **Cart Items**: User read/write (own cart)

## 5. Configure Row-Level Security for Multi-Vendor Model

Let's set up a specific example for the multi-vendor aspect of our platform:

### 5.1 Vendor Sales Data Security

We need to ensure vendors can only see their own sales data:

```sql
-- Create a view for vendor sales analytics
CREATE OR REPLACE VIEW vendor_sales_analytics AS
SELECT 
  vendor_id,
  DATE_TRUNC('day', oi.created_at) AS date,
  COUNT(DISTINCT oi.order_id) AS order_count,
  SUM(oi.quantity) AS items_sold,
  SUM(oi.total) AS total_sales,
  AVG(oi.price) AS average_item_price
FROM 
  public.order_items oi
JOIN 
  public.orders o ON oi.order_id = o.id
WHERE 
  o.status != 'cancelled' AND o.payment_status = 'paid'
GROUP BY 
  vendor_id, DATE_TRUNC('day', oi.created_at);

-- Create policy for vendor sales analytics
CREATE POLICY "Vendors can only see their own sales data"
ON vendor_sales_analytics
FOR SELECT
USING (vendor_id = auth.uid());

-- Admin can see all vendor sales data
CREATE POLICY "Admins can see all vendor sales data"
ON vendor_sales_analytics
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

### 5.2 Secure Vendor-Specific Order Information

```sql
-- Create a view for vendor orders
CREATE OR REPLACE VIEW vendor_orders AS
SELECT 
  oi.id AS order_item_id,
  oi.order_id,
  oi.product_id,
  oi.vendor_id,
  oi.quantity,
  oi.price,
  oi.total,
  oi.status AS item_status,
  o.status AS order_status,
  o.payment_status,
  o.shipping_address,
  oi.created_at,
  oi.updated_at
FROM 
  public.order_items oi
JOIN 
  public.orders o ON oi.order_id = o.id;

-- Create policy for vendor orders
CREATE POLICY "Vendors can only see their own orders"
ON vendor_orders
FOR SELECT
USING (vendor_id = auth.uid());

-- Admin can see all orders
CREATE POLICY "Admins can see all orders"
ON vendor_orders
FOR SELECT
USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

### 5.3 Create Functions for Vendor Status Changes

```sql
-- Function to handle vendor status change
CREATE OR REPLACE FUNCTION handle_vendor_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If vendor is approved, add vendor role to user
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.users
    SET role = 'vendor'
    WHERE id = NEW.id;
    
    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (NEW.id, 'vendor_approval', 'Vendor Application Approved', 
            'Congratulations! Your vendor application has been approved. You can now start selling products on our platform.');
  
  -- If vendor is rejected, ensure role is customer and create notification
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE public.users
    SET role = 'customer'
    WHERE id = NEW.id;
    
    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (NEW.id, 'vendor_rejection', 'Vendor Application Rejected', 
            'Unfortunately, your vendor application has been rejected. Please contact support for more information.');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for vendor status change
CREATE OR REPLACE TRIGGER on_vendor_status_change
  AFTER UPDATE ON public.vendors
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_vendor_status_change();
```

## 6. Design Image Storage Structure

Supabase provides a Storage service for file uploads. Let's configure it for our e-commerce platform.

### 6.1 Create Storage Buckets

Navigate to "Storage" in the Supabase dashboard and create the following buckets:

1. **product-images**
   - Purpose: Store product images
   - Visibility: Public (with RLS)

2. **vendor-assets**
   - Purpose: Store vendor logos and banners
   - Visibility: Public (with RLS)

3. **user-avatars**
   - Purpose: Store user profile pictures
   - Visibility: Public (with RLS)

4. **private-documents**
   - Purpose: Store private documents like invoices
   - Visibility: Private (with RLS)

### 6.2 Configure Storage Security Policies

For the **product-images** bucket:

```sql
-- Anyone can read product images
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'product-images' AND 
  ((storage.foldername(name))[1] = 'public')
);

-- Vendors can upload to their own folder
CREATE POLICY "Vendors can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND 
  ((storage.foldername(name))[1] = (auth.uid())::text)
);

-- Vendors can update their own images
CREATE POLICY "Vendors can update their images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' AND 
  ((storage.foldername(name))[1] = (auth.uid())::text)
);

-- Vendors can delete their own images
CREATE POLICY "Vendors can delete their images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' AND 
  ((storage.foldername(name))[1] = (auth.uid())::text)
);

-- Admin can do everything with product images
CREATE POLICY "Admin can manage all product images"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'product-images' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

For the **vendor-assets** bucket:

```sql
-- Anyone can read vendor assets
CREATE POLICY "Anyone can view vendor assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vendor-assets'
);

-- Vendors can upload to their own folder
CREATE POLICY "Vendors can upload their assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-assets' AND 
  ((storage.foldername(name))[1] = (auth.uid())::text)
);

-- Vendors can update their own assets
CREATE POLICY "Vendors can update their assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vendor-assets' AND 
  ((storage.foldername(name))[1] = (auth.uid())::text)
);

-- Vendors can delete their own assets
CREATE POLICY "Vendors can delete their assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vendor-assets' AND 
  ((storage.foldername(name))[1] = (auth.uid())::text)
);
```

For the **user-avatars** bucket:

```sql
-- Anyone can read user avatars
CREATE POLICY "Anyone can view user avatars"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'user-avatars'
);

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-avatars' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'user-avatars' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);
```

For the **private-documents** bucket:

```sql
-- Users can view their own documents
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'private-documents' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Users can upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'private-documents' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'private-documents' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'private-documents' AND 
  (storage.foldername(name))[1] = (auth.uid())::text
);

-- Admin can access all private documents
CREATE POLICY "Admin can access all private documents"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'private-documents' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

### 6.3 Creating a File Upload Utility in Client Code

Here's a utility function for the client to upload images to Supabase storage:

```javascript
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\utils\fileUpload.js
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to Supabase Storage
 * 
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder within the bucket
 * @param {string} [existingPath] - Optional existing file path to replace
 * @returns {Promise<{path: string, url: string}>} - The file path and public URL
 */
export const uploadFile = async (file, bucket, folder, existingPath = null) => {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // If we're replacing an existing file, delete it first
    if (existingPath) {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([existingPath]);
      
      if (deleteError) {
        console.error('Error deleting existing file:', deleteError);
      }
    }

    // Upload the new file
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: data.publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 * 
 * @param {File[]} files - Array of files to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} folder - The folder within the bucket
 * @returns {Promise<Array<{path: string, url: string}>>} - Array of file paths and URLs
 */
export const uploadMultipleFiles = async (files, bucket, folder) => {
  const uploadPromises = files.map(file => uploadFile(file, bucket, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Supabase Storage
 * 
 * @param {string} path - The file path to delete
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<void>}
 */
export const deleteFile = async (path, bucket) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
```

## 7. Setup Email Templates and Triggers for Notifications

Supabase offers email functionality through their Auth module. For a more comprehensive email solution, we can set up database triggers that call webhooks for sending emails.

### 7.1 Configure Supabase Auth Email Templates

1. Navigate to Authentication → Email Templates in the Supabase dashboard
2. Update the following templates with branded content for your marketplace:
   - Confirmation Email
   - Invite Email
   - Magic Link Email
   - Reset Password Email
   - Change Email Address

### 7.2 Create Database Triggers for Email Notifications

First, let's create an emails table to store email templates:

```sql
-- Create an email_templates table
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert some default email templates
INSERT INTO public.email_templates (name, subject, body)
VALUES 
  ('order_confirmation', 'Your Order Confirmation', '<h1>Thank you for your order!</h1><p>Your order #{{order_id}} has been received and is being processed.</p>'),
  ('order_status_update', 'Order Status Update', '<h1>Your Order Status Has Changed</h1><p>Your order #{{order_id}} is now {{status}}.</p>'),
  ('vendor_application', 'Vendor Application Received', '<h1>We Have Received Your Vendor Application</h1><p>Dear {{name}}, your application to become a vendor on our platform has been received and is being reviewed.</p>'),
  ('vendor_approval', 'Vendor Application Approved', '<h1>Congratulations! Your Vendor Application is Approved</h1><p>Dear {{name}}, your application to become a vendor on our platform has been approved. You can now start selling products.</p>');
```

Now, let's create a table to queue emails for sending:

```sql
-- Create an email_queue table
CREATE TABLE public.email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Next, let's create functions to enqueue emails for various events:

```sql
-- Function to send order confirmation email
CREATE OR REPLACE FUNCTION enqueue_order_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  template_subject TEXT;
  template_body TEXT;
  order_data JSONB;
BEGIN
  -- Get recipient email
  SELECT email INTO user_email FROM public.users WHERE id = NEW.user_id;
  
  -- Get email template
  SELECT subject, body INTO template_subject, template_body 
  FROM public.email_templates 
  WHERE name = 'order_confirmation';
  
  -- Prepare order data
  SELECT jsonb_build_object(
    'order_id', NEW.id,
    'order_total', NEW.total_amount,
    'shipping_address', NEW.shipping_address,
    'order_date', NEW.created_at
  ) INTO order_data;
  
  -- Queue email
  INSERT INTO public.email_queue (recipient, subject, body, data)
  VALUES (
    user_email,
    template_subject,
    template_body,
    order_data
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order confirmation
CREATE OR REPLACE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION enqueue_order_confirmation_email();

-- Function to send order status update email
CREATE OR REPLACE FUNCTION enqueue_order_status_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  template_subject TEXT;
  template_body TEXT;
  order_data JSONB;
BEGIN
  -- Only send on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get recipient email
  SELECT email INTO user_email FROM public.users WHERE id = NEW.user_id;
  
  -- Get email template
  SELECT subject, body INTO template_subject, template_body 
  FROM public.email_templates 
  WHERE name = 'order_status_update';
  
  -- Prepare order data
  SELECT jsonb_build_object(
    'order_id', NEW.id,
    'status', NEW.status,
    'order_date', NEW.created_at,
    'updated_date', NEW.updated_at
  ) INTO order_data;
  
  -- Queue email
  INSERT INTO public.email_queue (recipient, subject, body, data)
  VALUES (
    user_email,
    template_subject,
    template_body,
    order_data
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status updates
CREATE OR REPLACE TRIGGER on_order_status_changed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION enqueue_order_status_email();
```

### 7.3 Create Edge Function to Process Email Queue

Create an Edge Function in Supabase to process the email queue and send emails. First, navigate to "Edge Functions" and create a new function called "process-email-queue".

```javascript
// Supabase Edge Function: process-email-queue

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client using Deno runtime environment variables
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get pending emails
    const { data: emails, error: fetchError } = await supabaseClient
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (fetchError) {
      throw fetchError
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending emails found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Configure SMTP client
    const client = new SmtpClient({
      connection: {
        hostname: Deno.env.get('SMTP_HOST') ?? '',
        port: parseInt(Deno.env.get('SMTP_PORT') ?? '587'),
        tls: true,
        auth: {
          username: Deno.env.get('SMTP_USERNAME') ?? '',
          password: Deno.env.get('SMTP_PASSWORD') ?? '',
        },
      },
    });

    const results = [];

    // Process each email
    for (const email of emails) {
      try {
        // Replace template variables with actual data
        let body = email.body;
        if (email.data) {
          for (const [key, value] of Object.entries(email.data)) {
            body = body.replace(`{{${key}}}`, value);
          }
        }

        // Send email
        await client.send({
          from: Deno.env.get('FROM_EMAIL') ?? 'noreply@cameroonmarketplace.com',
          to: email.recipient,
          subject: email.subject,
          content: 'text/html',
          html: body,
        });

        // Update email status to sent
        const { error: updateError } = await supabaseClient
          .from('email_queue')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', email.id);

        if (updateError) {
          throw updateError;
        }

        results.push({ id: email.id, success: true });
      } catch (error) {
        // Update email status to failed with error message
        const { error: updateError } = await supabaseClient
          .from('email_queue')
          .update({ 
            status: 'failed', 
            error: error.message,
            updated_at: new Date().toISOString() 
          })
          .eq('id', email.id);

        results.push({ id: email.id, success: false, error: error.message });
      }
    }

    await client.close();

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### 7.4 Set Up Scheduled Function Execution

To process emails regularly, set up a scheduled job to call your edge function:

1. Navigate to "Edge Functions" → "Schedules"
2. Create a new schedule:
   - Name: "Process Email Queue"
   - Cron Expression: `*/5 * * * *` (runs every 5 minutes)
   - Function: "process-email-queue"
   - HTTP Method: POST

## 8. Implement Backup and Recovery Strategy

Supabase offers automatic backups, but we should also implement our own backup strategy for critical data.

### 8.1 Configure Supabase Backups

1. Navigate to "Project Settings" → "Database"
2. Check the backup settings. Supabase provides:
   - Daily backups (retained for 7 days)
   - Point-in-time recovery (PITR) is available on paid plans

### 8.2 Create a Database Export Function

Create a new Edge Function for database exports:

```javascript
// Supabase Edge Function: export-database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check authorization - only admin should be able to export data
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify admin role
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Get user role
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin role required' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Define tables to export
    const tables = [
      'users',
      'vendors',
      'categories',
      'products',
      'product_images',
      'orders',
      'order_items',
      'reviews',
    ]

    // Export data from each table
    const exportData = {}
    for (const table of tables) {
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      exportData[table] = data
    }

    // Generate a filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `cameroon_marketplace_export_${date}.json`

    // Store the export in Supabase Storage
    const { error: uploadError } = await supabaseClient
      .storage
      .from('database-backups')
      .upload(filename, JSON.stringify(exportData), {
        contentType: 'application/json',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Log the export
    await supabaseClient
      .from('backup_logs')
      .insert({
        filename,
        created_by: user.id,
        tables_included: tables,
        record_counts: Object.fromEntries(
          Object.entries(exportData).map(([table, data]) => [table, data.length])
        )
      })

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: 'Database export completed successfully', 
        filename,
        tables: tables,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### 8.3 Set Up a Backup Log Table

```sql
-- Create a table to log database exports
CREATE TABLE public.backup_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id),
  tables_included TEXT[] NOT NULL,
  record_counts JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 8.4 Create a Storage Bucket for Backups

1. Navigate to "Storage" in the Supabase dashboard
2. Create a new bucket:
   - Name: "database-backups"
   - Visibility: Private
   
3. Set up appropriate RLS policies:

```sql
-- Only admin can access database backups
CREATE POLICY "Only admin can access database backups"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'database-backups' AND
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

### 8.5 Schedule Regular Backups

1. Navigate to "Edge Functions" → "Schedules"
2. Create a new schedule:
   - Name: "Weekly Database Export"
   - Cron Expression: `0 0 * * 0` (runs every Sunday at midnight)
   - Function: "export-database"
   - HTTP Method: POST

### 8.6 Create a Restoration Function

For data restoration, we should create a function to restore data from backups:

```javascript
// Supabase Edge Function: restore-database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const { filename, tables } = await req.json()

    // Validate request
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Filename is required' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Check authorization - only admin should be able to restore data
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify admin role
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Get user role
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized - Admin role required' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Download the backup file
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('database-backups')
      .download(filename)

    if (downloadError) {
      return new Response(JSON.stringify({ error: `Failed to download backup: ${downloadError.message}` }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Parse the JSON content
    const text = await fileData.text()
    const backupData = JSON.parse(text)

    // Determine which tables to restore (all or specified)
    const tablesToRestore = tables || Object.keys(backupData)

    // Restore each table
    const restorationResults = {}
    for (const table of tablesToRestore) {
      if (backupData[table]) {
        try {
          // First delete existing data if specified
          if (req.query.get('clearFirst') === 'true') {
            await supabaseClient
              .from(table)
              .delete()
              .not('id', 'is', null) // Safety check to make sure we have a condition
          }

          // Insert the backup data
          const { error } = await supabaseClient
            .from(table)
            .upsert(backupData[table], { onConflict: 'id' })

          restorationResults[table] = {
            success: !error,
            message: error ? error.message : `Restored ${backupData[table].length} records`,
            count: backupData[table].length
          }
        } catch (error) {
          restorationResults[table] = {
            success: false,
            message: error.message
          }
        }
      } else {
        restorationResults[table] = {
          success: false,
          message: 'Table not found in backup'
        }
      }
    }

    // Log the restoration
    await supabaseClient
      .from('restoration_logs')
      .insert({
        backup_filename: filename,
        restored_by: user.id,
        tables_restored: tablesToRestore,
        results: restorationResults
      })

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: 'Database restoration completed', 
        results: restorationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### 8.7 Create a Restoration Log Table

```sql
-- Create a table to log database restorations
CREATE TABLE public.restoration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_filename TEXT NOT NULL,
  restored_by UUID NOT NULL REFERENCES public.users(id),
  tables_restored TEXT[] NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Conclusion

You have now set up a comprehensive database architecture using Supabase for your multi-vendor e-commerce platform. This includes:

1. A well-designed schema with proper relationships between entities
2. A robust authentication system with role-based access control
3. Comprehensive security policies to protect your data
4. A structured approach to file storage
5. Email notification templates and triggers
6. A backup and recovery strategy for your data

In the next step, we will focus on frontend development with React, implementing the user interfaces for customers, vendors, and administrators.