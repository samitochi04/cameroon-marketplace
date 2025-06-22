import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavBar } from "@/components/common/NavBar/NavBar";
import { AuthDebug } from "@/components/debug/AuthDebug";

const MainLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NavBar component */}
      <NavBar />

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>© 2023 Cameroon Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Add the debug component */}
      <AuthDebug />
    </div>
  );
};

export default MainLayout;