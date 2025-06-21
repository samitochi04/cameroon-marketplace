import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

export const UserModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  user, 
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
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      role: user?.role || 'customer',
      status: user?.status || 'active',
    }
  });

  React.useEffect(() => {
    if (user || isCreating) {
      reset({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        role: user?.role || 'customer',
        status: user?.status || 'active',
      });
    }
  }, [user, isCreating, reset]);

  const handleSave = async (data) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('profile.not_available');
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'vendor':
        return 'info';
      case 'customer':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'banned':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? t('admin.add_user') : t('admin.edit_user')}
      size="lg"
    >
      <div className="space-y-6">
        {/* User Header - Only show for existing users */}
        {!isCreating && user && (
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{user.name || 'Unknown User'}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {t(`admin.role_${user.role}`)}
                </Badge>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {t(`admin.status_${user.status}`)}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{t('common.member_since')}: {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.name')} *
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ 
                  required: t('profile.name_required'),
                  minLength: { 
                    value: 2, 
                    message: t('admin.name_min_length') 
                  }
                }}
                render={({ field }) => (
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      placeholder={t('profile.name_placeholder')}
                      error={errors.name?.message}
                      className="pl-10"
                    />
                  </div>
                )}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.email')} *
              </label>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: t('common.email_required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('common.invalid_email')
                  }
                }}
                render={({ field }) => (
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('common.email_placeholder')}
                      error={errors.email?.message}
                      className="pl-10"
                      disabled={!isCreating} // Email can't be changed after creation
                    />
                  </div>
                )}
              />
              {!isCreating && (
                <p className="text-xs text-gray-500 mt-1">{t('profile.email_cannot_be_changed')}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.phone_number')}
              </label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  pattern: {
                    value: /^[+]?[(]?[\d\s\-()]{10,}$/,
                    message: t('profile.invalid_phone_number')
                  }
                }}
                render={({ field }) => (
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+237 6XX XXX XXX"
                      error={errors.phone?.message}
                      className="pl-10"
                    />
                  </div>
                )}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.user_role')} *
              </label>
              <Controller
                name="role"
                control={control}
                rules={{ required: t('admin.role_required') }}
                render={({ field }) => (
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 z-10" />
                    <Select
                      {...field}
                      options={[
                        { value: 'customer', label: t('admin.role_customer') },
                        { value: 'vendor', label: t('admin.role_vendor') },
                        { value: 'admin', label: t('admin.role_admin') },
                      ]}
                      error={errors.role?.message}
                      className="pl-10"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile.address')}
            </label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    {...field}
                    placeholder={t('profile.address_placeholder')}
                    className="pl-10"
                  />
                </div>
              )}
            />
          </div>

          {/* Status - Only show for existing users */}
          {!isCreating && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.user_status')}
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: 'active', label: t('admin.status_active') },
                      { value: 'inactive', label: t('admin.status_inactive') },
                      { value: 'banned', label: t('admin.status_banned') },
                    ]}
                  />
                )}
              />
            </div>
          )}

          {/* Additional User Info - Only show for existing users */}
          {!isCreating && user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">{t('admin.additional_information')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">{t('admin.user_id')}:</span>
                  <p className="font-mono text-xs">{user.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">{t('admin.email_verified')}:</span>
                  <p>{user.emailVerified ? t('common.yes') : t('common.no')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">{t('admin.last_login')}:</span>
                  <p>{user.lastLoginAt ? formatDate(user.lastLoginAt) : t('admin.never')}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">{t('admin.orders_count')}:</span>
                  <p>{user.ordersCount || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              {isCreating ? t('admin.create_user') : t('admin.update_user')}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};