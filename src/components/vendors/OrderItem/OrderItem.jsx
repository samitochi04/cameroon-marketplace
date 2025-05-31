import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { ChevronsDown, Package, ExternalLink, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useVendor } from "@/hooks/useVendor";

export const OrderItem = ({ 
  orderItem, 
  showOrderDetails = false,
  onStatusChange,
  onViewDetails
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectValue, setSelectValue] = useState(orderItem.status);
  const { updateOrderItemStatus } = useVendor();
  
  const toggleExpand = () => setExpanded(!expanded);
  
  // Format date helper
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('default', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(new Date(dateString));
  };
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'returned':
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Loader;
      case 'shipped':
        return Package;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
      case 'returned':
        return XCircle;
      default:
        return Clock;
    }
  };
  
  // Handle status change
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setSelectValue(newStatus);
    
    try {
      setIsUpdating(true);
      await onStatusChange(orderItem.id, newStatus);
    } catch (error) {
      // Reset to previous value on error
      setSelectValue(orderItem.status);
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = getStatusIcon(orderItem.status);
  
  return (
    <Card className="mb-4 overflow-hidden">
      {/* Order item header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center">
          <div className="mr-3">
            <Badge variant={getStatusBadgeVariant(orderItem.status)}>
              <StatusIcon className="w-3.5 h-3.5 mr-1" />
              {t(orderItem.status)}
            </Badge>
          </div>
          <div>
            <h3 className="font-medium">
              {t("order_number")}: <span className="font-bold">{orderItem.orderId.slice(0, 8)}</span>
            </h3>
            <p className="text-xs text-gray-500">
              {t("ordered_on")} {formatDate(orderItem.createdAt)}
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleExpand}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronsDown className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      
      {/* Order item content */}
      <div className="p-4">
        <div className="flex flex-col md:flex-row">
          {/* Product image */}
          <div className="md:w-20 md:h-20 w-full h-32 flex-shrink-0 mb-4 md:mb-0 md:mr-4">
            <img
              src={orderItem.product?.imageUrl || "/placeholder-product.jpg"}
              alt={orderItem.product?.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          
          {/* Product info */}
          <div className="flex-1">
            <h4 className="font-medium text-lg mb-1">{orderItem.product?.name}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <p>{t("quantity")}: {orderItem.quantity}</p>
              <p>{t("unit_price")}: {formatCurrency(orderItem.price)}</p>
              <p className="font-medium">{t("total")}: {formatCurrency(orderItem.total)}</p>
            </div>
            
            {/* Customer info if expanded */}
            {expanded && (
              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium mb-2">{t("shipping_details")}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">{t("customer")}</p>
                    <p>{orderItem.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("email")}</p>
                    <p>{orderItem.customer?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("phone")}</p>
                    <p>{orderItem.customer?.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("address")}</p>
                    <p>{orderItem.shippingAddress?.address || "-"}</p>
                    <p>
                      {orderItem.shippingAddress?.city}, {orderItem.shippingAddress?.postalCode || ""}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="md:ml-4 mt-4 md:mt-0 flex flex-col md:items-end justify-between">
            <div className="flex flex-col space-y-2">
              {/* Status selector */}
              <div className="flex items-center space-x-2">
                <label htmlFor={`status-${orderItem.id}`} className="text-sm whitespace-nowrap">
                  {t("status")}:
                </label>
                <div className="relative">
                  <Select
                    id={`status-${orderItem.id}`}
                    value={selectValue}
                    onChange={handleStatusChange}
                    disabled={isUpdating}
                    className="min-w-32 text-sm"
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processing">{t("processing")}</option>
                    <option value="shipped">{t("shipped")}</option>
                    <option value="delivered">{t("delivered")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                  </Select>
                  {isUpdating && (
                    <Loader className="absolute right-8 top-2.5 w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
              </div>
            </div>
            
            {showOrderDetails && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 md:mt-auto"
                rightIcon={ExternalLink}
                onClick={() => onViewDetails(orderItem.orderId)}
              >
                {t("view_order")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

OrderItem.propTypes = {
  orderItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    orderId: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    product: PropTypes.shape({
      name: PropTypes.string.isRequired,
      imageUrl: PropTypes.string
    }),
    customer: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      phone: PropTypes.string
    }),
    shippingAddress: PropTypes.shape({
      address: PropTypes.string,
      city: PropTypes.string,
      postalCode: PropTypes.string
    })
  }).isRequired,
  showOrderDetails: PropTypes.bool,
  onStatusChange: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func
};

OrderItem.defaultProps = {
  showOrderDetails: false,
  onViewDetails: () => {}
};
