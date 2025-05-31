import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Image,
  AlertTriangle,
  Check
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const ProductForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { get, post, put } = useApi();

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      salePrice: '',
      stockQuantity: 1,
      categoryId: '',
      status: 'draft'
    }
  });

  // Watch form fields for live updates
  const watchedPrice = watch('price');
  const watchedSalePrice = watch('salePrice');
  const watchedStatus = watch('status');

  // Load categories and product data if in edit mode
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await get('/categories');
        setCategories(categoriesRes.data || []);

        // If in edit mode, fetch product data
        if (isEditMode) {
          const productRes = await get(`/products/${id}`);
          const product = productRes.data;
          
          if (product) {
            // Set form values
            setValue('name', product.name);
            setValue('description', product.description);
            setValue('price', product.price);
            setValue('salePrice', product.salePrice || '');
            setValue('stockQuantity', product.stockQuantity);
            setValue('categoryId', product.categoryId);
            setValue('status', product.status);
            
            // Set images
            setImages(product.images || []);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(error.message || t('failed_to_load_data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [get, id, isEditMode, setValue, t]);

  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newImages = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Handle image removal
  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Upload images to server
  const uploadImages = async () => {
    if (!imageFiles.length) return images;

    setImageUploading(true);
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImageUploading(false);
      return response.data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      setError(t('image_upload_failed'));
      setImageUploading(false);
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Upload images if any
      let productImages = images;
      if (imageFiles.length > 0) {
        const uploadedImageUrls = await uploadImages();
        productImages = uploadedImageUrls;
      }

      // Prepare product data
      const productData = {
        ...data,
        price: parseFloat(data.price),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        stockQuantity: parseInt(data.stockQuantity),
        images: productImages
      };

      // Create or update product
      if (isEditMode) {
        await put(`/products/${id}`, productData);
      } else {
        await post('/products', productData);
      }

      // Show success message and redirect after delay
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/vendor-portal/products');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || t('failed_to_save_product'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/vendor-portal/products')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back_to_products')}
        </button>
        
        <h1 className="text-2xl font-bold">
          {isEditMode ? t('edit_product') : t('add_new_product')}
        </h1>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-md flex items-center text-green-700">
          <Check className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{isEditMode ? t('product_updated_successfully') : t('product_created_successfully')}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('product_information')}</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('product_name')} *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { 
                  required: t('product_name_required') 
                })}
                className={`w-full px-4 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')} *
              </label>
              <textarea
                id="description"
                rows={5}
                {...register('description', { 
                  required: t('description_required') 
                })}
                className={`w-full px-4 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('pricing_inventory')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('price')} (XAF) *
              </label>
              <input
                type="number"
                id="price"
                {...register('price', { 
                  required: t('price_required'),
                  min: {
                    value: 0,
                    message: t('price_must_be_positive')
                  }
                })}
                className={`w-full px-4 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            
            {/* Sale Price */}
            <div>
              <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                {t('sale_price')} (XAF)
              </label>
              <input
                type="number"
                id="salePrice"
                {...register('salePrice', { 
                  min: {
                    value: 0,
                    message: t('sale_price_must_be_positive')
                  },
                  validate: value => 
                    !value || parseFloat(value) < parseFloat(watchedPrice) || 
                    t('sale_price_must_be_less_than_regular_price')
                })}
                className={`w-full px-4 py-2 border rounded-md ${errors.salePrice ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.salePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.salePrice.message}</p>
              )}
            </div>
            
            {/* Stock Quantity */}
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                {t('stock_quantity')} *
              </label>
              <input
                type="number"
                id="stockQuantity"
                {...register('stockQuantity', { 
                  required: t('stock_quantity_required'),
                  min: {
                    value: 0,
                    message: t('stock_quantity_must_be_positive')
                  }
                })}
                className={`w-full px-4 py-2 border rounded-md ${errors.stockQuantity ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.stockQuantity && (
                <p className="mt-1 text-sm text-red-600">{errors.stockQuantity.message}</p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                {t('category')} *
              </label>
              <select
                id="categoryId"
                {...register('categoryId', { 
                  required: t('category_required') 
                })}
                className={`w-full px-4 py-2 border rounded-md ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">{t('select_category')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('product_images')}</h2>
          
          {/* Image upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('upload_images')}
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {/* Display existing images */}
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square border border-gray-200 rounded-md overflow-hidden">
                    <img 
                      src={img} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
              
              {/* Add image button */}
              <label className="cursor-pointer">
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors">
                  <Image className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">{t('add_image')}</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <p className="text-sm text-gray-500">
              {t('image_requirements')}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('product_status')}</h2>
          
          {/* Status */}
          <div className="mb-4">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="draft"
                  {...register('status')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="ml-2">{t('draft')}</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="published"
                  {...register('status')}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="ml-2">{t('published')}</span>
              </label>
            </div>
            
            <p className="mt-2 text-sm text-gray-500">
              {watchedStatus === 'published'
                ? t('published_product_visible')
                : t('draft_product_not_visible')}
            </p>
          </div>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/vendor-portal/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-3"
          >
            {t('cancel')}
          </button>
          
          <button
            type="submit"
            disabled={isSaving || imageUploading}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            {isSaving || imageUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('save_product')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
