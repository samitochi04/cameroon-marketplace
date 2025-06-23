import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, AlertCircle } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/common/Pagination";
import { OrdersTable } from "@/components/vendor/tables/OrdersTable";
import { OrderDetailsModal } from "@/components/vendor/OrderDetailsModal";

export const OrdersPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Get vendor orders
  const { 
    getVendorOrders, 
    updateOrderStatus,
    loading 
  } = useVendor();
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load orders
  const loadOrders = async () => {
    setIsLoading(true);
    
    try {
      const filters = {
        page: currentPage,
        pageSize: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        timeRange: timeRange !== "all" ? timeRange : undefined,
        search: searchQuery || undefined,
      };
      
      const { orders, pagination } = await getVendorOrders(filters);
      
      setOrders(orders);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, timeRange]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };
  
  // Handle order status change
  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      // Refresh order list
      loadOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // View order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("vendor_orders")}</h1>
        <p className="text-gray-500">{t("manage_your_orders")}</p>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder={t("search_orders")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </form>
          
          {/* Status filter */}
          <div className="w-full md:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: t("all_statuses") },
                { value: "pending", label: t("pending") },
                { value: "processing", label: t("processing") },
                { value: "shipped", label: t("shipped") },
                { value: "delivered", label: t("delivered") },
                { value: "cancelled", label: t("cancelled") },
              ]}
              placeholder={t("filter_by_status")}
            />
          </div>
          
          {/* Time range filter */}
          <div className="w-full md:w-48">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={[
                { value: "all", label: t("all_time") },
                { value: "today", label: t("today") },
                { value: "this_week", label: t("this_week") },
                { value: "this_month", label: t("this_month") },
                { value: "last_month", label: t("last_month") },
              ]}
              placeholder={t("filter_by_time")}
            />
          </div>
        </div>
      </Card>
      
      {/* Orders table */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("no_orders_found")}
            </h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {searchQuery || statusFilter !== "all" || timeRange !== "all"
                ? t("no_orders_with_filters")
                : t("no_orders_yet")}
            </p>
          </div>
        ) : (
          <>
            <OrdersTable
              orders={orders}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
            />
            
            {totalPages > 1 && (
              <div className="flex justify-center p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          order={selectedOrder}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
