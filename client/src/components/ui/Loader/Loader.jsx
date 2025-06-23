import React from 'react';
import PropTypes from 'prop-types';

export const Loader = ({ 
  size = 'md', 
  className = '',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };
  
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
    gray: 'border-gray-300',
  };
  
  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedColor = colorClasses[color] || colorClasses.primary;

  return (
    <div className={`spinner ${className}`} aria-label="Loading">
      <div className={`animate-spin rounded-full ${selectedSize} border-t-transparent ${selectedColor}`}></div>
    </div>
  );
};

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray']),
};
