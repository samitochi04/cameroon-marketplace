import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const CategoryNav = () => {
  const { categories, hierarchicalCategories, loading } = useCategories();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Check if category is active
  const isCategoryActive = (categorySlug) => {
    return location.pathname.includes(`/category/${categorySlug}`);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle mouse enter on desktop
  const handleMouseEnter = (categoryId) => {
    if (isDesktop) {
      setHoveredCategory(categoryId);
    }
  };

  // Handle mouse leave on desktop
  const handleMouseLeave = () => {
    if (isDesktop) {
      setHoveredCategory(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="h-10 flex items-center">
            <div className="animate-pulse bg-gray-200 h-5 w-3/4 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view - Horizontal category navigation
  const DesktopCategoryNav = () => (
    <nav className="hidden md:block">
      <ul className="flex items-center space-x-6">
        {hierarchicalCategories.map((category) => (
          <li 
            key={category.id} 
            className="relative group"
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={`/category/${category.slug}`}
              className={`flex items-center py-3 font-medium text-sm hover:text-primary transition-colors
                ${isCategoryActive(category.slug) ? "text-primary" : "text-gray-700"}`}
            >
              {category.name}
              {category.children?.length > 0 && (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </Link>

            {/* Dropdown for subcategories */}
            {category.children?.length > 0 && hoveredCategory === category.id && (
              <div className="absolute left-0 z-10 mt-0 w-60 bg-white shadow-lg rounded-lg py-2 animate-fadeIn">
                {category.children.map((subcat) => (
                  <Link
                    key={subcat.id}
                    to={`/category/${subcat.slug}`}
                    className={`block px-4 py-2 text-sm hover:bg-gray-50
                      ${isCategoryActive(subcat.slug) ? "text-primary" : "text-gray-700"}`}
                  >
                    {subcat.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );

  // Mobile view - Dropdown menu
  const MobileCategoryNav = () => (
    <div className="md:hidden" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-between w-full p-2 text-left text-gray-700 hover:text-primary focus:outline-none"
      >
        <span className="font-medium">Categories</span>
        <ChevronDown className={`w-5 h-5 transform transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {isMenuOpen && (
        <div className="mt-1 bg-white shadow-lg rounded-md py-2 z-20 absolute left-0 right-0 max-h-80 overflow-y-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`block px-4 py-2 text-sm hover:bg-gray-50
                ${isCategoryActive(category.slug) ? "text-primary bg-gray-50" : "text-gray-700"}`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <DesktopCategoryNav />
        <MobileCategoryNav />
      </div>
    </div>
  );
};
