import React, { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import { Loader } from "@/components/ui/Loader";

export const VendorLayout = () => {
  const { user, isLoading, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect if user is not a vendor
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isVendor) {
      navigate("/unauthorized");
    }
  }, [isAuthenticated, isVendor, isLoading, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/vendor/dashboard" replace />;
  }

  // If authenticated but not vendor, the useEffect will handle redirection
  if (!isLoading && isAuthenticated && !isVendor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-md ${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <h2 className="text-lg font-semibold">Vendor Portal</h2>
          ) : (
            <span className="text-lg font-semibold">VP</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Vendor Navigation Links will go here */}
        <nav className="mt-6">
          {/* Navigation links will be added here */}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Vendor Dashboard</h1>
            {/* Vendor header actions can go here */}
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