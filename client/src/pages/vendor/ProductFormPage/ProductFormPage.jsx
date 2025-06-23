import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Save, Upload, X, AlertCircle, HelpCircle, Info } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { useAuth } from "@/context/AuthContext"; // Add this import
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { ImageUploader } from "@/components/vendor/ImageUploader";
import { supabase } from '@/lib/supabase';
import { generateSlug } from "@/utils/stringUtils";

// Price markup calculator based on tiered pricing
const calculateSalePrice = (basePrice) => {
  const price = Number(basePrice);
  if (isNaN(price) || price <= 0) return "";
  
  let markup;
  if (price <= 50000) {
    markup = 0.15; // 15%
  } else if (price <= 100000) {
    markup = 0.20; // 20%
  } else if (price <= 300000) {
    markup = 0.25; // 25%
  } else if (price <= 1000000) {
    markup = 0.30; // 30%
  } else {
    markup = 0.35; // 35%
  }
  
  return (price * (1 + markup)).toFixed(2);
};

export const ProductFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // If present, we're editing a product
  const isEditing = !!id;
  const { user } = useAuth(); // Get the authenticated user
  
  const { 
    getProductById, 
    addProduct, 
    updateProduct, 
    createLoading, 
    updateLoading 
  } = useVendor();
  
  const { categories } = useCategories();
  
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState("");
  const [markupPercent, setMarkupPercent] = useState(15); // Default markup
  
  const { 
    control, 
    handleSubmit, 
    setValue,
    watch,
    getValues,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      stockQuantity: "1",
      sku: "",
      status: "draft",
      weight: "",
      isFeatured: false,
      dimensions: { length: "", width: "", height: "" }
    }
  });
  
  // Watch values for slug generation and price calculation
  const productName = watch("name");
  const categoryId = watch("categoryId");
  const basePrice = watch("price");
  
  // Generate slug when name or category changes
  useEffect(() => {
    if (productName && categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const slug = generateSlug(`${category.name}-${productName}`);
        console.log(`Generated slug: ${slug}`);
      }
    }
  }, [productName, categoryId, categories]);
  
  // Calculate sale price when base price changes
  useEffect(() => {
    if (basePrice) {
      const price = Number(basePrice);
      if (!isNaN(price) && price > 0) {
        let markup;
        if (price <= 50000) {
          markup = 0.15; // 15%
          setMarkupPercent(15);
        } else if (price <= 100000) {
          markup = 0.20; // 20%
          setMarkupPercent(20);
        } else if (price <= 300000) {
          markup = 0.25; // 25%
          setMarkupPercent(25);
        } else if (price <= 1000000) {
          markup = 0.30; // 30%
          setMarkupPercent(30);
        } else {
          markup = 0.35; // 35%
          setMarkupPercent(35);
        }
        
        const salePrice = (price * (1 + markup)).toFixed(2);
        setCalculatedPrice(salePrice);
      } else {
        setCalculatedPrice("");
      }
    } else {
      setCalculatedPrice("");
    }
  }, [basePrice]);
  
  // Load product data if editing
  useEffect(() => {
    if (isEditing) {
      const loadProduct = async () => {
        try {
          const product = await getProductById(id);
          if (product) {
            setValue("name", product.name);
            setValue("description", product.description);
            setValue("price", product.price);
            setValue("categoryId", product.category_id);
            setValue("stockQuantity", product.stock_quantity);
            setValue("sku", product.sku || "");
            setValue("status", product.status);
            setValue("weight", product.weight || "");
            setValue("isFeatured", product.is_featured || false);
            
            if (product.dimensions) {
              setValue("dimensions", product.dimensions);
            }
            
            // Load images
            if (product.images) {
              setImages(product.images);
            }
          }
        } catch (error) {
          console.error("Failed to load product:", error);
          setError(t("failed_to_load_product"));
        }
      };
      
      loadProduct();
    }
  }, [isEditing, id, getProductById, setValue, t]);
  
  // Handle image upload
  const handleImageUpload = async (files) => {
    if (files.length + images.length > 5) {
      setError(t("common.product_form.max_images_error", { max: 5 }));
      return;
    }
    
    // Check if user is authenticated
    if (!user || !user.id) {
      console.error("User not authenticated");
      setError("Authentication required. Please log in again.");
      return;
    }
    
    try {
      const uploadedImages = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExt}`;
        
        // Use the user ID from auth context
        const filePath = `${user.id}/products/${fileName}`;
        
        console.log("Uploading to path:", filePath);
        
        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('vendor-assets')  // Make sure this bucket exists
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('vendor-assets')
          .getPublicUrl(filePath);
        
        console.log("Upload successful:", urlData);
        uploadedImages.push(urlData.publicUrl);
      }
      
      setImages((prevImages) => [...prevImages, ...uploadedImages]);
      setError(null);
    } catch (error) {
      console.error("Error uploading images:", error);
      setError(t("common.product_form.image_upload_error"));
    }
  };
  
  // Remove image
  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };
  
  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Generate slug from name and category
      const category = categories.find(c => c.id === data.categoryId);
      const slug = generateSlug(`${category?.name || 'product'}-${data.name}`);
      
      // Format the product data
      const productData = {
        name: data.name,
        slug: slug,
        description: data.description,
        price: Number(data.price),
        sale_price: Number(calculatedPrice),
        category_id: data.categoryId,
        stock_quantity: Number(data.stockQuantity),
        sku: data.sku,
        status: data.status,
        weight: data.weight ? Number(data.weight) : null,
        dimensions: data.dimensions,
        is_featured: data.isFeatured,
        images: images
      };
      
      console.log("Saving product:", productData);
      
      try {
        if (isEditing) {
          await updateProduct(id, productData);
        } else {
          await addProduct(productData);
        }
        
        // Only navigate if successful
        navigate("/vendor-portal/products");
      } catch (error) {
        console.error("API error when saving product:", error);
        setError(`Failed to save product: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Form error when saving product:", error);
      setError(error.message || t("common.product_form.failed_to_save_product"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/vendor-portal/products")}
            className="mr-4"
            size="sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? t("edit_product") : t("add_new_product")}
            </h1>
            <p className="text-gray-500">{isEditing ? t("update_product_info") : t("create_new_product")}</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate("/vendor-portal/products")}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            leftIcon={Save}
          >
            {isSubmitting ? t("saving") : t("save_product")}
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="basic">{t("basic_info")}</Tab>
          <Tab value="images">{t("images")}</Tab>
          <Tab value="inventory">{t("inventory_shipping")}</Tab>
          <Tab value="advanced">{t("advanced")}</Tab>
        </TabList>
        
        {/* Basic Info Tab */}
        <TabPanel value="basic">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Product name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("product_name")} *
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: t("product_name_required") }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("product_name_placeholder")}
                        error={errors.name?.message}
                      />
                    )}
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("category")} *
                  </label>
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={{ required: t("category_required") }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={categories.map(cat => ({
                          value: cat.id,
                          label: cat.name
                        }))}
                        placeholder={t("select_category")}
                        error={errors.categoryId?.message}
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("description")} *
                </label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: t("description_required") }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      placeholder={t("description_placeholder")}
                      rows={6}
                      error={errors.description?.message}
                    />
                  )}
                />
              </div>
              
              {/* Price Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("base_price")} (XAF) *
                  </label>
                  <Controller
                    name="price"
                    control={control}
                    rules={{ 
                      required: t("price_required"),
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: t("invalid_price")
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        leftAddon="XAF"
                        error={errors.price?.message}
                      />
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t("base_price_description")}
                  </p>
                </div>
                
                {/* Sale Price (Calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("sale_price")} (XAF)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={calculatedPrice}
                      readOnly
                      className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-0 px-3 flex items-center bg-gray-100 border-r border-gray-300 rounded-l-md">
                      <span className="text-gray-500 sm:text-sm">XAF</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center">
                    <Info className="h-4 w-4 text-blue-500 mr-1" />
                    <p className="text-sm text-gray-600">
                      {basePrice ? `${markupPercent}% markup applied` : 'Enter a base price to see the calculated sale price'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Featured Product */}
              <div>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      checked={field.value}
                      onChange={field.onChange}
                      label={t("featured_product")}
                    />
                  )}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t("featured_product_description")}
                </p>
              </div>
            </div>
          </Card>
        </TabPanel>
        
        {/* Images Tab */}
        <TabPanel value="images">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium">{t("product_images")}</h3>
                  <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {images.length}/5
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {t("product_images_description")}
                </p>
                
                {/* Image uploader */}
                <div className="mb-6">
                  <input
                    type="file"
                    id="product-images"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                    disabled={images.length >= 5}
                  />
                  <label 
                    htmlFor="product-images"
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer
                      ${images.length >= 5 ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 hover:border-primary'}`}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-700">
                      {images.length >= 5 
                        ? t("max_images_reached") 
                        : t("click_to_upload_images")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("image_requirements")}
                    </p>
                  </label>
                </div>
                
                {/* Image preview */}
                {images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {t("uploaded_images")}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="object-cover w-full h-36"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-1 text-center">
                              {t("primary_image")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabPanel>
        
        {/* Inventory & Shipping Tab */}
        <TabPanel value="inventory">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-2">{t("inventory")}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("sku")}
                  </label>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("sku_placeholder")}
                      />
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {t("sku_description")}
                  </p>
                </div>
                
                {/* Stock quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("stock_quantity")} *
                  </label>
                  <Controller
                    name="stockQuantity"
                    control={control}
                    rules={{ 
                      required: t("stock_quantity_required"),
                      min: {
                        value: 0,
                        message: t("invalid_stock_quantity")
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="0"
                        error={errors.stockQuantity?.message}
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Shipping info */}
              <h3 className="text-lg font-medium mb-2 pt-4 border-t">
                {t("shipping_information")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("weight_kg")}
                  </label>
                  <Controller
                    name="weight"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        rightAddon="kg"
                      />
                    )}
                  />
                </div>
                
                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("length_cm")}
                  </label>
                  <Controller
                    name="dimensions.length"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="0"
                        rightAddon="cm"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("width_cm")}
                  </label>
                  <Controller
                    name="dimensions.width"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="0"
                        rightAddon="cm"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("height_cm")}
                  </label>
                  <Controller
                    name="dimensions.height"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="0"
                        rightAddon="cm"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>
        
        {/* Advanced Tab */}
        <TabPanel value="advanced">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Product status */}
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {t("product_status")}
                </h3>
                
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { value: "draft", label: t("draft") },
                        { value: "published", label: t("published") }
                      ]}
                    />
                  )}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t("product_status_description")}
                </p>
              </div>
              
              {/* Pricing Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">
                  {t("pricing_information")}
                </h3>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-400 mr-2" />
                    <p className="text-sm text-blue-700">
                      {t("pricing_explanation")}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm mb-3">
                    <strong>{t("price_markup_tiers")}:</strong>
                  </div>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 0 - 50,000 XAF: 15% markup</li>
                    <li>• 50,001 - 100,000 XAF: 20% markup</li>
                    <li>• 100,001 - 300,000 XAF: 25% markup</li>
                    <li>• 300,001 - 1,000,000 XAF: 30% markup</li>
                    <li>• 1,000,001+ XAF: 35% markup</li>
                  </ul>
                  
                  <div className="mt-3 text-sm">
                    <strong>{t("your_pricing")}:</strong>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-gray-500">{t("your_price")}</div>
                        <div className="font-semibold">{basePrice ? `${Number(basePrice).toLocaleString()} XAF` : '-'}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-gray-500">{t("markup")}</div>
                        <div className="font-semibold">{basePrice ? `${markupPercent}%` : '-'}</div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-xs text-gray-500">{t("final_price")}</div>
                        <div className="font-semibold">{calculatedPrice ? `${Number(calculatedPrice).toLocaleString()} XAF` : '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};

// Add default export
export default ProductFormPage;
