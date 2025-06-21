import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({ 
  title, 
  value, 
  icon: IconComponent, 
  change, 
  iconBg = 'bg-blue-100', 
  iconColor = 'text-blue-600' 
}) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {typeof change === 'number' && (
            <div className={`flex items-center mt-2 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              <span>
                {Math.abs(change).toFixed(1)}% from last period
              </span>
            </div>
          )}
        </div>        <div className={`p-3 rounded-lg ${iconBg}`}>
          {IconComponent && <IconComponent className={`w-6 h-6 ${iconColor}`} />}
        </div>
      </div>
    </div>
  );
};