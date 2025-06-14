import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, Search, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

// Mock data for vendors
const MOCK_VENDORS = [
  {
    id: "v1",
    name: "Electronics Hub",
    slug: "electronics-hub",
    description: "Quality electronics and accessories for all your tech needs",
    logoUrl: "https://placehold.co/200x200?text=Electronics+Hub",
    bannerUrl: "https://placehold.co/1200x300?text=Electronics+Hub",
    rating: 4.8,
    reviewCount: 124,
    productCount: 156,
    location: "Douala, Cameroon",
    joinDate: "2022-04-15",
    featured: true,
    categories: ["Electronics", "Mobile Phones", "Computers"]
  },
  {
    id: "v2",
    name: "Fashion World",
    slug: "fashion-world",
    description: "Trendy fashion items for men, women, and children",
    logoUrl: "https://placehold.co/200x200?text=Fashion+World",
    bannerUrl: "https://placehold.co/1200x300?text=Fashion+World",
    rating: 4.6,
    reviewCount: 98,
    productCount: 230,
    location: "Yaoundé, Cameroon",
    joinDate: "2022-05-20",
    featured: true,
    categories: ["Fashion", "Clothing", "Accessories"]
  },
  {
    id: "v3",
    name: "Home Decor & More",
    slug: "home-decor-more",
    description: "Beautiful home decor items to make your house a home",
    logoUrl: "https://placehold.co/200x200?text=Home+Decor",
    bannerUrl: "https://placehold.co/1200x300?text=Home+Decor",
    rating: 4.7,
    reviewCount: 76,
    productCount: 112,
    location: "Douala, Cameroon",
    joinDate: "2022-06-10",
    featured: false,
    categories: ["Home & Garden", "Furniture", "Decor"]
  },
  {
    id: "v4",
    name: "Kitchen Essentials",
    slug: "kitchen-essentials",
    description: "Everything you need for your kitchen",
    logoUrl: "https://placehold.co/200x200?text=Kitchen+Essentials",
    bannerUrl: "https://placehold.co/1200x300?text=Kitchen+Essentials",
    rating: 4.5,
    reviewCount: 64,
    productCount: 94,
    location: "Bamenda, Cameroon",
    joinDate: "2022-07-05",
    featured: false,
    categories: ["Kitchen", "Appliances", "Cookware"]
  },
  {
    id: "v5",
    name: "Sports Outlet",
    slug: "sports-outlet",
    description: "Sports equipment and apparel for all types of activities",
    logoUrl: "https://placehold.co/200x200?text=Sports+Outlet",
    bannerUrl: "https://placehold.co/1200x300?text=Sports+Outlet",
    rating: 4.9,
    reviewCount: 45,
    productCount: 78,
    location: "Yaoundé, Cameroon",
    joinDate: "2022-08-15",
    featured: true,
    categories: ["Sports", "Fitness", "Outdoor"]
  },
  {
    id: "v6",
    name: "Health & Beauty",
    slug: "health-beauty",
    description: "Premium beauty products and health supplements",
    logoUrl: "https://placehold.co/200x200?text=Health+Beauty",
    bannerUrl: "https://placehold.co/1200x300?text=Health+Beauty",
    rating: 4.7,
    reviewCount: 89,
    productCount: 145,
    location: "Douala, Cameroon",
    joinDate: "2022-09-20",
    featured: false,
    categories: ["Beauty", "Health", "Personal Care"]
  },
  {
    id: "v7",
    name: "African Crafts",
    slug: "african-crafts",
    description: "Handmade African crafts and artifacts",
    logoUrl: "https://placehold.co/200x200?text=African+Crafts",
    bannerUrl: "https://placehold.co/1200x300?text=African+Crafts",
    rating: 4.9,
    reviewCount: 34,
    productCount: 62,
    location: "Limbe, Cameroon",
    joinDate: "2022-10-10",
    featured: false,
    categories: ["Crafts", "Art", "Home Decor"]
  },
  {
    id: "v8",
    name: "Local Foods",
    slug: "local-foods",
    description: "Authentic Cameroonian food ingredients and products",
    logoUrl: "https://placehold.co/200x200?text=Local+Foods",
    bannerUrl: "https://placehold.co/1200x300?text=Local+Foods",
    rating: 4.8,
    reviewCount: 56,
    productCount: 88,
    location: "Buea, Cameroon",
    joinDate: "2022-11-05",
    featured: true,
    categories: ["Food", "Groceries", "Spices"]
  }
];

