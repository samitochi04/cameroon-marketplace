import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

export const Textarea = forwardRef(({
  id,
  name,
  label,
  value,
  defaultValue,
  placeholder,
  onChange,
  onBlur,
  rows = 3,
  disabled = false,
  error,
  className = '',
  required = false,
  ...rest
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        name={name}
        ref={ref}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`block w-full px-3 py-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${
          disabled ? 'bg-gray-50 text-gray-500' : ''
        }`}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
};
