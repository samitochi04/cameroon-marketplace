import React from 'react';
import PropTypes from 'prop-types';

export const InputWithAddons = ({ 
  leftAddon, 
  rightAddon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="relative">
      {leftAddon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{leftAddon}</span>
        </div>
      )}
      
      <input
        className={`block w-full rounded-md border-gray-300 shadow-sm
          ${leftAddon ? 'pl-16' : 'pl-3'}
          ${rightAddon ? 'pr-16' : 'pr-3'}
          py-2
          ${className}`}
        {...props}
      />
      
      {rightAddon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{rightAddon}</span>
        </div>
      )}
    </div>
  );
};

InputWithAddons.propTypes = {
  leftAddon: PropTypes.node,
  rightAddon: PropTypes.node,
  className: PropTypes.string
};
