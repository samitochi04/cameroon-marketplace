import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApi } from "@/hooks/useApi";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

export const VendorStorePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("products");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [category, setCategory] = useState("");
  
  // Fix the import - replace useGet with useApi
  const { get, loading: apiLoading } = useApi();
  
  // Fetch vendor data
  const {
    data: vendorData,
    loading: vendorLoading,
    error: vendorError,
    fetchData: fetchVendor,
  } = useGet(`/api/vendors/${id}`);
  
  // Fetch vendor products
  const { products, loading: productsLoading, error: productsError, pagination } = useProducts({
    vendorId: id,
    page: currentPage,
    pageSize: 12,
    sort: sortBy,
    category: category || undefined,
  });
  
  // Fetch vendor categories (products categories this vendor sells)
  const {
    data: categoriesData,
    loading: categoriesLoading,
  } = useGet(`/api/vendors/${id}/categories`);
  
  useEffect(() => {
    fetchVendor();
  }, [id, fetchVendor]);
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleAddToCart = (productId) => {
    console.log("Add to cart:", productId);
    // This would use CartContext in a real implementation
  };
  
  const handleAddToWishlist = (productId) => {
    console.log("Add to wishlist:", productId);
  };
  
  if (vendorLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (vendorError || !vendorData?.vendor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{t("vendor_not_found")}</h2>
        <p className="mb-8">{t("vendor_not_found_message")}</p>
        <Button as={Link} to="/vendors" variant="primary">
          {t("browse_vendors")}
        </Button>
      </div>
    );
  }
  
  const vendor = vendorData.vendor;
  const categories = categoriesData?.categories || [];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Store Header/Banner */}
      <div className="relative h-64 md:h-80 w-full bg-gray-200 overflow-hidden">
        {vendor.bannerUrl ? (
          <img
            src={vendor.bannerUrl}
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Store Info */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-6 md:pb-8 flex flex-col md:flex-row items-center md:items-end gap-4">
            {/* Store Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg -mt-12 md:mt-0">
              <img
                src={vendor.logoUrl || "/default-store-logo.jpg"}
                alt={vendor.storeName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-center md:text-left text-white flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{vendor.storeName}</h1>
              
              {/* Rating */}
              <div className="flex items-center justify-center md:justify-start mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(vendor.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-none text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm">
                  ({vendor.reviewCount} {t("reviews")})
                </span>
              </div>
              
              <p className="hidden md:block text-sm md:text-base max-w-xl">
                {vendor.description}
              </p>
            </div>
            
            {/* Store Actions */}
            <div className="flex space-x-2">
              <Button variant="primary" size="sm">
                {t("follow_store")}
              </Button>
              <Button variant="outline" className="bg-white/10" size="sm">
                {t("contact")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Description (Mobile) */}
      <div className="md:hidden container mx-auto px-4 py-4">
        <p className="text-sm text-gray-600">{vendor.description}</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "products"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("products")}
            >
              {t("products")}
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "reviews"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              {t("reviews")}
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm whitespace-nowrap ${
                activeTab === "about"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("about")}
            >
              {t("about")}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold">{t("all_products")}</h2>
                <Badge variant="secondary">
                  {vendor.productCount} {t("products")}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <div className="w-full sm:w-auto">
                  <Select
                    value={category}
                    onChange={handleCategoryChange}
                    options={[
                      { value: "", label: t("all_categories") },
                      ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    placeholder={t("filter_by_category")}
                    className="w-full sm:w-48"
                  />
                </div>
                
                {/* Sort By */}
                <div className="w-full sm:w-auto">
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    options={[
                      { value: "newest", label: t("newest") },
                      { value: "price_low", label: t("price_low_to_high") },
                      { value: "price_high", label: t("price_high_to_low") },
                      { value: "rating", label: t("highest_rating") },
                    ]}
                    placeholder={t("sort_by")}
                    className="w-full sm:w-48"
                  />
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : productsError || products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">
                  {productsError ? t("error_loading_products") : t("no_products_found")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {productsError ? t("try_again_later") : t("vendor_no_products")}
                </p>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Overall Rating */}
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {vendor.rating?.toFixed(1)}
                  </div>
                  <div className="flex mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(vendor.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("based_on")} {vendor.reviewCount} {t("reviews")}
                  </div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="md:w-2/3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const percentage = vendor.ratingBreakdown?.[star] || 0;
                    return (
                      <div key={star} className="flex items-center mb-2">
                        <div className="w-12 text-sm text-gray-600">
                          {star} {t("stars")}
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="h-2 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-9 text-sm text-gray-600">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Review List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium mb-6">{t("customer_reviews")}</h3>
              
              {vendor.reviews?.length > 0 ? (
                <div className="space-y-6">
                  {vendor.reviews.map((review, index) => (
                    <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.userName}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(review.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-none text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t("no_reviews_yet")}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* About Tab */}
        {activeTab === "about" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">{t("about_store")}</h3>
            <p className="text-gray-600 mb-6">{vendor.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Info */}
              <div>
                <h4 className="font-medium mb-4">{t("store_information")}</h4>
                <ul className="space-y-3">
                  {vendor.address && (
                    <li className="flex">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{vendor.address}</span>
                    </li>
                  )}
                  {vendor.phone && (
                    <li className="flex">
                      <Phone className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{vendor.phone}</span>
                    </li>
                  )}
                  {vendor.email && (
                    <li className="flex">
                      <Mail className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{vendor.email}</span>
                    </li>
                  )}
                  {vendor.hours && (
                    <li className="flex">
                      <Clock className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      <div className="text-gray-600">
                        {vendor.hours.map((hour, index) => (
                          <div key={index}>{hour}</div>
                        ))}
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Store Policies */}
              <div>
                <h4 className="font-medium mb-4">{t("store_policies")}</h4>
                <div className="space-y-4">
                  {vendor.policies?.map((policy, index) => (
                    <div key={index}>
                      <h5 className="font-medium text-sm mb-1">{policy.title}</h5>
                      <p className="text-sm text-gray-600">{policy.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
