import React from "react";
import PropTypes from "prop-types";

export const Input = React.forwardRef(
  (
    {
      label,
      id,
      name,
      type = "text",
      placeholder = "",
      error = "",
      disabled = false,
      required = false,
      readOnly = false,
      helperText,
      className = "",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    // Generate an ID if one isn't provided
    const inputId = id || name || React.useId();

    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`
              w-full rounded-md shadow-sm border-gray-300
              ${
                error
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }
              ${LeftIcon ? "pl-10" : ""}
              ${RightIcon ? "pr-10" : ""}
              ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
              ${readOnly ? "bg-gray-50" : ""}
            `}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <RightIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>

        {/* Error message or helper text */}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  helperText: PropTypes.string,
  className: PropTypes.string,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};