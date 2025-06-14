import React from "react";
import PropTypes from "prop-types";
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";

export const StatsCards = ({ stats, loading }) => {
  const { t } = useTranslation();

  // Format currency (XAF)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Default stats structure
  const defaultStats = {
    totalRevenue: 0,
    totalOrders: 0,
    productCount: 0,
    totalItemsSold: 0,
    revenueChange: 0,
    orderChange: 0,
    productChange: 0,
    itemsSoldChange: 0
  };

  // Merge provided stats with defaults
  const displayStats = { ...defaultStats, ...stats };

  // Define the card configs
  const statCards = [
    {
      title: t("total_revenue"),
      value: formatCurrency(displayStats.totalRevenue),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: displayStats.revenueChange,
      changeText: displayStats.revenueChange > 0 
        ? t("up_from_previous_period") 
        : t("down_from_previous_period"),
    },
    {
      title: t("total_orders"),
      value: displayStats.totalOrders.toString(),
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: displayStats.orderChange,
      changeText: displayStats.orderChange > 0 
        ? t("up_from_previous_period") 
        : t("down_from_previous_period"),
    },
    {
      title: t("products"),
      value: displayStats.productCount.toString(),
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: displayStats.productChange,
      changeText: displayStats.productChange > 0 
        ? t("up_from_previous_period") 
        : t("down_from_previous_period"),
    },
    {
      title: t("items_sold"),
      value: displayStats.totalItemsSold.toString(),
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      change: displayStats.itemsSoldChange,
      changeText: displayStats.itemsSoldChange > 0 
        ? t("up_from_previous_period") 
        : t("down_from_previous_period"),
    },
  ];

  // Skeleton loader for loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex">
              <Skeleton className="w-12 h-12 rounded-lg mr-4" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start">
            <div className={`p-2 rounded-md ${card.iconBg} ${card.iconColor} mr-4`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-xl font-bold mb-1">{card.value}</h3>
              <div className="flex items-center text-xs">
                {card.change > 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span
                  className={`${
                    card.change > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {Math.abs(card.change)}%
                </span>
                <span className="text-gray-500 ml-1">{card.changeText}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

StatsCards.propTypes = {
  stats: PropTypes.shape({
    totalRevenue: PropTypes.number,
    totalOrders: PropTypes.number,
    productCount: PropTypes.number,
    totalItemsSold: PropTypes.number,
    revenueChange: PropTypes.number,
    orderChange: PropTypes.number,
    productChange: PropTypes.number,
    itemsSoldChange: PropTypes.number
  }),
  loading: PropTypes.bool
};

StatsCards.defaultProps = {
  loading: false
};
