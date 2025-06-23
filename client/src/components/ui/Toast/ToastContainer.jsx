import React from "react";
import { Toast } from "./Toast";
import { useUI } from "@/context/UIContext";

export const ToastContainer = () => {
  const { toasts, removeToast } = useUI();
  
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};
