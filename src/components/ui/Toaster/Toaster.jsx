import React, { useState, useEffect, createContext, useContext } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

// Create a context for the toast functionality
export const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

// Custom hook to use the toast functionality
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = ({
    type = "success",
    title,
    message,
    duration = 5000,
  }) => {
    const id = Date.now().toString();
    
    setToasts((prev) => [
      ...prev,
      { id, type, title, message, duration },
    ]);

    // Auto-dismiss after duration
    if (duration) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  };

  const hideToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toaster toasts={toasts} hideToast={hideToast} />
    </ToastContext.Provider>
  );
};

export const Toaster = ({ toasts, hideToast }) => {
  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastClasses = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-300 text-green-800";
      case "warning":
        return "bg-amber-50 border-amber-300 text-amber-800";
      case "info":
        return "bg-blue-50 border-blue-300 text-blue-800";
      case "error":
        return "bg-red-50 border-red-300 text-red-800";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start rounded-md border px-4 py-3 shadow-md max-w-md transition-all duration-300 ease-in-out ${getToastClasses(
            toast.type
          )}`}
          role="alert"
        >
          <div className="flex-shrink-0 mr-2">
            {getToastIcon(toast.type)}
          </div>
          <div className="flex-1 mr-2">
            {toast.title && (
              <h4 className="font-semibold mb-0.5">{toast.title}</h4>
            )}
            {toast.message && <p className="text-sm">{toast.message}</p>}
          </div>
          <button
            onClick={() => hideToast(toast.id)}
            className="flex-shrink-0 p-0.5 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
