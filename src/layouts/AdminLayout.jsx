import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/ui/Loader";

export const AdminLayout = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if the user is an admin
    if (!isLoading && isAuthenticated) {
      setIsAdmin(user?.role === "admin");
      setChecking(false);
    } else if (!isLoading) {
      setChecking(false);
    }
  }, [user, isLoading, isAuthenticated]);

  // Show loading state
  if (isLoading || checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated or not an admin
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin/dashboard" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            {/* Admin header actions can go here */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};