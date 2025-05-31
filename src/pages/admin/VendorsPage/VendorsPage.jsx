import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, AlertCircle, X, Check, Star } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/common/Pagination";
import { VendorModal } from "@/components/admin/modals/VendorModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export const VendorsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  
  const { 
    getVendors, 
    approveVendor, 
    rejectVendor, 
    updateVendor,
    loading 
  } = useAdmin();
  
  // Vendor state
  const [vendors, setVendors] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Load vendors with filters
  const loadVendors = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      };
      
      const { data, pagination } = await getVendors(filters);
      
      setVendors(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
      setPendingCount(pagination.pendingCount);
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  };
  
  useEffect(() => {
    loadVendors();
  }, [currentPage, statusFilter]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadVendors();
  };
  
  // Handle vendor details view
  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };
  
  // Handle vendor approval/rejection
  const handleVendorAction = (vendor, action) => {
    setSelectedVendor(vendor);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };
  
  // Confirm action
  const confirmAction = async () => {
    try {
      if (actionType === "approve") {
        await approveVendor(selectedVendor.id);
      } else if (actionType === "reject") {
        await rejectVendor(selectedVendor.id);
      }
      
      // Refresh the list
      loadVendors();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error(`Failed to ${actionType} vendor:`, error);
    }
  };
  
  // Handle vendor update from modal
  const handleVendorUpdate = async (vendorData) => {
    try {
      await updateVendor(vendorData.id, vendorData);
      loadVendors();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update vendor:", error);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
    loadVendors();
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("manage_vendors")}</h1>
          <p className="text-gray-500">{t("view_and_manage_platform_vendors")}</p>
        </div>
        
        {pendingCount > 0 && (
          <Button 
            variant="warning" 
            onClick={() => setStatusFilter("pending")}
          >
            {t("pending_applications", { count: pendingCount })}
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder={t("search_vendors")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </form>
          
          {/* Status filter */}
          <div className="w-full md:w-40">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: t("all_statuses") },
                { value: "approved", label: t("approved") },
                { value: "pending", label: t("pending") },
                { value: "rejected", label: t("rejected") },
              ]}
            />
          </div>
          
          {/* Clear filters */}
          {(statusFilter !== "all" || searchQuery) && (
            <Button
              variant="outline"
              leftIcon={X}
              onClick={clearFilters}
              className="w-full md:w-auto"
            >
              {t("clear_filters")}
            </Button>
          )}
        </div>
      </Card>
      
      {/* Results info */}
      <div>
        <p className="text-sm text-gray-500">
          {t("showing_results", { count: vendors.length, total: totalCount })}
        </p>
      </div>
      
      {/* Vendors Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("no_vendors_found")}
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchQuery || statusFilter !== "all"
                ? t("no_vendors_with_filters")
                : t("no_vendors_yet")}
            </p>
            
            {(statusFilter !== "all" || searchQuery) && (
              <Button variant="outline" onClick={clearFilters}>
                {t("clear_filters")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("store")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("owner")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("commission")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("registered")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 flex items-center justify-center">
                          {vendor.logoUrl ? (
                            <img
                              src={vendor.logoUrl}
                              alt={vendor.storeName}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-500">
                              {vendor.storeName?.charAt(0) || "S"}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.storeName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            {vendor.rating && (
                              <>
                                <Star className="w-3 h-3 text-yellow-400 inline mr-1" />
                                <span>{vendor.rating}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.ownerName || "-"}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{vendor.productCount || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(vendor.status)}
                      >
                        {t(vendor.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vendor.commissionRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewVendor(vendor)}>
                          {t("view")}
                        </Button>
                        {vendor.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              leftIcon={Check}
                              onClick={() => handleVendorAction(vendor, "approve")}
                            >
                              {t("approve")}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={X}
                              onClick={() => handleVendorAction(vendor, "reject")}
                            >
                              {t("reject")}
                            </Button>
                          </>
                        )}
                      </div>
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
      
      {/* Vendor Detail Modal */}
      <VendorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={selectedVendor}
        onApprove={
          selectedVendor?.status === "pending"
            ? () => handleVendorAction(selectedVendor, "approve")
            : undefined
        }
        onReject={
          selectedVendor?.status === "pending"
            ? () => handleVendorAction(selectedVendor, "reject")
            : undefined
        }
        onSubmit={handleVendorUpdate}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmAction}
        title={
          actionType === "approve"
            ? t("approve_vendor_confirmation_title")
            : t("reject_vendor_confirmation_title")
        }
        message={
          actionType === "approve"
            ? t("approve_vendor_confirmation_message", {
                store: selectedVendor?.storeName || t("this_vendor")
              })
            : t("reject_vendor_confirmation_message", {
                store: selectedVendor?.storeName || t("this_vendor")
              })
        }
        confirmText={actionType === "approve" ? t("approve") : t("reject")}
        confirmVariant={actionType === "approve" ? "success" : "danger"}
      />
    </div>
  );
};
