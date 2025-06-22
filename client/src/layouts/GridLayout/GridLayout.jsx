import React from "react";
import PropTypes from "prop-types";

export const GridLayout = ({
  children,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  gap = 4,
  className = "",
}) => {
  const getGridCols = () => {
    let gridColsClasses = `grid-cols-${cols.default}`;

    if (cols.sm) gridColsClasses += ` sm:grid-cols-${cols.sm}`;
    if (cols.md) gridColsClasses += ` md:grid-cols-${cols.md}`;
    if (cols.lg) gridColsClasses += ` lg:grid-cols-${cols.lg}`;
    if (cols.xl) gridColsClasses += ` xl:grid-cols-${cols.xl}`;

    return gridColsClasses;
  };

  return (
    <div className={`grid ${getGridCols()} gap-${gap} ${className}`}>
      {children}
    </div>
  );
};

GridLayout.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.shape({
    default: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
  }),
  gap: PropTypes.number,
  className: PropTypes.string,
};