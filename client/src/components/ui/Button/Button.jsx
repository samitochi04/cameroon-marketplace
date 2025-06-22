import React from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = "",
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variant classes
    const variantClasses = {
      primary:
        "bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary",
      secondary:
        "bg-secondary text-gray-900 hover:bg-secondary/90 focus-visible:ring-secondary",
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-primary",
      ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    };

    // Size classes
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    // Combined classes
    const buttonClasses = `
      ${baseClasses}
      ${variantClasses[variant] || variantClasses.primary}
      ${sizeClasses[size] || sizeClasses.md}
      ${fullWidth ? "w-full" : ""}
      ${className}
    `;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {LeftIcon && !isLoading && <LeftIcon className="mr-2 -ml-1 h-4 w-4" />}
        {children}
        {RightIcon && !isLoading && (
          <RightIcon className="ml-2 -mr-1 h-4 w-4" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "danger",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  leftIcon: PropTypes.elementType,
  rightIcon: PropTypes.elementType,
  className: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
};