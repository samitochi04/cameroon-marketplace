import AppRouter from './routes';
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/ui/Toaster";
import { Suspense, lazy, useEffect } from 'react';
import { ensureStorageBuckets } from './utils/storageHelpers';
import { ToastContainer } from './components/ui/Toast/ToastContainer';

// Lazy loaded pages
const ProductListPage = lazy(() => import('./pages/ProductListPage/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage'));

function App() {
  // Check storage buckets on app start
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const result = await ensureStorageBuckets();
        console.log('Storage check result:', result);
      } catch (error) {
        console.error('Storage initialization error:', error);
      }
    };
    
    checkStorage();
  }, []);
  
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <AppRouter />
            <ToastContainer />
          </Suspense>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;