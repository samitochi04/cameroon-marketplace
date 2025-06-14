import React from "react";
import PropTypes from "prop-types";

export const Card = ({
  children,
  className = "",
  title,
  subtitle,
  footer,
  noPadding = false,
  bordered = true,
  hoverable = false,
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm 
        ${bordered ? "border border-gray-200" : ""}
        ${hoverable ? "transition-shadow hover:shadow-md" : ""}
        overflow-hidden
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      <div className={noPadding ? "" : "p-6"}>{children}</div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  footer: PropTypes.node,
  noPadding: PropTypes.bool,
  bordered: PropTypes.bool,
  hoverable: PropTypes.bool,
};