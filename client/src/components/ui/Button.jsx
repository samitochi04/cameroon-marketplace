import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary",
        secondary: "bg-secondary text-white hover:bg-secondary-dark focus-visible:ring-secondary",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        light: "bg-white text-gray-900 hover:bg-gray-100",
        danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const Button = forwardRef(
  ({ className, variant, size, leftIcon, rightIcon, as, children, ...props }, ref) => {
    const Comp = as || "button";
    
    // Render icon components properly
    const renderLeftIcon = () => {
      if (!leftIcon) return null;
      
      // If leftIcon is already a JSX element, return it directly
      if (React.isValidElement(leftIcon)) {
        return <span className="mr-2">{leftIcon}</span>;
      }
      
      // If leftIcon is a component (function/class), render it
      const IconComponent = leftIcon;
      return <IconComponent className="mr-2 h-5 w-5" />;
    };
    
    const renderRightIcon = () => {
      if (!rightIcon) return null;
      
      // If rightIcon is already a JSX element, return it directly
      if (React.isValidElement(rightIcon)) {
        return <span className="ml-2">{rightIcon}</span>;
      }
      
      // If rightIcon is a component (function/class), render it
      const IconComponent = rightIcon;
      return <IconComponent className="ml-2 h-5 w-5" />;
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {renderLeftIcon()}
        {children}
        {renderRightIcon()}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
