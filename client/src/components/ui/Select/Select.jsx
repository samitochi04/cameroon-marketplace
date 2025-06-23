import React from "react";
import PropTypes from "prop-types";
import { ChevronDown } from "lucide-react";

export const Select = React.forwardRef(
  (
    {
      label,
      id,
      name,
      options = [],
      value,
      onChange,
      disabled = false,
      required = false,
      error = "",
      placeholder = "Select an option",
      className = "",
      ...props
    },
    ref
  ) => {
    const selectId = id || name || React.useId();

    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`
              appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
              ${
                error
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }
              ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
              pr-10
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};