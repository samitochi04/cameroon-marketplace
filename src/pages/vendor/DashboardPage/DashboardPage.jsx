import React, { useState, useEffect } from "react";
import { BarChart, LineChart, Calendar, Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useVendor } from "@/hooks/useVendor";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { SalesChart } from "@/components/vendor/charts/SalesChart";
import { RecentOrdersTable } from "@/components/vendor/tables/RecentOrdersTable";
import { TopProductsTable } from "@/components/vendor/tables/TopProductsTable";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  
  const { 
    vendorProfile, 
    vendorStats,
    loading,
    getVendorSalesOverTime,
    getVendorTopProducts,
    getVendorOrders
  } = useVendor();
  
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch sales data
        const salesData = await getVendorSalesOverTime(timeRange);
        setSalesData(salesData);
        
        // Fetch top products
        const products = await getVendorTopProducts(5);
        setTopProducts(products);
        
        // Fetch recent orders
        const orders = await getVendorOrders({ limit: 5, sort: "created_at:desc" });
        setRecentOrders(orders);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, [timeRange, getVendorSalesOverTime, getVendorTopProducts, getVendorOrders]);
  
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };
  
  // Calculate totals from stats
  const totalSales = vendorStats?.totalRevenue || 0;
  const totalOrders = vendorStats?.totalOrders || 0;
  const totalProducts = vendorStats?.productCount || 0;
  const itemsSold = vendorStats?.totalItemsSold || 0;
  
  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("vendor_dashboard_welcome")}</h1>
          <p className="text-gray-500">{t("vendor_dashboard_subtitle")}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button as="a" href="/vendor/products/new" variant="primary">
            {t("add_new_product")}
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-primary/10 text-primary mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("total_sales")}</p>
              <h3 className="text-2xl font-bold">${totalSales.toFixed(2)}</h3>
              <span className="text-xs text-green-500">+2.5% {t("from_last_period")}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-yellow-100 text-yellow-600 mr-4">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("total_orders")}</p>
              <h3 className="text-2xl font-bold">{totalOrders}</h3>
              <span className="text-xs text-green-500">+4.3% {t("from_last_period")}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-blue-100 text-blue-600 mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("products")}</p>
              <h3 className="text-2xl font-bold">{totalProducts}</h3>
              <span className="text-xs text-gray-500">{vendorStats?.publishedProductCount || 0} {t("active")}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-md bg-green-100 text-green-600 mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("items_sold")}</p>
              <h3 className="text-2xl font-bold">{itemsSold}</h3>
              <span className="text-xs text-green-500">+1.8% {t("from_last_period")}</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Sales chart */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-medium">{t("sales_overview")}</h2>
          <div className="mt-2 md:mt-0">
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              options={[
                { value: '7d', label: t('last_7_days') },
                { value: '30d', label: t('last_30_days') },
                { value: '90d', label: t('last_90_days') },
                { value: '1y', label: t('last_year') },
              ]}
              className="w-full md:w-36"
            />
          </div>
        </div>
        
        <div className="h-80">
          <SalesChart data={salesData} />
        </div>
      </Card>
      
      {/* Bottom section - Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{t("recent_orders")}</h2>
            <Button as="a" href="/vendor/orders" variant="link" size="sm">
              {t("view_all")}
            </Button>
          </div>
          
          <RecentOrdersTable orders={recentOrders} loading={loading} />
        </Card>
        
        {/* Top Products */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">{t("top_selling_products")}</h2>
            <Button as="a" href="/vendor/products" variant="link" size="sm">
              {t("view_all")}
            </Button>
          </div>
          
          <TopProductsTable products={topProducts} loading={loading} />
        </Card>
      </div>
    </div>
  );
};
