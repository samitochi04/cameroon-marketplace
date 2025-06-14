import React, { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

// Create the UI context
const UIContext = createContext({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
  activeModal: null,
  openModal: () => {},
  closeModal: () => {},
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

// Provider component
export function UIProvider({ children }) {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Mobile menu functions
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Modal functions
  const openModal = useCallback((modalId, data = null) => {
    setActiveModal(modalId);
    setModalData(data);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
    // Restore body scrolling
    document.body.style.overflow = '';
  }, []);

  // Toast functions
  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      title: toast.title || "",
      message: toast.message || "",
      type: toast.type || "info", // info, success, warning, error
      duration: toast.duration || 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss toast after duration
    if (newToast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Value to be provided to consumers
  const value = {
    // Mobile menu
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    
    // Modal
    activeModal,
    modalData,
    openModal,
    closeModal,
    
    // Toasts
    toasts,
    addToast,
    removeToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
