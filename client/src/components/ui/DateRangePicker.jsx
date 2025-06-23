import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  placeholder = "Select date range",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate || '');
  const [tempEndDate, setTempEndDate] = useState(endDate || '');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update temp dates when props change
  useEffect(() => {
    setTempStartDate(startDate || '');
    setTempEndDate(endDate || '');
  }, [startDate, endDate]);

  const handleApply = () => {
    onDateChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onDateChange('', '');
    setIsOpen(false);
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDisplayText = () => {
    if (!startDate && !endDate) {
      return placeholder;
    }
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) {
      return `From ${formatDisplayDate(startDate)}`;
    }
    if (endDate) {
      return `Until ${formatDisplayDate(endDate)}`;
    }
    return placeholder;
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`
          w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          flex items-center justify-between
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          <span className={`${startDate || endDate ? 'text-gray-900' : 'text-gray-500'}`}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {(startDate || endDate) && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg w-full min-w-[300px]">
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  max={tempEndDate || today}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={tempEndDate}
                  min={tempStartDate}
                  max={today}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">Quick Select</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() - 7);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today);
                  }}
                  className="text-xs"
                >
                  Last 7 days
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() - 30);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today);
                  }}
                  className="text-xs"
                >
                  Last 30 days
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() - 90);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today);
                  }}
                  className="text-xs"
                >
                  Last 90 days
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const start = new Date();
                    start.setMonth(start.getMonth() - 12);
                    setTempStartDate(start.toISOString().split('T')[0]);
                    setTempEndDate(today);
                  }}
                  className="text-xs"
                >
                  Last year
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};