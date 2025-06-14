# React Component Architecture

This document outlines the component architecture for our multi-vendor e-commerce platform. Following these guidelines will ensure consistency, reusability, and maintainability across the application.

## Table of Contents

- [Component Hierarchy](#component-hierarchy)
- [Component Types](#component-types)
- [Folder Structure](#folder-structure)
- [Component Development Patterns](#component-development-patterns)
- [PropTypes Integration](#proptypes-integration)
- [Implementation Examples](#implementation-examples)

## Component Hierarchy

We'll adopt a modified atomic design methodology to organize our components:

1. **Atoms**: The smallest building blocks (buttons, inputs, icons)
2. **Molecules**: Simple groups of UI elements functioning together (form fields, search bars)
3. **Organisms**: Complex UI components (navigation bars, product cards)
4. **Templates**: Page layouts without specific content
5. **Pages**: Complete views with implemented components and data

This approach helps us establish a clear mental model of our component hierarchy and promotes reusability.

## Component Types

We will organize our components into the following types:

### 1. UI Components (`src/components/ui/`)

Basic UI elements that are highly reusable and don't contain business logic:

- Buttons
- Inputs
- Cards
- Modal dialogs
- Badges
- Alerts
- Loaders
- Typography elements

### 2. Layout Components (`src/components/layout/`)

Components that handle page structure:

- Page layouts
- Grid systems
- Container components
- Headers
- Footers
- Sidebars

### 3. Form Components (`src/components/forms/`)

Specialized components for form handling:

- Form fields
- Validation displays
- Input groups
- Select dropdowns
- Checkboxes
- Radio buttons

### 4. Feature Components (by domain)

Components specific to certain features or business domains:

- `src/components/products/`: Product-related components
- `src/components/vendors/`: Vendor-specific components
- `src/components/admin/`: Admin dashboard components
- `src/components/customer/`: Customer-facing components
- `src/components/cart/`: Shopping cart components
- `src/components/checkout/`: Checkout process components

### 5. Common Components (`src/components/common/`)

Components that are used across multiple features but contain some business logic:

- Navigation
- Search components
- User avatars
- Rating displays
- Review components

## Folder Structure

```
src/
├── components/
│   ├── ui/                     # Basic UI elements
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.test.js
│   │   │   └── index.js
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── PageLayout/
│   │   ├── MainLayout/
│   │   └── ...
│   ├── forms/                  # Form-related components
│   ├── common/                 # Shared components with business logic
│   ├── products/               # Product-specific components
│   ├── vendors/                # Vendor-specific components
│   ├── admin/                  # Admin dashboard components
│   ├── customer/               # Customer-facing components
│   ├── cart/                   # Cart-related components
│   └── checkout/               # Checkout-related components
├── pages/                      # Page components
│   ├── HomePage/
│   ├── ProductPage/
│   ├── VendorPage/
│   └── ...
├── layouts/                    # Page layouts
│   ├── MainLayout.jsx
│   ├── AdminLayout.jsx
│   └── VendorLayout.jsx
└── ...
```

## Component Development Patterns

### Component Structure

Each component should follow a similar structure:

1. Import statements
2. PropTypes definitions
3. Component function
4. Export statement

Example:

```jsx
import React from "react";
import PropTypes from "prop-types";
import "./Button.css";

export const Button = ({
  variant = "primary",
  size = "md",
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={`button button-${variant} button-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  variant: "primary",
  size: "md",
  disabled: false,
};
```

### Component Organization

For each component, create a folder with:

- Main component file (ComponentName.jsx)
- Index file for clean exports (index.js)
- Test file (ComponentName.test.js)
- Optional styles file if not using Tailwind directly (ComponentName.css)

Example:

```
Button/
├── Button.jsx      # Main component
├── Button.test.js  # Tests
└── index.js        # Export file
```

The index.js file should look like:

```javascript
export * from "./Button";
```

This allows for clean imports like:

```javascript
import { Button } from "@/components/ui/Button";
```

## PropTypes Integration

We'll leverage PropTypes for all components to improve maintainability:

### Prop Validation

Always define PropTypes for components:

```javascript
Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "outline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};
```

### Default Props

Set default prop values when needed:

```javascript
Button.defaultProps = {
  variant: "primary",
  size: "md",
  disabled: false,
};
```

### Children Props

For components that wrap other components:

```javascript
Card.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
```

## Implementation Examples

### UI Component Example: Button

```jsx
// filepath: src/components/ui/Button/Button.jsx
import React from "react";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          {
            "bg-primary text-white hover:bg-primary/90": variant === "primary",
            "bg-secondary text-white hover:bg-secondary/90":
              variant === "secondary",
            "border border-gray-300 hover:bg-gray-100": variant === "outline",
            "hover:bg-gray-100": variant === "ghost",
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4": size === "md",
            "h-12 px-6": size === "lg",
            "opacity-50 pointer-events-none": isLoading,
          },
          className
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isLoading: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
};

Button.defaultProps = {
  variant: "primary",
  size: "md",
  isLoading: false,
  disabled: false,
};
```

### Layout Component Example

```jsx
// filepath: src/components/layout/MainLayout/MainLayout.jsx
import React from "react";
import PropTypes from "prop-types";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Sidebar } from "@/components/common/Sidebar";

export const MainLayout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {showSidebar && <Sidebar className="w-64" />}
        <main className="flex-1 p-4">{children}</main>
      </div>
      <Footer />
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool,
};

MainLayout.defaultProps = {
  showSidebar: false,
};
```

### Feature Component Example: ProductCard

```jsx
// filepath: src/components/products/ProductCard/ProductCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RatingStar } from "@/components/ui/RatingStar";
import { formatCurrency } from "@/utils/formatCurrency";

export const ProductCard = ({
  id,
  title,
  description,
  price,
  discountPrice,
  imageUrl,
  rating,
  vendorName,
  onAddToCart,
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-w-3 aspect-h-2">
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">by {vendorName}</p>
        <div className="flex items-center mb-2">
          <RatingStar value={rating} />
          <span className="ml-1 text-sm text-gray-500">({rating})</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <div>
            {discountPrice ? (
              <div className="flex items-center">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(discountPrice)}
                </span>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatCurrency(price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(price)}
              </span>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={() => onAddToCart(id)}>
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};

ProductCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discountPrice: PropTypes.number,
  imageUrl: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  vendorName: PropTypes.string.isRequired,
  onAddToCart: PropTypes.func.isRequired,
};
```

### Page Component Example

```jsx
// filepath: src/pages/ProductListPage/ProductListPage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FilterSidebar } from "@/components/products/FilterSidebar";
import { ProductSorter } from "@/components/products/ProductSorter";
import { useProducts } from "@/hooks/useProducts";

export const ProductListPage = () => {
  const { categoryId } = useParams();
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("popularity");

  const { products, isLoading, error } = useProducts({
    categoryId,
    filters,
    sortBy,
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <ProductSorter value={sortBy} onChange={handleSortChange} />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <FilterSidebar
            className="w-full md:w-64"
            filters={filters}
            onChange={handleFilterChange}
          />

          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                Loading products...
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded text-red-700">
                Error loading products: {error.message}
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
```

## Best Practices

1. **Keep components focused**: Each component should do one thing well.
2. **Composition over inheritance**: Build complex components by composing smaller ones.
3. **Avoid prop drilling**: Use context or state management for deeply nested data.
4. **Consistent naming**: Use PascalCase for components and camelCase for variables/functions.
5. **Separate concerns**: Keep UI rendering separate from data fetching and business logic.
6. **Add comprehensive prop validation**: Document all props with PropTypes.
7. **Performance optimization**: Use memoization (React.memo, useMemo, useCallback) when appropriate.
8. **Accessibility first**: Ensure components are keyboard-navigable and screen-reader friendly.
