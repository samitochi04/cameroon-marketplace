import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

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
    // Generate an ID if one isn't provided - call useId unconditionally
    const fallbackId = React.useId();
    const inputId = id || name || fallbackId;

    const hasLeftIcon = !!LeftIcon;
    const hasRightIcon = !!RightIcon;

    // Remove leftIcon and rightIcon from props to prevent them being passed to DOM
    const { leftIcon, rightIcon, ...cleanProps } = props;

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
          {hasLeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {LeftIcon}
            </div>
          )}          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              hasLeftIcon && "pl-10",
              hasRightIcon && "pr-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            {...cleanProps}
          />

          {hasRightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {RightIcon}
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