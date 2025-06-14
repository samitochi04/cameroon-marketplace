import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, AlertCircle, Download, Eye, Calendar } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/common/Pagination";
import { OrderDetailModal } from "@/components/admin/modals/OrderDetailModal";
import { exportToCsv } from "@/utils/exportHelpers";

export const OrdersPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Get admin methods from hook
  const { 
    getAllOrders,
    getVendorsList,
    updateOrderStatus,
    loading 
  } = useAdmin();
  
  // State for orders data
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [vendors, setVendors] = useState([]);

  // Load vendors list
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorsList = await getVendorsList();
        setVendors(vendorsList);
      } catch (error) {
        console.error("Failed to load vendors:", error);
      }
    };

    fetchVendors();
  }, [getVendorsList]);

  // Load orders with filters
  const loadOrders = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        vendorId: vendorFilter !== "all" ? vendorFilter : undefined,
        search: searchQuery || undefined,
        dateFrom: dateRange.from ? dateRange.from.toISOString() : undefined,
        dateTo: dateRange.to ? dateRange.to.toISOString() : undefined,
      };

      const { data, pagination } = await getAllOrders(filters);
      
      setOrders(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  // Fetch orders when filters change
  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, vendorFilter, dateRange]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // If the modal is open and we're updating the current order, update it
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      // Reload orders to reflect changes
      loadOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "processing":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "danger";
      case "refunded":
        return "secondary";
      default:
        return "default";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Export orders to CSV
  const handleExportOrders = () => {
    const dataToExport = orders.map(order => ({
      ID: order.id,
      Customer: order.user?.name || order.user?.email || "Unknown",
      Status: order.status,
      Date: formatDate(order.createdAt),
      Total: order.totalAmount,
      PaymentStatus: order.paymentStatus,
      Items: order.items?.length || 0,
      PaymentMethod: order.paymentMethod
    }));

    exportToCsv(dataToExport, 'orders-export');
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setVendorFilter("all");
    setDateRange({ from: null, to: null });
    setCurrentPage(1);
    loadOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("manage_orders")}</h1>
          <p className="text-gray-500">{t("manage_orders_description")}</p>
        </div>
        <Button
          onClick={handleExportOrders}
          leftIcon={Download}
          variant="outline"
        >
          {t("export_orders")}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder={t("search_orders")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              icon={Filter}
            >
              <option value="all">{t("all_statuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="processing">{t("processing")}</option>
              <option value="completed">{t("completed")}</option>
              <option value="cancelled">{t("cancelled")}</option>
              <option value="refunded">{t("refunded")}</option>
            </Select>

            {/* Vendor Filter */}
            <Select
              value={vendorFilter}
              onChange={(e) => {
                setVendorFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">{t("all_vendors")}</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.storeName || vendor.name}
                </option>
              ))}
            </Select>

            {/* Date Filter */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                leftIcon={Calendar}
              >
                {dateRange.from
                  ? `${dateRange.from.toLocaleDateString()} - ${
                      dateRange.to ? dateRange.to.toLocaleDateString() : t("present")
                    }`
                  : t("select_date_range")}
              </Button>
              {isDatePickerOpen && (
                <div className="absolute z-10 mt-2 w-full">
                  <DateRangePicker
                    value={dateRange}
                    onChange={(value) => {
                      setDateRange(value);
                      setIsDatePickerOpen(false);
                      setCurrentPage(1);
                    }}
                    onClickOutside={() => setIsDatePickerOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {(statusFilter !== "all" || vendorFilter !== "all" || dateRange.from || searchQuery) && (
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              {t("clear_filters")}
            </Button>
          )}
          
          {/* Search Button (for mobile) */}
          <div className="block lg:hidden">
            <Button
              type="submit"
              onClick={handleSearch}
              leftIcon={Search}
              className="w-full"
            >
              {t("search")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results info */}
      <div>
        <p className="text-sm text-gray-500">
          {t("showing_results", { count: orders.length, total: totalCount })}
        </p>
      </div>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("no_orders_found")}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery || statusFilter !== "all" || vendorFilter !== "all" || dateRange.from
                ? t("no_orders_with_filters")
                : t("no_orders_yet")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("order_id")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("customer")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("date")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("total")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("payment")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t("items", { count: order.items?.length || 0 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="min-w-32 text-sm"
                        aria-label={t("order_status")}
                      >
                        <option value="pending">{t("pending")}</option>
                        <option value="processing">{t("processing")}</option>
                        <option value="completed">{t("completed")}</option>
                        <option value="cancelled">{t("cancelled")}</option>
                        <option value="refunded">{t("refunded")}</option>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          order.paymentStatus === "paid"
                            ? "success"
                            : order.paymentStatus === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {t(order.paymentStatus)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("view")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="py-4 border-t border-gray-200 px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onStatusChange={(status) => handleStatusUpdate(selectedOrder.id, status)}
        />
      )}
    </div>
  );
};
