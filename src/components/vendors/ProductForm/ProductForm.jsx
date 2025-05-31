import React, { useState } from "react";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { X, Plus, Upload, AlertCircle, Save } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Card } from "@/components/ui/Card";
import { Tabs, Tab } from "@/components/ui/Tabs";

export const ProductForm = ({
  initialValues = {},
  categories = [],
  onSubmit,
  isSubmitting = false,
  error = null
}) => {
  const { t } = useTranslation();
  const [images, setImages] = useState(initialValues.images || []);
  const [activeTab, setActiveTab] = useState("basic");
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: initialValues.name || "",
      description: initialValues.description || "",
      price: initialValues.price || "",
      salePrice: initialValues.salePrice || "",
      categoryId: initialValues.categoryId || "",
      stockQuantity: initialValues.stockQuantity || "1",
      sku: initialValues.sku || "",
      status: initialValues.status || "draft",
      weight: initialValues.weight || "",
      isDigital: initialValues.isDigital || false,
      digitalUrl: initialValues.digitalUrl || "",
      dimensions: initialValues.dimensions || { length: "", width: "", height: "" }
    }
  });
  
  const isDigital = watch("isDigital");
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newImages = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 15),
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      error: null
    }));
    
    setImages([...images, ...newImages]);
  };
  
  // Remove image from list
  const handleImageRemove = (id) => {
    setImages(images.filter(img => img.id !== id));
  };
  
  // Handle form submission
  const handleFormSubmit = (data) => {
    // Convert dimensions values to numbers
    const dimensions = {
      length: data.dimensions.length ? parseFloat(data.dimensions.length) : null,
      width: data.dimensions.width ? parseFloat(data.dimensions.width) : null,
      height: data.dimensions.height ? parseFloat(data.dimensions.height) : null
    };
    
    // Convert price values to numbers
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      stockQuantity: parseInt(data.stockQuantity, 10),
      dimensions,
      images
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      >
        <Tab value="basic">{t("basic_info")}</Tab>
        <Tab value="media">{t("images")}</Tab>
        <Tab value="pricing">{t("pricing_inventory")}</Tab>
        <Tab value="shipping">{t("shipping")}</Tab>
      </Tabs>
      
      {/* Basic Info Tab */}
      {activeTab === "basic" && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("product_name")} *
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ 
                  required: t("product_name_required"),
                  minLength: {
                    value: 3,
                    message: t("product_name_min_length")
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={t("enter_product_name")}
                    error={errors.name?.message}
                  />
                )}
              />
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
                    rows={5}
                    placeholder={t("enter_product_description")}
                    error={errors.description?.message}
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
                    placeholder={t("select_category")}
                    error={errors.categoryId?.message}
                  >
                    <option value="">{t("select_category")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>
            
            {/* Digital Product Toggle */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {t("digital_product")}
                </label>
                <Controller
                  name="isDigital"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("digital_product_description")}
              </p>
            </div>
            
            {/* Digital Product URL */}
            {isDigital && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("digital_product_url")} *
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
                      placeholder="https://example.com/files/product.pdf"
                      error={errors.digitalUrl?.message}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Media Tab */}
      {activeTab === "media" && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">{t("product_images")}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("product_images_description")}
              </p>
              
              {/* Image Uploader */}
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="pt-1 text-sm text-gray-400 group-hover:text-gray-600">
                        {t("drag_drop_or_click")}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
              </div>
              
              {/* Image Previews */}
              {images.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t("uploaded_images")}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                          <img
                            src={image.preview || image.url}
                            alt="Product preview"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageRemove(image.id)}
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
      )}
      
      {/* Pricing and Inventory Tab */}
      {activeTab === "pricing" && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Price */}
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
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    error={errors.price?.message}
                  />
                )}
              />
            </div>
            
            {/* Sale Price */}
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
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    error={errors.salePrice?.message}
                  />
                )}
              />
            </div>
            
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
                    placeholder={t("enter_sku")}
                    error={errors.sku?.message}
                  />
                )}
              />
            </div>
            
            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("stock_quantity")} *
              </label>
              <Controller
                name="stockQuantity"
                control={control}
                rules={{
                  required: t("stock_quantity_required"),
                  min: { value: 0, message: t("invalid_stock_quantity") }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    error={errors.stockQuantity?.message}
                  />
                )}
              />
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("product_status")}
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    error={errors.status?.message}
                  >
                    <option value="draft">{t("draft")}</option>
                    <option value="published">{t("published")}</option>
                    <option value="archived">{t("archived")}</option>
                  </Select>
                )}
              />
              <p className="mt-1 text-xs text-gray-500">{t("product_status_help")}</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Shipping Tab */}
      {activeTab === "shipping" && !isDigital && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{t("shipping_details")}</h3>
              
              {/* Weight */}
              <div className="mb-4">
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
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      error={errors.weight?.message}
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">{t("weight_help")}</p>
              </div>
              
              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("dimensions_cm")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Length */}
                  <div>
                    <Controller
                      name="dimensions.length"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder={t("length")}
                          error={errors.dimensions?.length?.message}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Width */}
                  <div>
                    <Controller
                      name="dimensions.width"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder={t("width")}
                          error={errors.dimensions?.width?.message}
                        />
                      )}
                    />
                  </div>
                  
                  {/* Height */}
                  <div>
                    <Controller
                      name="dimensions.height"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder={t("height")}
                          error={errors.dimensions?.height?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Submit Buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isSubmitting ? t("saving") : t("save_product")}
        </Button>
      </div>
    </form>
  );
};

ProductForm.propTypes = {
  initialValues: PropTypes.object,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.string
};
