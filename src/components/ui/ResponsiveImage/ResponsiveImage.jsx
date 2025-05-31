import React from "react";
import PropTypes from "prop-types";

export const ResponsiveImage = ({
  src,
  alt,
  className = "",
  sizes = "100vw",
  lazy = true,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`max-w-full h-auto ${className}`}
      sizes={sizes}
      loading={lazy ? "lazy" : "eager"}
    />
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  sizes: PropTypes.string,
  lazy: PropTypes.bool,
};