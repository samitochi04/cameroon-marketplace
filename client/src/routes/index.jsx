import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

// Layouts - Import as named exports
import MainLayout from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { VendorLayout } from '../layouts/VendorLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AuthCallbackPage from '../pages/auth/AuthCallbackPage';
import RegisterTestPage from '../pages/auth/RegisterTestPage';

// Main Pages
import HomePage from '../pages/HomePage';
import ProductListPage from '../pages/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import VendorStorePage from '../pages/VendorStorePage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import PaymentPage from '../pages/PaymentPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import { CategoryPage } from '../pages/CategoryPage/CategoryPage';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CustomerOrders from '../pages/customer/Orders';
import CustomerOrderDetail from '../pages/customer/OrderDetail';
import CustomerProfile from '../pages/customer/Profile';

// Vendor Pages
import VendorDashboard from '../pages/vendor/Dashboard';
import VendorProducts from '../pages/vendor/Products';
import { ProductFormPage } from '../pages/vendor/ProductFormPage/ProductFormPage';
import VendorOrders from '../pages/vendor/Orders';
import VendorOrderDetail from '../pages/vendor/OrderDetail';
import VendorProfile from '../pages/vendor/Profile';
import { SettingsPage } from '../pages/vendor/SettingsPage/SettingsPage';
import EarningsPage from '../pages/vendor/EarningsPage/EarningsPage';

// Admin Pages
import { DashboardPage as AdminDashboard } from '../pages/admin/DashboardPage/DashboardPage';
import { UsersPage as AdminUsers } from '../pages/admin/UsersPage/UsersPage';
import { VendorsPage as AdminVendors } from '../pages/admin/VendorsPage/VendorsPage';
import { ProductsPage as AdminProducts } from '../pages/admin/ProductsPage/ProductsPage';
import { OrdersPage as AdminOrders } from '../pages/admin/OrdersPage/OrdersPage';
import { CategoriesPage as AdminCategories } from '../pages/admin/CategoriesPage/CategoriesPage';
import { SettingsPage as AdminSettings } from '../pages/admin/SettingsPage/SettingsPage';

// Error Pages
import NotFoundPage from '../pages/NotFoundPage';

// Import VendorsPage
import VendorsPage from '../pages/VendorsPage/VendorsPage';

// Import WishlistPage  
import WishlistPage from '../pages/WishlistPage';

// Import UnauthorizedPage
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Remove the dynamic basename - serve everything from root
const router = createBrowserRouter([
  // Main app routes (no prefix)
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'categories', element: <CategoryPage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'vendors', element: <VendorsPage /> },
      { path: 'vendor/:id', element: <VendorStorePage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'payment/:orderId', element: <PaymentPage /> },
      { path: 'order-confirmation/:orderId', element: <OrderConfirmationPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
      { path: 'auth/test', element: <RegisterTestPage /> },
      
      // Customer routes (nested under account)
      {
        path: 'account',
        children: [
          { index: true, element: <Navigate to="/account/dashboard" replace /> },
          { path: 'dashboard', element: <CustomerDashboard /> },
          { path: 'orders', element: <CustomerOrders /> },
          { path: 'orders/:orderId', element: <CustomerOrderDetail /> },
          { path: 'profile', element: <CustomerProfile /> },
        ],
      },
      
      { path: 'unauthorized', element: <UnauthorizedPage /> },
    ],
  },
  
  // Vendor routes (with /vendor-portal prefix)
  {
    path: '/vendor-portal',
    element: <VendorLayout />,
    children: [
      { index: true, element: <Navigate to="/vendor-portal/dashboard" replace /> },
      { path: 'dashboard', element: <VendorDashboard /> },
      { path: 'products', element: <VendorProducts /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/edit/:id', element: <ProductFormPage /> },
      { path: 'orders', element: <VendorOrders /> },
      { path: 'orders/:orderId', element: <VendorOrderDetail /> },
      { path: 'profile', element: <VendorProfile /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'earnings', element: <EarningsPage /> },
    ],
  },
  
  // Admin routes (with /admin prefix)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'vendors', element: <AdminVendors /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },
]);

export { router };

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;