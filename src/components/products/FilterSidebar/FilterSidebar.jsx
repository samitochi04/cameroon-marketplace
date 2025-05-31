import React, { useState } from "react";
import PropTypes from "prop-types";
import { X, ChevronDown, ChevronUp, Sliders } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

export const FilterSidebar = ({
  filters,
  onChange,
  onClearAll,
  isOpen,
  onClose,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    // Add more sections as needed
  });

  const { categories, loading: categoriesLoading } = useCategories();
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 1000,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const currentCategories = filters.categories || [];
    let newCategories;
    
    if (currentCategories.includes(categoryId)) {
      newCategories = currentCategories.filter((id) => id !== categoryId);
    } else {
      newCategories = [...currentCategories, categoryId];
    }
    
    onChange({
      ...filters,
      categories: newCategories,
      page: 1, // Reset to first page on filter change
    });
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: parseInt(value, 10) };
    setPriceRange(newRange);
  };

  const applyPriceFilter = () => {
    onChange({
      ...filters,
      minPrice: priceRange.min > 0 ? priceRange.min : undefined,
      maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
      page: 1, // Reset to first page on filter change
    });
  };

  const handleRatingChange = (rating) => {
    onChange({
      ...filters,
      rating,
      page: 1, // Reset to first page on filter change
    });
  };

  // Sidebar header with title and close button
  const FilterHeader = () => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
      <h3 className="font-bold text-lg flex items-center">
        <Sliders className="w-5 h-5 mr-2" />
        Filters
      </h3>
      <button 
        onClick={onClearAll} 
        className="text-sm text-primary hover:underline"
      >
        Clear all
      </button>
      <button 
        onClick={onClose} 
        className="md:hidden text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  // Section component for each filter group
  const FilterSection = ({ title, expanded, onToggle, children }) => (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full text-left font-medium mb-2"
      >
        {title}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </div>
  );

  return (
    <div className={`
      bg-white p-4 md:p-6 rounded-lg shadow-md
      md:static fixed inset-y-0 left-0 z-40 w-3/4 max-w-xs md:max-w-none md:w-full
      transform ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      transition-transform duration-300 ease-in-out
      overflow-y-auto
    `}>
      <FilterHeader />

      {/* Categories Filter */}
      <FilterSection 
        title="Categories" 
        expanded={expandedSections.categories} 
        onToggle={() => toggleSection("categories")}
      >
        {categoriesLoading ? (
          <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <label 
                key={category.id} 
                className="flex items-center space-x-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={(filters.categories || []).includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection 
        title="Price Range" 
        expanded={expandedSections.price} 
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-4">
          <div>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              value={priceRange.max}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm mt-2">
              <div className="flex gap-1 items-center">
                <span className="text-gray-600">Min:</span>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange("min", e.target.value)}
                  className="w-20 p-1 border border-gray-300 rounded text-sm"
                  min="0"
                  max={priceRange.max}
                />
              </div>
              <div className="flex gap-1 items-center">
                <span className="text-gray-600">Max:</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange("max", e.target.value)}
                  className="w-20 p-1 border border-gray-300 rounded text-sm"
                  min={priceRange.min}
                  max="1000"
                />
              </div>
            </div>
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm transition"
          >
            Apply Price
          </button>
        </div>
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection 
        title="Rating" 
        expanded={expandedSections.rating} 
        onToggle={() => toggleSection("rating")}
      >
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label 
              key={rating} 
              className="flex items-center space-x-2 py-1 cursor-pointer"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="text-primary focus:ring-primary"
              />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-700">& up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

FilterSidebar.propTypes = {
  filters: PropTypes.shape({
    categories: PropTypes.array,
    minPrice: PropTypes.number,
    maxPrice: PropTypes.number,
    rating: PropTypes.number,
  }),
  onChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

FilterSidebar.defaultProps = {
  filters: {},
  isOpen: false,
};
