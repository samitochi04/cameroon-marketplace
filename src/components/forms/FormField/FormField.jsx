import React from "react";
import PropTypes from "prop-types";

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  error = "",
  register,
  required = false,
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm text-sm md:text-base
          focus:ring-primary focus:border-primary
          ${error ? "border-red-500" : "border-gray-300"}
        `}
        {...(register ? register(name, { required }) : {})}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  register: PropTypes.func,
  required: PropTypes.bool,
  className: PropTypes.string,
};