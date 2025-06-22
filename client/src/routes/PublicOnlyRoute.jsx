import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // Redirect to home or intended location if already authenticated
  if (isAuthenticated) {
    // If user was redirected to login from another page, send them back there
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the login/register page
  return children;
};

PublicOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};