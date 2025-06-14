import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Star, ShoppingCart, Share2, Minus, Plus, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProductDetail } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/products/ProductCard";

export const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { product, loading, error, relatedProducts } = useProductDetail(slug);
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  
  useEffect(() => {
    // Reset selected image and quantity when product changes
    setSelectedImage(0);
    setQuantity(1);
  }, [product]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{t("product_not_found")}</h2>
        <p className="mb-8">{t("product_not_found_message")}</p>
        <Button as={Link} to="/products" variant="primary">
          {t("back_to_products")}
        </Button>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    addItem(product, quantity);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const incrementQuantity = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">
            {t("home")}
          </Link>
          <span className="mx-2">›</span>
          <Link to="/products" className="hover:text-primary">
            {t("products")}
          </Link>
          <span className="mx-2">›</span>
          <Link to={`/category/${product.category.slug}`} className="hover:text-primary">
            {product.category.name}
          </Link>
          <span className="mx-2">›</span>
          <span className="truncate max-w-[200px]">{product.name}</span>
        </div>
        
        {/* Back Button (Mobile) */}
        <div className="mb-4 md:hidden">
          <Button
            variant="outline"
            size="sm"
            as={Link}
            to="/products"
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t("back_to_products")}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 p-4 md:p-8">
            {/* Product Images - Left Column on desktop, Top on mobile */}
            <div className="lg:col-span-3">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Thumbnails - Horizontal on mobile, Vertical on desktop */}
                <div className="order-2 md:order-1 md:w-20 flex md:flex-col gap-2 overflow-auto">
                  {product.images?.map((image, index) => (
                    <div
                      key={index}
                      className={`
                        border-2 rounded cursor-pointer flex-shrink-0 w-16 h-16
                        ${selectedImage === index ? 'border-primary' : 'border-transparent'}
                      `}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - view ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Main Image */}
                <div className="order-1 md:order-2 flex-grow">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        {t("no_image_available")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info - Right Column */}
            <div className="lg:col-span-2">
              <div className="flex flex-col h-full">
                {/* Product Vendor */}
                <Link
                  to={`/vendor/${product.vendor.id}`}
                  className="text-sm text-primary hover:underline mb-2"
                >
                  {product.vendor.name}
                </Link>
                
                {/* Product Name */}
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-none text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.reviewCount} {t("reviews")})
                  </span>
                </div>
                
                {/* Price */}
                <div className="mb-6">
                  {product.salePrice ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary">
                        ${product.salePrice.toFixed(2)}
                      </span>
                      <span className="ml-2 text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                      <Badge variant="danger" className="ml-2">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% {t("off")}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="mb-6">
                  {product.stockQuantity > 0 ? (
                    <Badge variant="success">
                      {product.stockQuantity > 10
                        ? t("in_stock")
                        : t("only_x_left", { count: product.stockQuantity })}
                    </Badge>
                  ) : (
                    <Badge variant="danger">{t("out_of_stock")}</Badge>
                  )}
                </div>
                
                {/* Quantity Selector */}
                {product.stockQuantity > 0 && (
                  <div className="flex items-center mb-6">
                    <span className="text-sm font-medium mr-4">{t("quantity")}:</span>
                    <div className="flex border border-gray-300 rounded-md">
                      <button
                        type="button"
                        className="px-3 py-1 border-r border-gray-300 text-gray-600 hover:bg-gray-100"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        className="w-12 text-center border-0 focus:ring-0"
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0 && value <= product.stockQuantity) {
                            setQuantity(value);
                          }
                        }}
                        min="1"
                        max={product.stockQuantity}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 border-l border-gray-300 text-gray-600 hover:bg-gray-100"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stockQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    disabled={product.stockQuantity === 0}
                    onClick={handleAddToCart}
                    leftIcon={ShoppingCart}
                  >
                    {t("add_to_cart")}
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Short Description */}
                <p className="text-gray-600 mb-4">
                  {product.shortDescription}
                </p>
                
                {/* Product Metadata */}
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">{t("sku")}:</span> {product.sku}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">{t("category")}:</span>{" "}
                    <Link to={`/category/${product.category.slug}`} className="hover:underline">
                      {product.category.name}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-6 inline-flex items-center border-b-2 text-sm font-medium
                    ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {t(tab)}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === "description" && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t("product_description")}</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
            
            {activeTab === "specifications" && (
              <div>
                <h3 className="text-lg font-medium mb-4">{t("specifications")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {product.specifications?.map((spec, index) => (
                    <div key={index} className="py-2 border-b border-gray-100 flex">
                      <span className="font-medium w-1/3">{spec.name}:</span>
                      <span className="text-gray-600 w-2/3">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "reviews" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium">{t("customer_reviews")}</h3>
                  <Button variant="outline" size="sm">
                    {t("write_review")}
                  </Button>
                </div>
                
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review, index) => (
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
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts?.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t("related_products")}</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  imageUrl={product.images?.[0]}
                  onAddToCart={() => addItem(product, 1)}
                  onAddToWishlist={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
