import React from "react";
import PropTypes from "prop-types";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react";

export const Alert = ({
  children,
  title,
  variant = "info",
  onClose,
  className = "",
  ...props
}) => {
  const variantStyles = {
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    },
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
  };

  const variantStyle = variantStyles[variant] || variantStyles.info;

  return (
    <div
      className={`border rounded-md p-4 ${variantStyle.container} ${className}`}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">{variantStyle.icon}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          <div className={`text-sm ${title ? "mt-2" : ""}`}>{children}</div>
        </div>
        {onClose && (
          <div className="pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  variant: PropTypes.oneOf(["info", "success", "warning", "error"]),
  onClose: PropTypes.func,
  className: PropTypes.string,
};