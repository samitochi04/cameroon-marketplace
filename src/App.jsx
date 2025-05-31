import AppRouter from './routes';
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/ui/Toaster";
import { Suspense, lazy } from 'react';

// Lazy loaded pages
const ProductListPage = lazy(() => import('./pages/ProductListPage/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <AppRouter />
          </Suspense>
          {/* NavigationListener can't be used directly with RouterProvider, 
              you'd need to adjust it or use a different approach for navigation tracking */}
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;