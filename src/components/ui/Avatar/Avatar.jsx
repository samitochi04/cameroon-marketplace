import React from "react";
import PropTypes from "prop-types";

export const Avatar = ({
  src,
  alt,
  size = "md",
  fallback,
  shape = "circle",
  className = "",
  ...props
}) => {
  const [error, setError] = React.useState(false);

  const sizeStyles = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
  };

  const shapeStyles = {
    circle: "rounded-full",
    square: "rounded-md",
  };

  const getFallbackInitials = () => {
    if (!fallback) return "";

    // For simple strings, just use the first letter
    if (typeof fallback === "string") {
      return fallback.charAt(0).toUpperCase();
    }

    // If fallback is the alt text, generate initials
    if (alt && typeof alt === "string") {
      return alt
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("");
    }

    return "";
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center bg-gray-200 
        ${sizeStyles[size] || sizeStyles.md}
        ${shapeStyles[shape] || shapeStyles.circle}
        ${className}
      `}
      {...props}
    >
      {!error && src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          onError={handleError}
          className={`object-cover w-full h-full ${
            shapeStyles[shape] || shapeStyles.circle
          }`}
        />
      ) : (
        <span className="font-medium text-gray-600">
          {getFallbackInitials()}
        </span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  fallback: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  shape: PropTypes.oneOf(["circle", "square"]),
  className: PropTypes.string,
};