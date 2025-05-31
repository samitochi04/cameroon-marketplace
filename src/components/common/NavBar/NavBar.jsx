import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Globe,
  Heart,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export const NavBar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // Close the menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setLanguageMenuOpen(false);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };

  const toggleLanguageMenu = (e) => {
    e.stopPropagation();
    setLanguageMenuOpen(!languageMenuOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/");
      setUserMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="-mx-2 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Cameroon Marketplace"
              />
              <span className="ml-2 text-lg font-bold text-gray-900 hidden sm:block">
                Cameroon Market
              </span>
            </Link>
          </div>

          {/* Navigation links - desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/products"
              className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
            >
              {t("products")}
            </Link>
            <Link
              to="/categories"
              className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
            >
              {t("categories")}
            </Link>
            <Link
              to="/vendors"
              className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
            >
              {t("vendors")}
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Language switcher */}
            <div className="relative">
              <button
                className="flex items-center text-gray-500 hover:text-gray-700"
                onClick={toggleLanguageMenu}
              >
                <Globe size={20} />
              </button>

              {languageMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        i18n.language === "en"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage("fr")}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        i18n.language === "fr"
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      Français
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist link */}
            <Link
              to="/wishlist"
              className="text-gray-500 hover:text-gray-700"
              aria-label={t("wishlist")}
            >
              <Heart size={20} />
            </Link>

            {/* Cart link with item count */}
            <Link
              to="/cart"
              className="text-gray-500 hover:text-gray-700 relative"
              aria-label={t("cart")}
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center text-gray-500 hover:text-gray-700"
                  onClick={toggleUserMenu}
                >
                  <User size={20} />
                </button>

                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {t("hello")}, {user.email}
                      </div>

                      <Link
                        to="/account/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("my_account")}
                      </Link>

                      <Link
                        to="/account/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("my_orders")}
                      </Link>

                      {user.role === "vendor" && (
                        <Link
                          to="/vendor-portal"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t("vendor_portal")}
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t("admin_dashboard")}
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogIn size={20} />
                  <span className="ml-1 text-sm hidden sm:inline">
                    {t("login")}
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <span className="text-sm hidden sm:inline">
                    {t("signup")}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {/* Mobile search */}
            <div className="px-3 pb-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={t("search_placeholder")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              {t("products")}
            </Link>
            <Link
              to="/categories"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              {t("categories")}
            </Link>
            <Link
              to="/vendors"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              {t("vendors")}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/account/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  {t("my_account")}
                </Link>
                <Link
                  to="/account/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  {t("my_orders")}
                </Link>

                {user.role === "vendor" && (
                  <Link
                    to="/vendor-portal"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
                  >
                    <Store size={16} className="inline mr-2" />
                    {t("vendor_portal")}
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
                  >
                    {t("admin_dashboard")}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};