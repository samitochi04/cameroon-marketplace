import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { UserAcquisitionChart } from "@/components/admin/charts/UserAcquisitionChart";
import { RecentOrdersTable } from "@/components/admin/tables/RecentOrdersTable";
import { TopVendorsTable } from "@/components/admin/tables/TopVendorsTable";
import { StatsCard } from "@/components/admin/StatsCard";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Users, Store, ShoppingBag, DollarSign } from "lucide-react";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const { 
    getPlatformStats, 
    getSalesData, 
    getRecentOrders, 
    getTopVendors, 
    getUserGrowthData,
    loading 
  } = useAdmin();
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalVendors: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    vendorsChange: 0
  });
  
  const [salesData, setSalesData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get platform stats
        const platformStats = await getPlatformStats();
        setStats(platformStats);
        
        // Get sales data for the selected time range
        const salesData = await getSalesData(timeRange);
        setSalesData(salesData);
        
        // Get user acquisition data
        const userData = await getUserGrowthData(timeRange);
        setUserGrowthData(userData);
        
        // Get recent orders
        const orders = await getRecentOrders(10);
        setRecentOrders(orders);
        
        // Get top performing vendors
        const vendors = await getTopVendors(5);
        setTopVendors(vendors);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, [timeRange, getPlatformStats, getSalesData, getUserGrowthData, getRecentOrders, getTopVendors]);
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("admin.admin_dashboard")}</h1>
        <div className="flex space-x-3">
          <Button as={Link} to="/admin/reports" variant="outline">
            {t("admin.view_reports")}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t("admin.total_revenue")}
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          change={stats.revenueChange}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        
        <StatsCard
          title={t("admin.total_orders")}
          value={stats.totalOrders.toString()}
          icon={ShoppingBag}
          change={stats.ordersChange}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        
        <StatsCard
          title={t("admin.users")}
          value={stats.totalUsers.toString()}
          icon={Users}
          change={stats.usersChange}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        
        <StatsCard
          title={t("admin.vendors")}
          value={stats.totalVendors.toString()}
          icon={Store}
          change={stats.vendorsChange}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>
      
      {/* Revenue Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">{t("admin.revenue_overview")}</h2>
          <Select 
            value={timeRange}
            onChange={handleTimeRangeChange}
            options={[
              { value: '7d', label: t('admin.last_7_days') },
              { value: '30d', label: t('admin.last_30_days') },
              { value: '90d', label: t('admin.last_90_days') },
              { value: '1y', label: t('admin.last_year') },
            ]}
            className="w-40"
          />
        </div>
        <div className="h-80">
          <RevenueChart data={salesData} />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-6">{t("admin.user_acquisition")}</h2>
          <div className="h-64">
            <UserAcquisitionChart data={userGrowthData} />
          </div>
        </Card>
        
        {/* Top Vendors */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">{t("admin.top_performing_vendors")}</h2>
            <Button 
              as={Link} 
              to="/admin/vendors" 
              variant="link" 
              size="sm"
            >
              {t("admin.view_all")}
            </Button>
          </div>
          <TopVendorsTable vendors={topVendors} loading={loading} />
        </Card>
      </div>
      
      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">{t("admin.recent_orders")}</h2>
          <Button 
            as={Link} 
            to="/admin/orders" 
            variant="link" 
            size="sm"
          >
            {t("admin.view_all")}
          </Button>
        </div>
        <RecentOrdersTable orders={recentOrders} loading={loading} />
      </Card>
    </div>
  );
};
