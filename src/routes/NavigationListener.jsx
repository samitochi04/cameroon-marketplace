import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PropTypes from 'prop-types';

export const NavigationListener = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { isAuthenticated, refreshUser } = useAuth();

  // Refresh user data on navigation
  useEffect(() => {
    if (isAuthenticated && navigationType === "PUSH") {
      refreshUser();
    }
  }, [location.pathname, navigationType, isAuthenticated, refreshUser]);

  // Track page views for analytics
  useEffect(() => {
    // Example: Google Analytics pageview tracking
    if (window.gtag) {
      window.gtag("config", "GA-TRACKING-ID", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return children;
};

NavigationListener.propTypes = {
  children: PropTypes.node.isRequired
};