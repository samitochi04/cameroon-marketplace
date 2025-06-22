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
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  const hasRequiredRole = roles.includes(user?.role);

  console.log("Role check details:", {
    userRole: user?.role || "no role",
    requiredRoles: roles,
    hasRequiredRole,
    path: location.pathname,
  });

  if (!hasRequiredRole) {
    // Redirect to unauthorized page
    console.log("User does not have required role, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has required role, render the children
  return children;
};

RoleBasedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};