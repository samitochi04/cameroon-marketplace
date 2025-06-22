import React from 'react';
import { cn } from '@/utils/cn';

export const Switch = React.forwardRef(({ 
  className, 
  checked, 
  onCheckedChange, 
  onChange,
  disabled,
  ...props 
}, ref) => {
  // Handle both onCheckedChange (for compatibility) and onChange
  const handleChange = (event) => {
    const newChecked = event.target.checked;
    if (onCheckedChange) {
      onCheckedChange(newChecked);
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <label className={cn(
      "relative inline-flex items-center cursor-pointer",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      <div className={cn(
        "relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700",
        checked ? "bg-blue-600" : "bg-gray-200",
        "transition-colors duration-200 ease-in-out"
      )}>
        <div className={cn(
          "absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )} />
      </div>
    </label>
  );
});

Switch.displayName = "Switch";
