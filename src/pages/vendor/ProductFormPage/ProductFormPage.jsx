import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Save, Upload, X, AlertCircle } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { ImageUploader } from "@/components/vendor/ImageUploader";

export const ProductFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // If present, we're editing a product
  const isEditing = !!id;
  
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
  
  const { 
    control, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      salePrice: "",
      categoryId: "",
      stockQuantity: "1",
      sku: "",
      status: "draft",
      weight: "",
      isDigital: false,
      digitalUrl: "",
      dimensions: { length: "", width: "", height: "" }
    }
  });
  
  const isDigital = watch("isDigital");
  
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
            setValue("salePrice", product.salePrice || "");
            setValue("categoryId", product.categoryId);
            setValue("stockQuantity", product.stockQuantity);
            setValue("sku", product.sku || "");
            setValue("status", product.status);
            setValue("weight", product.weight || "");
            setValue("isDigital", product.isDigital || false);
            setValue("digitalUrl", product.digitalUrl || "");
            
            if (product.dimensions) {
              setValue("dimensions", product.dimensions);
            }
            
            setImages(product.images || []);
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
  const handleImageUpload = (uploadedImages) => {
    setImages((prevImages) => [...prevImages, ...uploadedImages]);
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
      const productData = {
        ...data,
        images,
      };
      
      if (isEditing) {
        await updateProduct(id, productData);
      } else {
        await addProduct(productData);
      }
      
      navigate("/vendor/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      setError(t("failed_to_save_product"));
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
            onClick={() => navigate("/vendor/products")}
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
            onClick={() => navigate("/vendor/products")}
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
              
              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("price")} *
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
                        leftAddon="$"
                        error={errors.price?.message}
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("sale_price")}
                  </label>
                  <Controller
                    name="salePrice"
                    control={control}
                    rules={{ 
                      pattern: {
                        value: /^$|^\d+(\.\d{1,2})?$/,
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
                        leftAddon="$"
                        error={errors.salePrice?.message}
                      />
                    )}
                  />
                </div>
              </div>
              
              {/* Digital product toggle */}
              <div>
                <Controller
                  name="isDigital"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      checked={field.value}
                      onChange={field.onChange}
                      label={t("digital_product")}
                    />
                  )}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t("digital_product_description")}
                </p>
              </div>
              
              {/* Digital URL (shown only for digital products) */}
              {isDigital && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("digital_product_url")}
                  </label>
                  <Controller
                    name="digitalUrl"
                    control={control}
                    rules={{
                      required: isDigital ? t("digital_url_required") : false
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t("digital_url_placeholder")}
                        error={errors.digitalUrl?.message}
                      />
                    )}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabPanel>
        
        {/* Images Tab */}
        <TabPanel value="images">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{t("product_images")}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t("product_images_description")}
                </p>
                
                {/* Image uploader */}
                <ImageUploader onUpload={handleImageUpload} />
                
                {/* Image preview */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      {t("uploaded_images")}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
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
              
              {/* Shipping info (only for physical products) */}
              {!isDigital && (
                <>
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
                </>
              )}
              
              {/* Product status */}
              <h3 className="text-lg font-medium mb-2 pt-4 border-t">
                {t("product_status")}
              </h3>
              
              <div>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { value: "draft", label: t("draft") },
                        { value: "published", label: t("published") },
                        { value: "archived", label: t("archived") }
                      ]}
                    />
                  )}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t("product_status_description")}
                </p>
              </div>
            </div>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};
