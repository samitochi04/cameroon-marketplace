import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Store,
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
import { useWishlist } from '@/hooks/useWishlist';

export const NavBar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
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

  // Debug user authentication state
  useEffect(() => {
    if (user) {
      console.log("NavBar: User authenticated", user);
    } else {
      console.log("NavBar: User not authenticated");
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      // Close mobile menu when search is submitted
      setMobileMenuOpen(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // Modified navigation link component that closes mobile menu when clicked
  const MobileNavLink = ({ to, children }) => (
    <Link
      to={to}
      className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
      onClick={closeMobileMenu}
    >
      {children}
    </Link>
  );

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left section: Logo */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="flex md:hidden mr-3">
                <button
                  type="button"
                  className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  onClick={toggleMobileMenu}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Logo  */}
              <div className="flex-shrink-0 flex items-center py-2">
                <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                  <img
                    className="h-16 sm:h-20 w-auto"
                    src="/assets/logo.svg"
                    alt="AXIS Shop Logo"
                  />
                  <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
                    AXIS Shop
                  </span>
                </Link>
              </div>
            </div>

            {/* Middle section: Navigation + Search */}
            <div className="hidden md:flex items-center flex-1 px-10">
              {/* Navigation links - desktop */}
              <nav className="flex space-x-8">
                <Link
                  to="/products"
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  {t("common.products")}
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  {t("common.categories")}
                </Link>
                <Link
                  to="/vendors"
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  {t("vendors.vendors")}
                </Link>
              </nav>

              {/* Search bar */}
              <div className="flex flex-1 max-w-md ml-8">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={t("search.search_placeholder")}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Right section: User controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language switcher */}
              <div className="relative">
                <button
                  className="flex items-center text-gray-500 hover:text-gray-700"
                  onClick={toggleLanguageMenu}
                >
                  <Globe size={20} />
                </button>

                {languageMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
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
                className="text-gray-500 hover:text-gray-700 relative"
                aria-label={t("navigation.wishlist")}
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
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

              {/* User menu - also update with higher z-index */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    onClick={toggleUserMenu}
                  >
                    <User size={20} />
                  </button>

                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                          {t("auth.hello")}, {user?.name || user?.email || "User"}
                        </div>

                        <Link
                          to="/account/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t("profile.my_profile")}
                        </Link>

                        <Link
                          to="/account/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t("orders.my_orders")}
                        </Link>

                        {user.role === "vendor" && (
                          <Link
                            to="/vendor-portal"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {t("vendors.vendor_portal")}
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
                          {t("auth.logout")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary flex items-center px-3 py-2 text-sm font-medium"
                  >
                    <LogIn size={18} className="sm:mr-1" />
                    <span className="hidden sm:inline">{t("auth.login")}</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-white hover:bg-primary-dark px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <span>{t("auth.signup")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar - lower z-index to ensure language menu appears on top */}
        <div className="md:hidden border-t border-gray-200 py-2 px-4 relative z-20">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("search.search_placeholder")}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <MobileNavLink to="/products">
                {t("common.products")}
              </MobileNavLink>
              <MobileNavLink to="/categories">
                {t("common.categories")}
              </MobileNavLink>
              <MobileNavLink to="/vendors">
                {t("vendors.vendors")}
              </MobileNavLink>

              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/account/dashboard">
                    {t("profile.my_profile")}
                  </MobileNavLink>
                  <MobileNavLink to="/account/orders">
                    {t("orders.my_orders")}
                  </MobileNavLink>

                  {user.role === "vendor" && (
                    <MobileNavLink to="/vendor-portal">
                      <Store size={16} className="inline mr-2" />
                      {t("vendors.vendor_portal")}
                    </MobileNavLink>
                  )}

                  {user.role === "admin" && (
                    <MobileNavLink to="/admin">
                      {t("admin_dashboard")}
                    </MobileNavLink>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                  >
                    {t("auth.logout")}
                  </button>
                </>
              ) : (
                <MobileNavLink to="/login">
                  {t("auth.login")}
                </MobileNavLink>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};