export const VendorsPage = () => {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Extract all unique categories from vendors
  const allCategories = [...new Set(MOCK_VENDORS.flatMap(v => v.categories))];
  
  // Load mock data
  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setVendors(MOCK_VENDORS);
      setFilteredVendors(MOCK_VENDORS);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...vendors];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        v => v.name.toLowerCase().includes(query) || 
             v.description.toLowerCase().includes(query) ||
             v.location.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(v => v.categories.includes(selectedCategory));
    }
    
    // Apply sorting
    switch (sortBy) {
      case "featured":
        result = result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case "rating":
        result = result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result = result.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
        break;
      case "productCount":
        result = result.sort((a, b) => b.productCount - a.productCount);
        break;
      default:
        break;
    }
    
    setFilteredVendors(result);
  }, [vendors, searchQuery, sortBy, selectedCategory]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  // Format rating stars
  const renderRatingStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-none text-gray-300"
        }`}
      />
    ));
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section */}
      <div className="bg-primary text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">{t("vendors.explore_vendors")}</h1>
          <p className="text-lg max-w-2xl mx-auto">
            {t("vendors.explore_description")}
          </p>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  type="text" 
                  placeholder={t("vendors.search_vendors")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select 
                className="w-full border border-gray-300 rounded-md p-2 pr-8"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">{t("vendors.all_categories")}</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort */}
            <div className="w-full md:w-48">
              <select 
                className="w-full border border-gray-300 rounded-md p-2 pr-8"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="featured">{t("vendors.sort_featured")}</option>
                <option value="rating">{t("vendors.sort_top_rated")}</option>
                <option value="newest">{t("vendors.sort_newest")}</option>
                <option value="productCount">{t("vendors.sort_most_products")}</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Featured vendors section */}
        {filteredVendors.some(v => v.featured) && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">{t("vendors.featured_vendors")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors
                .filter(v => v.featured)
                .map(vendor => (
                  <Link key={vendor.id} to={`/vendor/${vendor.slug}`} className="block">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="h-32 bg-gray-200 relative overflow-hidden">
                        <img 
                          src={vendor.bannerUrl} 
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white">
                            <img 
                              src={vendor.logoUrl} 
                              alt={vendor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="pt-10 p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-center mb-2">{vendor.name}</h3>
                        <div className="flex items-center justify-center mb-2">
                          <div className="flex">{renderRatingStars(vendor.rating)}</div>
                          <span className="text-sm text-gray-600 ml-1">({vendor.rating})</span>
                        </div>
                        <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
                          {vendor.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                          <div>{vendor.productCount} {t("vendors.products")}</div>
                          <div>{vendor.location}</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        )}
        
        {/* All vendors section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{t("vendors.all_vendors")}</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-2">{t("vendors.no_vendors_found")}</h3>
              <p className="text-gray-600 mb-6">{t("vendors.try_different_filters")}</p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSortBy("featured");
                }}
                className="bg-primary text-white px-4 py-2 rounded-md"
              >
                {t("vendors.clear_filters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVendors.map(vendor => (
                <Link key={vendor.id} to={`/vendor/${vendor.slug}`} className="block">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="h-40 relative overflow-hidden">
                      <img 
                        src={vendor.logoUrl} 
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                      {vendor.featured && (
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                          {t("vendors.featured")}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold mb-2">{vendor.name}</h3>
                      <div className="flex items-center mb-2">
                        <div className="flex">{renderRatingStars(vendor.rating)}</div>
                        <span className="text-sm text-gray-600 ml-1">({vendor.rating})</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {vendor.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        <div>{vendor.productCount} {t("vendors.products")}</div>
                        <div>{vendor.location}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
