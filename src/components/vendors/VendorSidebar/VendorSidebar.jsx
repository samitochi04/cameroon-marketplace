import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart2, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Menu,
  X,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const VendorSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/vendor-portal/dashboard",
    },
    {
      title: "Products",
      icon: <Package className="w-5 h-5" />,
      path: "/vendor-portal/products",
    },
    {
      title: "Orders",
      icon: <ShoppingBag className="w-5 h-5" />,
      path: "/vendor-portal/orders",
    },
    {
      title: "Analytics",
      icon: <BarChart2 className="w-5 h-5" />,
      path: "/vendor-portal/analytics",
    },
    {
      title: "Earnings",
      icon: <DollarSign className="w-5 h-5" />,
      path: "/vendor-portal/earnings",
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/vendor-portal/settings",
    },
    {
      title: "Help",
      icon: <HelpCircle className="w-5 h-5" />,
      path: "/vendor-portal/help",
    },
  ];

  // Check if a path is active
  const isActivePath = (path) => location.pathname === path || 
    (path !== '/vendor-portal/dashboard' && location.pathname.startsWith(path));

  // Sidebar link component
  const NavLink = ({ item }) => (
    <Link
      to={item.path}
      className={`flex items-center px-4 py-3 text-sm rounded-lg mb-1 transition-colors ${
        isActivePath(item.path)
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span className="mr-3">{item.icon}</span>
      <span>{item.title}</span>
      {isActivePath(item.path) && <ChevronRight className="w-4 h-4 ml-auto" />}
    </Link>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col h-full`}
      >
        {/* Logo and vendor info */}
        <div className="p-4 border-b">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mr-3">
              {user?.storeName?.charAt(0) || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {user?.storeName || "Vendor Store"}
              </h2>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};