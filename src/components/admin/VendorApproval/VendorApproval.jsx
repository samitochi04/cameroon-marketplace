import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Check, X, Info, Store, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';

export const VendorApproval = ({ isOpen, onClose, vendor }) => {
  const { t } = useTranslation();
  const { approveVendor, rejectVendor, loading } = useAdmin();
  
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      commissionRate: vendor?.commissionRate || 10,
      notes: '',
      rejectionReason: ''
    }
  });
  
  React.useEffect(() => {
    if (vendor) {
      reset({
        commissionRate: vendor.commissionRate || 10,
        notes: '',
        rejectionReason: ''
      });
    }
  }, [vendor, reset]);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleApprove = async (data) => {
    setIsApproving(true);
    try {
      await approveVendor(vendor.id, {
        commissionRate: parseFloat(data.commissionRate),
        notes: data.notes
      });
      onClose(true); // Close with refresh flag
    } catch (error) {
      console.error("Failed to approve vendor:", error);
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleReject = async (data) => {
    setIsRejecting(true);
    try {
      await rejectVendor(vendor.id, data.rejectionReason);
      onClose(true); // Close with refresh flag
    } catch (error) {
      console.error("Failed to reject vendor:", error);
    } finally {
      setIsRejecting(false);
    }
  };
  
  if (!vendor) return null;
  
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t("review_vendor_application")}
      size="lg"
    >
      <div className="space-y-6">
        {/* Vendor Profile Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
            <div className="h-16 w-16 rounded-md bg-gray-200 flex-shrink-0 mr-4 overflow-hidden">
              {vendor.logoUrl ? (
                <img 
                  src={vendor.logoUrl} 
                  alt={vendor.storeName} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <Store className="h-8 w-8" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {vendor.storeName}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{t("application_date")}: {formatDate(vendor.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <Mail className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-700">{t("email")}</div>
                <div>{vendor.email}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-700">{t("phone")}</div>
                <div>{vendor.phone || t("not_provided")}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-700">{t("address")}</div>
                <div>{vendor.storeAddress || t("not_provided")}</div>
              </div>
            </div>
            
            <div className="flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-700">{t("user_id")}</div>
                <div className="font-mono">{vendor.id}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Store Description */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{t("store_description")}</h4>
          <div className="bg-white border border-gray-200 rounded-md p-4 text-gray-700">
            {vendor.description || t("no_description_provided")}
          </div>
        </div>
        
        {/* Approval Form */}
        <form onSubmit={handleSubmit(handleApprove)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("commission_rate")} (%)
            </label>
            <Controller
              name="commissionRate"
              control={control}
              rules={{ 
                required: t("commission_rate_required"),
                min: { value: 1, message: t("min_commission_rate") },
                max: { value: 30, message: t("max_commission_rate") }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.5"
                  min="1"
                  max="30"
                  error={errors.commissionRate?.message}
                  className="w-full sm:w-32"
                />
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin_notes")} ({t("optional")})
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={2}
                  placeholder={t("internal_notes_placeholder")}
                />
              )}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t">
            {/* Reject Section */}
            <div className="space-y-3 w-full sm:w-1/2">
              <h4 className="font-medium text-gray-900">{t("reject_application")}</h4>
              
              <Controller
                name="rejectionReason"
                control={control}
                rules={{ 
                  required: isRejecting ? t("rejection_reason_required") : false 
                }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder={t("rejection_reason_placeholder")}
                    error={errors.rejectionReason?.message}
                  />
                )}
              />
              
              <Button
                type="button"
                variant="danger"
                leftIcon={<X />}
                disabled={loading || isApproving}
                isLoading={isRejecting}
                onClick={handleSubmit(handleReject)}
                className="w-full"
              >
                {t("reject_vendor")}
              </Button>
            </div>
            
            {/* Approve Button */}
            <div className="space-y-3 w-full sm:w-1/2">
              <h4 className="font-medium text-gray-900">{t("approve_application")}</h4>
              <p className="text-sm text-gray-500">
                {t("approve_vendor_notice")}
              </p>
              
              <Button
                type="submit"
                variant="success"
                leftIcon={<Check />}
                disabled={loading || isRejecting}
                isLoading={isApproving}
                className="w-full"
              >
                {t("approve_vendor")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
