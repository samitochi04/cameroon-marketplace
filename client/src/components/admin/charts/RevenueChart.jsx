import React from 'react';
import { BarChart3 } from 'lucide-react';

export const RevenueChart = ({ data = [] }) => {
  // Placeholder for revenue chart - in production you'd use a charting library like Chart.js or Recharts
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Revenue Chart</p>
        <p className="text-sm text-gray-400">{data.length} data points</p>
      </div>
    </div>
  );
};