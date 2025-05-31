import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, AlertCircle, UserPlus, X } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/common/Pagination";
import { UserModal } from "@/components/admin/modals/UserModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export const UsersPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  
  const { 
    getUsers, 
    updateUser, 
    disableUser, 
    enableUser,
    loading 
  } = useAdmin();
  
  // User state
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Load users with filters
  const loadUsers = async () => {
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        role: roleFilter !== "all" ? roleFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      };
      
      const { data, pagination } = await getUsers(filters);
      
      setUsers(data);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.totalCount);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter]);
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers();
  };
  
  // Handle user edit
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  // Handle user status change
  const handleStatusChange = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };
  
  // Confirm status change
  const confirmStatusChange = async () => {
    try {
      if (actionType === "disable") {
        await disableUser(selectedUser.id);
      } else if (actionType === "enable") {
        await enableUser(selectedUser.id);
      }
      
      // Refresh the list
      loadUsers();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error(`Failed to ${actionType} user:`, error);
    }
  };
  
  // Handle user update from modal
  const handleUserUpdate = async (userData) => {
    try {
      await updateUser(userData.id, userData);
      loadUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
    loadUsers();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("manage_users")}</h1>
          <p className="text-gray-500">{t("view_and_manage_platform_users")}</p>
        </div>
        
        <Button 
          variant="primary" 
          leftIcon={UserPlus}
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
        >
          {t("add_user")}
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder={t("search_users")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </form>
          
          {/* Role filter */}
          <div className="w-full md:w-40">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: "all", label: t("all_roles") },
                { value: "admin", label: t("admin") },
                { value: "vendor", label: t("vendor") },
                { value: "customer", label: t("customer") },
              ]}
            />
          </div>
          
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
                { value: "active", label: t("active") },
                { value: "disabled", label: t("disabled") },
              ]}
            />
          </div>
          
          {/* Clear filters */}
          {(roleFilter !== "all" || statusFilter !== "all" || searchQuery) && (
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
          {t("showing_results", { count: users.length, total: totalCount })}
        </p>
      </div>
      
      {/* Users Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {t("no_users_found")}
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                ? t("no_users_with_filters")
                : t("no_users_yet")}
            </p>
            
            {(roleFilter !== "all" || statusFilter !== "all" || searchQuery) && (
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
                    {t("user")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("email")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("status")}
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-500">
                              {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || t("unnamed_user")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "danger"
                            : user.role === "vendor"
                            ? "warning"
                            : "success"
                        }
                      >
                        {t(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.isActive ? "success" : "secondary"}
                      >
                        {user.isActive ? t("active") : t("disabled")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => handleEditUser(user)}>
                          {t("edit")}
                        </Button>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user, "disable")}
                          >
                            {t("disable")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user, "enable")}
                          >
                            {t("enable")}
                          </Button>
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
      
      {/* User Modal */}
      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSubmit={handleUserUpdate}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmStatusChange}
        title={
          actionType === "disable"
            ? t("disable_user_confirmation_title")
            : t("enable_user_confirmation_title")
        }
        message={
          actionType === "disable"
            ? t("disable_user_confirmation_message", {
                name: selectedUser?.name || selectedUser?.email || t("this_user")
              })
            : t("enable_user_confirmation_message", {
                name: selectedUser?.name || selectedUser?.email || t("this_user")
              })
        }
        confirmText={actionType === "disable" ? t("disable") : t("enable")}
        confirmVariant={actionType === "disable" ? "danger" : "success"}
      />
    </div>
  );
};
