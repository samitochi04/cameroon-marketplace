import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { VendorSidebar } from "@/components/vendor/VendorSidebar/VendorSidebar";
import { useAuth } from "@/context/AuthContext";
import { AuthDebug } from "@/components/debug/AuthDebug";

export const VendorLayout = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Debug - log the user object
  useEffect(() => {
    console.log("VendorLayout - User:", user);
    console.log("VendorLayout - isAuthenticated:", isAuthenticated);
    console.log("VendorLayout - user role:", user?.role);
  }, [user, isAuthenticated]);

  // Show loading state while checking auth
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("VendorLayout: Not authenticated, redirecting to login");
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Check if user is a vendor based solely on the role from auth context
  const isVendor = user?.role === "vendor" || user?.role === "admin";

  // Redirect to unauthorized if not a vendor
  if (!isVendor) {
    console.log(
      "VendorLayout: User is not vendor or admin, redirecting to unauthorized"
    );
    return <Navigate to="/unauthorized" replace />;
  }

  // Show vendor dashboard for vendors and admins
  return (
    <div className="flex min-h-screen bg-gray-100">
      <VendorSidebar />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
      {/* Add the debug component */}
      <AuthDebug />
    </div>
  );
};

export default VendorLayout;