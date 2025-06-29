import AppRouter from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./components/ui/Toaster";
import { Suspense, lazy, useEffect } from "react";
import { ensureStorageBuckets } from "./utils/storageHelpers";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loaded pages
const ProductListPage = lazy(() =>
  import("./pages/ProductListPage/ProductListPage")
);
const ProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage/ProductDetailPage")
);
const CartPage = lazy(() => import("./pages/CartPage/CartPage"));

function App() {
  // Check storage buckets on app start
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const result = await ensureStorageBuckets();
      } catch (error) {
        if (import.meta.env.DEBUG_MODE === "true") {
          console.error("Storage initialization error:", error);
        }
      }
    };

    checkStorage();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen">
                Loading...
              </div>
            }
          >
            <AppRouter />
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Suspense>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
