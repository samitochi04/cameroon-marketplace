import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";
import { useTranslation } from "react-i18next";

export const SearchBar = ({ placeholder, variant = "default", className = "" }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);
  const { searchProducts } = useProducts();

  // Generate variant-specific styling
  const variantStyles = {
    default: "bg-white border border-gray-300 rounded-lg",
    minimal: "bg-gray-100 border-0 rounded-lg",
    header: "bg-white border border-gray-300 rounded-full",
  };

  const containerStyles = `
    ${variantStyles[variant]} 
    flex items-center relative transition-all 
    ${isFocused ? "ring-2 ring-primary ring-opacity-50" : ""} 
    ${className}
  `;

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const results = await searchProducts(debouncedQuery);
        setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, searchProducts]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current !== event.target
      ) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    navigate(`/products/${suggestion.slug || suggestion.id}`);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className={containerStyles}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder || t('search')}
          className="flex-grow py-2 px-4 text-gray-700 focus:outline-none bg-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-600 mr-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="p-2 text-gray-600 hover:text-primary focus:outline-none"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>

      {/* Search suggestions */}
      {isFocused && (query.length >= 2 || suggestions.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">{t('searching')}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                  >
                    {suggestion.imageUrl && (
                      <img 
                        src={suggestion.imageUrl} 
                        alt={suggestion.name} 
                        className="w-10 h-10 object-cover mr-3" 
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-800">{suggestion.name}</div>
                      {suggestion.price && (
                        <div className="text-xs text-primary font-medium">${suggestion.price.toFixed(2)}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full text-center px-4 py-2 text-primary text-sm font-medium hover:bg-gray-50"
                >
                  {t('see_all_results')} "{query}"
                </button>
              </li>
            </ul>
          ) : query.length >= 2 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">{t('no_matches_found')} "{query}"</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 text-primary text-sm font-medium hover:underline"
              >
                {t('search_anyway')}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  variant: PropTypes.oneOf(["default", "minimal", "header"]),
  className: PropTypes.string,
};

SearchBar.defaultProps = {
  placeholder: "",
  variant: "default",
  className: "",
};
