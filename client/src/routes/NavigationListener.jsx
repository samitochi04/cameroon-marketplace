import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { refreshSupabaseSession, useSupabaseRefresh } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import PropTypes from 'prop-types';

// For use within layouts or components that are inside Router context
export const NavigationListener = ({ children }) => {
  // These hooks will throw an error if not in a Router context
  const location = useLocation();
  const navigationType = useNavigationType();
  const supabaseRefresh = useSupabaseRefresh();
  const refreshData = supabaseRefresh?.refreshData;
  const { isAuthenticated, refreshUser } = useAuth();

  // Refresh user data and Supabase state on navigation
  useEffect(() => {
    const handleNavigation = async () => {
      // Always refresh data on navigation
      refreshData();
      
      try {
        // For PUSH navigation, refresh everything including the session
        if (navigationType === "PUSH") {
          await refreshSupabaseSession();
          
          // If authenticated, also refresh user data
          if (isAuthenticated) {
            refreshUser();
          }
          
          console.log('Navigation refresh complete:', location.pathname);
        }
      } catch (error) {
        console.error('Error during navigation refresh:', error);
      }
    };
    
    handleNavigation();
  }, [location.pathname, navigationType, isAuthenticated, refreshUser, refreshData]);

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