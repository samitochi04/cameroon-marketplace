# Frontend UI Implementation Plan

This document outlines the implementation details for the remaining frontend UI components and features for our multi-vendor e-commerce platform.

## Table of Contents

- [State Management Solution](#state-management-solution)
- [Customer-facing Storefront](#customer-facing-storefront)
- [Vendor Dashboard](#vendor-dashboard)
- [Admin Management Console](#admin-management-console)
- [Shopping Cart Functionality](#shopping-cart-functionality)
- [Checkout Process with Kora Pay](#checkout-process-with-kora-pay)

## State Management Solution

We'll use a combination of React Context API for global state management and custom hooks for more localized state management needs.

### Global State Management Files

#### Authentication Context

- **File**: `src/context/AuthContext.jsx`
- **Purpose**: Manages user authentication state across the application
- **Dependencies**: `@supabase/supabase-js`, React hooks
- **Connected to**: Used by `MainLayout`, account pages, protected routes
- **Key functionality**:
  - User login/logout functions
  - User information storage
  - Authentication state (isAuthenticated, isLoading)
  - Role-based checks (isVendor, isAdmin)

```jsx
// Implementation overview
// - createContext with initial state
// - AuthProvider component with auth state and methods
// - useAuth hook to consume the context
```

#### Cart Context

- **File**: `src/context/CartContext.jsx`
- **Purpose**: Manages shopping cart state globally
- **Dependencies**: React hooks, Supabase client, LocalStorage
- **Connected to**: Cart components, product pages, checkout flow
- **Key functionality**:
  - Add/remove items from cart
  - Update item quantities
  - Calculate totals
  - Persist cart in localStorage
  - Sync cart with database for logged-in users

#### UI Context

- **File**: `src/context/UIContext.jsx`
- **Purpose**: Manages global UI state like modals, sidebar visibility, etc.
- **Dependencies**: React hooks
- **Connected to**: Layout components, modals, sidebar
- **Key functionality**:
  - Toggle mobile menu
  - Control modal visibility
  - Manage toast notifications

### Custom Hooks

#### API Hooks

- **File**: `src/hooks/useApi.js`
- **Purpose**: Centralized API call management and error handling
- **Dependencies**: `axios`, React hooks
- **Connected to**: Service functions, data fetching components
- **Exports**: `useGet`, `usePost`, `usePut`, `useDelete` hooks

#### Product Hooks

- **File**: `src/hooks/useProducts.js`
- **Purpose**: Manages product data fetching and manipulation
- **Dependencies**: `useApi` hook
- **Connected to**: Product components, search, filtering
- **Key functionality**:
  - Fetch products with filtering and pagination
  - Search products
  - Get product details

#### Category Hooks

- **File**: `src/hooks/useCategories.js`
- **Purpose**: Manages category data
- **Dependencies**: `useApi` hook
- **Connected to**: Navigation components, product filters

#### Vendor Hooks

- **File**: `src/hooks/useVendor.js`
- **Purpose**: Vendor-specific functionality
- **Dependencies**: `useApi` hook, `AuthContext`
- **Connected to**: Vendor dashboard components

#### Admin Hooks

- **File**: `src/hooks/useAdmin.js`
- **Purpose**: Admin-specific functionality
- **Dependencies**: `useApi` hook, `AuthContext`
- **Connected to**: Admin dashboard components

## Customer-facing Storefront

### Page Components

#### Home Page

- **File**: `src/pages/HomePage/HomePage.jsx`
- **Purpose**: Landing page for customers
- **Dependencies**: React components, `useProducts` hook
- **Connected to**: Navigation, featured products, categories
- **Key functionality**:
  - Hero section
  - Featured products slider
  - Categories showcase
  - Top vendors
  - Special offers

#### Product Listing Page

- **File**: `src/pages/ProductsPage/ProductsPage.jsx`
- **Purpose**: Display product listings with filters and search
- **Dependencies**: `useProducts` hook, UI components
- **Connected to**: Product cards, filter components
- **Key functionality**:
  - Product grid with pagination
  - Filter by category, price, rating
  - Sort options
  - Search integration

#### Product Detail Page

- **File**: `src/pages/ProductDetailPage/ProductDetailPage.jsx`
- **Purpose**: Detailed view of a single product
- **Dependencies**: `useProducts` hook, `CartContext`
- **Connected to**: Product reviews, related products
- **Key functionality**:
  - Product images gallery
  - Product information
  - Add to cart functionality
  - Reviews section
  - Related products

#### Vendor Store Page

- **File**: `src/pages/VendorStorePage/VendorStorePage.jsx`
- **Purpose**: Display a vendor's store and products
- **Dependencies**: `useApi` hook for vendor data
- **Connected to**: Product components, vendor info
- **Key functionality**:
  - Vendor information and banner
  - Vendor's products
  - Vendor ratings and reviews

#### Category Page

- **File**: `src/pages/CategoryPage/CategoryPage.jsx`
- **Purpose**: Show products in a specific category
- **Dependencies**: `useCategories`, `useProducts` hooks
- **Connected to**: Product listing components

#### Search Results Page

- **File**: `src/pages/SearchResultsPage/SearchResultsPage.jsx`
- **Purpose**: Display search results
- **Dependencies**: `useProducts` hook with search params
- **Connected to**: Search bar component, product list

### Shared Components

#### Product Card Component

- **File**: `src/components/products/ProductCard/ProductCard.jsx`
- **Purpose**: Reusable product card display
- **Dependencies**: `CartContext`
- **Connected to**: Product pages, product listings

#### Product Grid Component

- **File**: `src/components/products/ProductGrid/ProductGrid.jsx`
- **Purpose**: Grid layout for product cards
- **Dependencies**: ProductCard component
- **Connected to**: Product listing pages

#### Filter Sidebar Component

- **File**: `src/components/products/FilterSidebar/FilterSidebar.jsx`
- **Purpose**: Product filtering options
- **Dependencies**: `useCategories` hook
- **Connected to**: Product listing pages

#### Category Navigation Component

- **File**: `src/components/common/CategoryNav/CategoryNav.jsx`
- **Purpose**: Navigation for product categories
- **Dependencies**: `useCategories` hook
- **Connected to**: Header, homepage

#### Search Bar Component

- **File**: `src/components/common/SearchBar/SearchBar.jsx`
- **Purpose**: Search functionality
- **Dependencies**: React Router
- **Connected to**: Header, search results page

## Vendor Dashboard

### Layouts

#### Vendor Dashboard Layout

- **File**: `src/layouts/VendorLayout.jsx`
- **Purpose**: Common layout for all vendor dashboard pages
- **Dependencies**: `AuthContext`
- **Connected to**: Vendor sidebar, header components
- **Key functionality**:
  - Protected layout for vendor-only access
  - Vendor navigation

### Page Components

#### Vendor Dashboard Home

- **File**: `src/pages/vendor/DashboardPage/DashboardPage.jsx`
- **Purpose**: Main vendor dashboard with overview
- **Dependencies**: `useVendor` hook, chart components
- **Connected to**: Vendor statistics components
- **Key functionality**:
  - Sales overview
  - Recent orders
  - Popular products
  - Performance metrics

#### Vendor Products Management

- **File**: `src/pages/vendor/ProductsPage/ProductsPage.jsx`
- **Purpose**: Manage vendor's products
- **Dependencies**: `useVendor` hook, `useProducts` hook
- **Connected to**: Product form, product list
- **Key functionality**:
  - List vendor's products
  - Add/edit/delete products
  - Product status management

#### Add/Edit Product Form

- **File**: `src/pages/vendor/ProductFormPage/ProductFormPage.jsx`
- **Purpose**: Form for adding or editing products
- **Dependencies**: React Hook Form, `useVendor` hook
- **Connected to**: Product management page
- **Key functionality**:
  - Product information form
  - Image uploads
  - Category selection
  - Inventory management

#### Vendor Orders Management

- **File**: `src/pages/vendor/OrdersPage/OrdersPage.jsx`
- **Purpose**: Manage orders for vendor products
- **Dependencies**: `useVendor` hook
- **Connected to**: Order detail component
- **Key functionality**:
  - List orders containing vendor's products
  - Filter and sort orders
  - Update order status
  - View order details

#### Vendor Settings

- **File**: `src/pages/vendor/SettingsPage/SettingsPage.jsx`
- **Purpose**: Vendor profile and store settings
- **Dependencies**: React Hook Form, `AuthContext`, `useVendor` hook
- **Connected to**: Store information
- **Key functionality**:
  - Update store details
  - Banner and logo management
  - Payment settings

### Component Files

#### Vendor Sidebar

- **File**: `src/components/vendors/VendorSidebar/VendorSidebar.jsx`
- **Purpose**: Navigation sidebar for vendor dashboard
- **Dependencies**: React Router, `AuthContext`
- **Connected to**: Vendor layout

#### Vendor Statistics Cards

- **File**: `src/components/vendors/StatsCards/StatsCards.jsx`
- **Purpose**: Display key vendor statistics
- **Dependencies**: `useVendor` hook, UI components
- **Connected to**: Vendor dashboard home

#### Product Form Components

- **File**: `src/components/vendors/ProductForm/ProductForm.jsx`
- **Purpose**: Form fields for product management
- **Dependencies**: React Hook Form, UI components
- **Connected to**: Add/Edit product page

#### Order Item Component

- **File**: `src/components/vendors/OrderItem/OrderItem.jsx`
- **Purpose**: Display and manage individual order items
- **Dependencies**: `useVendor` hook
- **Connected to**: Orders page

## Admin Management Console

### Layouts

#### Admin Dashboard Layout

- **File**: `src/layouts/AdminLayout.jsx`
- **Purpose**: Common layout for all admin dashboard pages
- **Dependencies**: `AuthContext`
- **Connected to**: Admin sidebar, header components
- **Key functionality**:
  - Protected layout for admin-only access
  - Admin navigation

### Page Components

#### Admin Dashboard Home

- **File**: `src/pages/admin/DashboardPage/DashboardPage.jsx`
- **Purpose**: Admin dashboard with platform overview
- **Dependencies**: `useAdmin` hook, chart components
- **Connected to**: Platform statistics components
- **Key functionality**:
  - Platform revenue overview
  - User acquisition metrics
  - Recent orders across platform
  - Vendor performance

#### Users Management

- **File**: `src/pages/admin/UsersPage/UsersPage.jsx`
- **Purpose**: Manage platform users
- **Dependencies**: `useAdmin` hook
- **Connected to**: User detail modal
- **Key functionality**:
  - List all users
  - Filter by role
  - Edit user details
  - Disable/enable users

#### Vendors Management

- **File**: `src/pages/admin/VendorsPage/VendorsPage.jsx`
- **Purpose**: Manage platform vendors
- **Dependencies**: `useAdmin` hook
- **Connected to**: Vendor detail modal, approval forms
- **Key functionality**:
  - List all vendors
  - Filter by status
  - Approve/reject vendor applications
  - View vendor details and performance

#### Products Management

- **File**: `src/pages/admin/ProductsPage/ProductsPage.jsx`
- **Purpose**: Manage all products on the platform
- **Dependencies**: `useAdmin` hook
- **Connected to**: Product detail modal
- **Key functionality**:
  - List all products
  - Filter by category, vendor, status
  - Approve/reject products
  - Edit product details

#### Orders Management

- **File**: `src/pages/admin/OrdersPage/OrdersPage.jsx`
- **Purpose**: Manage all orders on the platform
- **Dependencies**: `useAdmin` hook
- **Connected to**: Order detail modal
- **Key functionality**:
  - List all orders
  - Filter by status, date, vendor
  - Update order statuses
  - View detailed order information

#### Categories Management

- **File**: `src/pages/admin/CategoriesPage/CategoriesPage.jsx`
- **Purpose**: Manage product categories
- **Dependencies**: `useAdmin` hook
- **Connected to**: Category modal
- **Key functionality**:
  - List all categories
  - Create/edit/delete categories
  - Manage category hierarchy

#### Settings Page

- **File**: `src/pages/admin/SettingsPage/SettingsPage.jsx`
- **Purpose**: Platform-wide settings
- **Dependencies**: `useAdmin` hook
- **Connected to**: Configuration service
- **Key functionality**:
  - Platform configuration
  - Commission rates
  - Payment settings
  - Email templates

### Component Files

#### Admin Sidebar

- **File**: `src/components/admin/AdminSidebar/AdminSidebar.jsx`
- **Purpose**: Navigation sidebar for admin dashboard
- **Dependencies**: React Router
- **Connected to**: Admin layout

#### Platform Statistics Cards

- **File**: `src/components/admin/StatsCards/StatsCards.jsx`
- **Purpose**: Display key platform statistics
- **Dependencies**: `useAdmin` hook
- **Connected to**: Admin dashboard home

#### User Management Components

- **File**: `src/components/admin/UserRow/UserRow.jsx`
- **Purpose**: Display user information in a table row
- **Dependencies**: UI components
- **Connected to**: Users management page

#### Vendor Approval Dialog

- **File**: `src/components/admin/VendorApproval/VendorApproval.jsx`
- **Purpose**: Form for reviewing and approving vendor applications
- **Dependencies**: React Hook Form, `useAdmin` hook
- **Connected to**: Vendors management page

## Shopping Cart Functionality

### Components

#### Cart Page

- **File**: `src/pages/CartPage/CartPage.jsx`
- **Purpose**: Full cart view with item management
- **Dependencies**: `CartContext`, UI components
- **Connected to**: Cart item components, checkout page
- **Key functionality**:
  - Display cart items
  - Update quantities
  - Remove items
  - Calculate subtotal, taxes, shipping
  - Apply promo codes

#### Cart Sidebar

- **File**: `src/components/cart/CartSidebar/CartSidebar.jsx`
- **Purpose**: Slide-in cart view from header icon
- **Dependencies**: `CartContext`, `UIContext`
- **Connected to**: Header cart icon, cart items
- **Key functionality**:
  - Quick view of cart items
  - Remove items
  - Proceed to checkout

#### Cart Item Component

- **File**: `src/components/cart/CartItem/CartItem.jsx`
- **Purpose**: Display individual cart items
- **Dependencies**: `CartContext`
- **Connected to**: Cart page, cart sidebar
- **Key functionality**:
  - Display product info
  - Quantity adjustment
  - Remove button
  - Price calculation

#### Mini Cart Component

- **File**: `src/components/cart/MiniCart/MiniCart.jsx`
- **Purpose**: Small cart preview in header
- **Dependencies**: `CartContext`
- **Connected to**: Header component
- **Key functionality**:
  - Display item count
  - Show mini dropdown on hover

#### Cart Functions

- **File**: `src/services/cartService.js`
- **Purpose**: Helper functions for cart operations
- **Dependencies**: Supabase client
- **Connected to**: `CartContext`
- **Key functionality**:
  - Save cart to database
  - Retrieve cart from database
  - Sync local and server carts

## Checkout Process with Kora Pay

### Page Components

#### Checkout Page

- **File**: `src/pages/CheckoutPage/CheckoutPage.jsx`
- **Purpose**: Multi-step checkout process
- **Dependencies**: React Hook Form, `CartContext`, `AuthContext`
- **Connected to**: Checkout steps components
- **Key functionality**:
  - Address input
  - Shipping method selection
  - Order review
  - Payment integration
  - Order placement

#### Order Confirmation Page

- **File**: `src/pages/OrderConfirmationPage/OrderConfirmationPage.jsx`
- **Purpose**: Confirmation after successful order
- **Dependencies**: `useApi` hook for order details
- **Connected to**: Order tracking, user account
- **Key functionality**:
  - Order summary
  - Payment confirmation
  - Next steps information
  - Continue shopping options

### Component Files

#### Checkout Steps Component

- **File**: `src/components/checkout/CheckoutSteps/CheckoutSteps.jsx`
- **Purpose**: Displays checkout progress steps
- **Dependencies**: UI components
- **Connected to**: Checkout page

#### Address Form Component

- **File**: `src/components/checkout/AddressForm/AddressForm.jsx`
- **Purpose**: Form for shipping/billing address
- **Dependencies**: React Hook Form, UI components
- **Connected to**: Checkout page

#### Shipping Method Component

- **File**: `src/components/checkout/ShippingMethod/ShippingMethod.jsx`
- **Purpose**: Shipping option selection
- **Dependencies**: React Hook Form, shipping service
- **Connected to**: Checkout page

#### Order Review Component

- **File**: `src/components/checkout/OrderReview/OrderReview.jsx`
- **Purpose**: Order summary before payment
- **Dependencies**: `CartContext`
- **Connected to**: Checkout page

#### Kora Pay Integration Component

- **File**: `src/components/checkout/KoraPayment/KoraPayment.jsx`
- **Purpose**: Integration with Kora Pay API
- **Dependencies**: Kora Pay SDK
- **Connected to**: Checkout page
- **Key functionality**:
  - Initialize payment
  - Process payment response
  - Handle payment errors
  - Confirm payment success

#### Order Service

- **File**: `src/services/orderService.js`
- **Purpose**: API functions for order operations
- **Dependencies**: API service, `CartContext`
- **Connected to**: Checkout page, order confirmation
- **Key functionality**:
  - Create order from cart
  - Validate order before payment
  - Process successful payment
  - Handle order status updates

#### Kora Pay Service

- **File**: `src/services/koraPayService.js`
- **Purpose**: Helper functions for Kora Pay integration
- **Dependencies**: Kora Pay SDK, API service
- **Connected to**: Kora Pay component
- **Key functionality**:
  - Initialize Kora Pay
  - Create payment transaction
  - Process payment callbacks
  - Handle payment verification

## Integration Points

This diagram shows the key integration points between major components in the application:

```
AuthContext ─────────────┐
                         ├─── MainLayout ─── Header ─── Navigation
CartContext ─────────────┤                 └─── Footer
                         │
UIContext ────────────┐  │
                      │  │
ProductsPage ─────────┼──┴─── ProductCard ─── CartContext
                      │
ProductDetailPage ────┘

VendorDashboard ────────── VendorLayout ─── AuthContext (isVendor)
                              │
                              └─── VendorSidebar

AdminDashboard ─────────── AdminLayout ─── AuthContext (isAdmin)
                              │
                              └─── AdminSidebar

CartPage ─────────────────── CartContext ─── CheckoutPage ─── KoraPayment
   │                                             │
   │                                             └─── OrderService
   └─── CartItem
```

## Conclusion

This document outlines the file structure and key components needed to implement the remaining features of our multi-vendor e-commerce platform. Each file has a clear purpose and defined connections to other parts of the application, facilitating a modular and maintainable codebase.

The implementation follows these key principles:

1. Separation of concerns with dedicated components and services
2. Centralized state management using Context API
3. Custom hooks for reusable business logic
4. Component-based architecture for UI elements
5. Service-based approach for external integrations

Each section of the application (customer storefront, vendor dashboard, admin console, cart, checkout) is designed to be independent yet integrated through shared contexts and services.
