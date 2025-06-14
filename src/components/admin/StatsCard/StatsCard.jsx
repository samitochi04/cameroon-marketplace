import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({ title, value, icon: Icon, change, iconBg, iconColor }) => {
  const isPositiveChange = change >= 0;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-md ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        
        {change !== undefined && (
          <span 
            className={`flex items-center text-xs font-medium ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositiveChange ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      
      <h3 className="mt-4 text-2xl font-semibold text-gray-900">{value}</h3>
      <p className="mt-1 text-sm text-gray-500">{title}</p>
    </div>
  );
};
