# Shared UI Component Library and React Router Setup

This document outlines the implementation of a shared UI component library and React Router configuration for our multi-vendor e-commerce platform.

## Table of Contents

- [Shared UI Component Library](#shared-ui-component-library)
  - [Core UI Components](#core-ui-components)
  - [Using the UI Components](#using-the-ui-components)
  - [Custom Hooks for UI](#custom-hooks-for-ui)
- [React Router Setup](#react-router-setup)
  - [Router Configuration](#router-configuration)
  - [Route Types](#route-types)
  - [Layout Routes](#layout-routes)
  - [Navigation Guards](#navigation-guards)

## Shared UI Component Library

Our UI component library provides reusable, consistent UI elements across the application. These components follow our design system and provide a cohesive user experience.

### Core UI Components

Let's create the essential UI components that will be used throughout the application. Each component will be placed in the `src/components/ui` directory with its own folder structure as defined in our React component architecture document.

#### 1. Button Component

The Button component is one of the most used elements in our application.

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Button\Button.jsx
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
```

Create an index file to export the component:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Button\index.js
export * from "./Button";
```

#### 2. Input Component

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Input\Input.jsx
import React from "react";
import PropTypes from "prop-types";

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
    // Generate an ID if one isn't provided
    const inputId = id || name || React.useId();

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
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LeftIcon className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={`
              w-full rounded-md shadow-sm border-gray-300
              ${
                error
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-primary focus:ring-primary"
              }
              ${LeftIcon ? "pl-10" : ""}
              ${RightIcon ? "pr-10" : ""}
              ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
              ${readOnly ? "bg-gray-50" : ""}
            `}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <RightIcon className="h-5 w-5 text-gray-400" />
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
```

Create an index file for the Input component:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Input\index.js
export * from "./Input";
```

#### 3. Card Component

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Card\Card.jsx
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
```

Create an index file:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Card\index.js
export * from "./Card";
```

#### 4. Select Component

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Select\Select.jsx
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
```

Create an index file:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Select\index.js
export * from "./Select";
```

#### 5. Badge Component

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Badge\Badge.jsx
import React from "react";
import PropTypes from "prop-types";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary-dark",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant] || variantStyles.default}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "default",
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};
```

Create an index file:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Badge\index.js
export * from "./Badge";
```

#### 6. Avatar Component

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Avatar\Avatar.jsx
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
```

Create an index file:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Avatar\index.js
export * from "./Avatar";
```

#### 7. Alert Component

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Alert\Alert.jsx
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
```

Create an index file:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\Alert\index.js
export * from "./Alert";
```

### Using the UI Components

Now let's create a central index file to export all UI components for easy importing:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\components\ui\index.js
export * from "./Button";
export * from "./Input";
export * from "./Card";
export * from "./Select";
export * from "./Badge";
export * from "./Avatar";
export * from "./Alert";
// Add more component exports as you create them
```

This allows you to import multiple components from a single source:

```jsx
import { Button, Input, Card } from "@/components/ui";
```

### Custom Hooks for UI

Create reusable hooks for common UI patterns:

#### useDisclosure Hook

This hook manages open/close state for modals, drawers, and other disclosure components:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\hooks\useDisclosure.js
import { useState, useCallback } from "react";

export const useDisclosure = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, onOpen, onClose, onToggle };
};
```

#### useMediaQuery Hook

This hook helps with responsive designs:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\hooks\useMediaQuery.js
import { useState, useEffect } from "react";

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event) => {
      setMatches(event.matches);
    };

    // Add event listener for changes
    // Using a modern approach that works with all browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};
```

## React Router Setup

React Router enables navigation in our single-page application. We'll set up a robust routing system with support for layouts, protected routes, and navigation guards.

### Router Configuration

First, let's set up the basic router configuration:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\routes\index.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layouts
import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { VendorLayout } from "@/layouts/VendorLayout";
import { AuthLayout } from "@/layouts/AuthLayout";

// Public pages
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { VendorsPage } from "@/pages/VendorsPage";
import { VendorDetailPage } from "@/pages/VendorDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Customer pages
import { ProfilePage } from "@/pages/customer/ProfilePage";
import { OrdersPage } from "@/pages/customer/OrdersPage";
import { OrderDetailPage } from "@/pages/customer/OrderDetailPage";
import { WishlistPage } from "@/pages/customer/WishlistPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";

// Vendor pages
import { VendorDashboardPage } from "@/pages/vendor/DashboardPage";
import { VendorProductsPage } from "@/pages/vendor/ProductsPage";
import { VendorAddProductPage } from "@/pages/vendor/AddProductPage";
import { VendorOrdersPage } from "@/pages/vendor/OrdersPage";
import { VendorSettingsPage } from "@/pages/vendor/SettingsPage";

// Admin pages
import { AdminDashboardPage } from "@/pages/admin/DashboardPage";
import { AdminVendorsPage } from "@/pages/admin/VendorsPage";
import { AdminUsersPage } from "@/pages/admin/UsersPage";
import { AdminProductsPage } from "@/pages/admin/ProductsPage";
import { AdminOrdersPage } from "@/pages/admin/OrdersPage";
import { AdminSettingsPage } from "@/pages/admin/SettingsPage";

// Route guards
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { RoleBasedRoute } from "./RoleBasedRoute";

// Create router config
const router = createBrowserRouter([
  {
    // Public routes with main layout
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:slug", element: <ProductDetailPage /> },
      { path: "vendors", element: <VendorsPage /> },
      { path: "vendors/:id", element: <VendorDetailPage /> },
      { path: "cart", element: <CartPage /> },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    // Auth routes with auth layout
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: "register",
        element: (
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        ),
      },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    // Customer routes
    path: "/account",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "profile", element: <ProfilePage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "wishlist", element: <WishlistPage /> },
    ],
  },
  {
    // Vendor routes
    path: "/vendor",
    element: (
      <RoleBasedRoute roles={["vendor", "admin"]}>
        <VendorLayout />
      </RoleBasedRoute>
    ),
    children: [
      { index: true, element: <VendorDashboardPage /> },
      { path: "products", element: <VendorProductsPage /> },
      { path: "products/new", element: <VendorAddProductPage /> },
      { path: "products/edit/:id", element: <VendorAddProductPage /> },
      { path: "orders", element: <VendorOrdersPage /> },
      { path: "settings", element: <VendorSettingsPage /> },
    ],
  },
  {
    // Admin routes
    path: "/admin",
    element: (
      <RoleBasedRoute roles={["admin"]}>
        <AdminLayout />
      </RoleBasedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "vendors", element: <AdminVendorsPage /> },
      { path: "products", element: <AdminProductsPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ],
  },
  // 404 page
  { path: "*", element: <NotFoundPage /> },
]);

// Router provider component
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
```

### Route Types

Let's create different route types for handling access control:

#### Protected Route

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\routes\ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
```

#### Public Only Route

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\routes\PublicOnlyRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";

export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // Redirect to home or intended location if already authenticated
  if (isAuthenticated) {
    // If user was redirected to login from another page, send them back there
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // If not authenticated, render the login/register page
  return children;
};

PublicOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
```

#### Role-Based Route

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\routes\RoleBasedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";

export const RoleBasedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>; // Replace with a proper loading component
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  const hasRequiredRole = roles.includes(user?.role);

  if (!hasRequiredRole) {
    // Redirect to unauthorized page or dashboard based on user's role
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === "vendor") {
      return <Navigate to="/vendor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role, render the children
  return children;
};

RoleBasedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};
```

### Layout Routes

Create layout components that will serve as wrappers for different sections of the application:

#### Main Layout

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\layouts\MainLayout.jsx
import { Outlet } from "react-router-dom";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
```

#### Admin Layout

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\layouts\AdminLayout.jsx
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

#### Vendor Layout

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\layouts\VendorLayout.jsx
import { Outlet } from "react-router-dom";
import { VendorSidebar } from "@/components/vendors/VendorSidebar";
import { VendorHeader } from "@/components/vendors/VendorHeader";

export const VendorLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <VendorSidebar />

      <div className="flex-1">
        <VendorHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

#### Auth Layout

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\layouts\AuthLayout.jsx
import { Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo width={64} height={64} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          <Outlet context={{ title: true }} />
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet context={{ title: false }} />
        </div>
      </div>
    </div>
  );
};
```

### Navigation Guards

To handle global navigation events and guards, we can create a navigation listener:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\routes\NavigationListener.jsx
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/context/AuthContext";

export const NavigationListener = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { isAuthenticated, refreshUser } = useAuth();

  // Refresh user data on navigation
  useEffect(() => {
    if (isAuthenticated && navigationType === "PUSH") {
      refreshUser();
    }
  }, [location.pathname, navigationType, isAuthenticated, refreshUser]);

  // Track page views for analytics
  useEffect(() => {
    // Example: Google Analytics pageview tracking
    if (window.gtag) {
      window.gtag("config", "GA-TRACKING-ID", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return children;
};

NavigationListener.propTypes = {
  children: PropTypes.node.isRequired,
};
```

### Integrating React Router in App

Finally, let's update the main App component to use our router configuration:

```jsx
// filepath: c:\Users\temmo\Desktop\new_axis\cameroon-marketplace\src\App.jsx
import { AppRouter } from "./routes";
import { NavigationListener } from "./routes/NavigationListener";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/Toaster";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationListener>
          <AppRouter />
          <Toaster />
        </NavigationListener>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
```

## Conclusion

You have now set up a comprehensive UI component library and routing system for your multi-vendor e-commerce platform. The UI components provide a consistent look and feel across the application, while the routing system handles navigation, access control, and layouts.

Key achievements:

1. Created reusable UI components following best practices
2. Set up a centralized export system for easy importing
3. Added custom hooks for common UI patterns
4. Implemented React Router with a structured configuration
5. Created layout-based routes for different sections of the application
6. Added route protection with role-based access control
7. Implemented navigation guards and listeners

In the next steps, you can focus on implementing specific features such as authentication, product listings, and shopping cart functionality.
