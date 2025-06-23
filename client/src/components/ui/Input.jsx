import React from 'react';
import PropTypes from 'prop-types';

export const Input = React.forwardRef(({
  type = 'text',
  placeholder,
  error,
  leftAddon,
  rightAddon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative">
      {/* Left Addon */}
      {leftAddon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{leftAddon}</span>
        </div>
      )}
      
      {/* Input Element - note we don't pass leftAddon to it */}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`block w-full rounded-md border-gray-300 shadow-sm
          ${leftAddon ? 'pl-16' : 'pl-3'}
          ${rightAddon ? 'pr-16' : 'pr-3'}
          py-2 
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'}
          ${className}`}
        {...props}
      />
      
      {/* Right Addon */}
      {rightAddon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{rightAddon}</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  leftAddon: PropTypes.node,
  rightAddon: PropTypes.node,
  className: PropTypes.string
};
