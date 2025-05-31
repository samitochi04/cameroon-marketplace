import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";

export const RoleBasedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  const hasRequiredRole = roles.includes(user?.role);

  if (!hasRequiredRole) {
    // Redirect to unauthorized page or dashboard based on user's role
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "vendor") {
      return <Navigate to="/vendor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role, render the children
  return children;
};

RoleBasedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};