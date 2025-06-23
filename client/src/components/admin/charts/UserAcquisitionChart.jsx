import React from 'react';
import { TrendingUp } from 'lucide-react';

export const UserAcquisitionChart = ({ data = [] }) => {
  // Placeholder for user acquisition chart - in production you'd use a charting library
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">User Acquisition Chart</p>
        <p className="text-sm text-gray-400">{data.length} data points</p>
      </div>
    </div>
  );
};