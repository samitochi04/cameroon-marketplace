import React from 'react';
import PropTypes from 'prop-types';

export const Switch = ({ 
  checked = false, 
  onChange,
  disabled = false,
  id,
  name,
  label,
  description,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3 translate-x-0.5',
      thumbChecked: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5 translate-x-0.5',
      thumbChecked: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6 translate-x-0.5',
      thumbChecked: 'translate-x-7',
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center ${className}`}>
      <label 
        htmlFor={id} 
        className={`inline-flex relative items-center cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`${sizes.switch} bg-gray-200 rounded-full peer ${
            checked ? 'bg-primary' : ''
          } ${disabled ? '' : 'peer-focus:ring-2 peer-focus:ring-primary-light'}`}
        >
          <div
            className={`${sizes.thumb} bg-white rounded-full shadow-md transform transition-transform ${
              checked ? sizes.thumbChecked : ''
            }`}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </div>
        )}
      </label>
    </div>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};
