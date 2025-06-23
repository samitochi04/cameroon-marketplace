import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

export const CategoryModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  category, 
  categories = [], 
  isCreating = false 
}) => {
  const { t } = useTranslation();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || '',
      imageUrl: category?.imageUrl || '',
      isActive: category?.isActive !== false,
    }
  });

  React.useEffect(() => {
    if (category || isCreating) {
      reset({
        name: category?.name || '',
        description: category?.description || '',
        parentId: category?.parentId || '',
        imageUrl: category?.imageUrl || '',
        isActive: category?.isActive !== false,
      });
    }
  }, [category, isCreating, reset]);

  const handleSave = async (data) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Filter out the current category from parent options to prevent circular references
  const parentOptions = categories.filter(cat => cat.id !== category?.id);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? t('admin.add_category') : t('admin.edit_category')}
      size="md"
    >
      <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.category_name')} *
          </label>
          <Controller
            name="name"
            control={control}
            rules={{ 
              required: t('admin.category_name_required'),
              minLength: { 
                value: 2, 
                message: t('admin.category_name_min_length') 
              }
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={t('admin.category_name_placeholder')}
                error={errors.name?.message}
              />
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.category_description')}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={3}
                placeholder={t('admin.category_description_placeholder')}
              />
            )}
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.parent_category')}
          </label>
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: '', label: t('admin.no_parent_category') },
                  ...parentOptions.map(cat => ({
                    value: cat.id,
                    label: cat.name
                  }))
                ]}
              />
            )}
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('admin.category_image_url')}
          </label>
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="url"
                placeholder="https://example.com/image.jpg"
              />
            )}
          />
        </div>

        {/* Status */}
        <div className="flex items-center">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mr-2 rounded border-gray-300 text-primary focus:border-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">
                  {t('admin.category_is_active')}
                </span>
              </label>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {isCreating ? t('admin.create_category') : t('admin.update_category')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};