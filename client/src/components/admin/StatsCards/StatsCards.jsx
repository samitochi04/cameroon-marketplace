import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Store, 
  Package, 
  TrendingUp 
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { StatsCard } from '../StatsCard/StatsCard';

export const StatsCards = () => {
  const { t } = useTranslation();
  const { getPlatformStats, loading } = useAdmin();
  const [stats, setStats] = React.useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalVendors: 0,
    activeProducts: 0,
    totalSales: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    vendorsChange: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch platform statistics:", error);
      }
    };

    fetchStats();
  }, [getPlatformStats]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Define cards configuration
  const statCards = [
    {
      title: t('total_revenue'),
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: stats.revenueChange,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: t('total_orders'),
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: stats.ordersChange,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: t('users'),
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: stats.usersChange,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: t('vendors'),
      value: stats.totalVendors.toLocaleString(),
      icon: Store,
      change: stats.vendorsChange,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: t('active_products'),
      value: stats.activeProducts.toLocaleString(),
      icon: Package,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: t('total_sales'),
      value: stats.totalSales.toLocaleString(),
      icon: TrendingUp,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          change={card.change}
          iconBg={card.iconBg}
          iconColor={card.iconColor}
        />
      ))}
    </div>
  );
};
