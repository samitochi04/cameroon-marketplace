import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import PropTypes from "prop-types";

export const Toast = ({ 
  id,
  title, 
  message, 
  type = "info", 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onClose(id);
        }, 300); // Wait for animation to complete before removal
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, id]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };
  
  // Determine icon and color based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-700",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        };
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-700",
          icon: <AlertCircle className="h-5 w-5 text-red-500" />
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-700",
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-700",
          icon: <Info className="h-5 w-5 text-blue-500" />
        };
    }
  };
  
  const { bgColor, borderColor, textColor, icon } = getTypeStyles();
  
  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div
        className={`${bgColor} ${borderColor} ${textColor} p-4 rounded-lg border shadow-md flex items-start`}
      >
        <div className="flex-shrink-0 mr-3">
          {icon}
        </div>
        <div className="flex-grow">
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          {message && <p className="text-sm">{message}</p>}
        </div>
        <button
          className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          onClick={handleClose}
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  type: PropTypes.oneOf(["info", "success", "error", "warning"]),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired
};
