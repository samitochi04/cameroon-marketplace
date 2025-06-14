import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

// Create context for tabs
const TabsContext = createContext({});

export const Tabs = ({ children, defaultValue, value, onChange, className = '' }) => {
  // If value is provided from parent (controlled component)
  // use that, otherwise manage state internally (uncontrolled)
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  
  const currentValue = value !== undefined ? value : selectedTab;
  
  const handleTabChange = (tabValue) => {
    if (onChange) {
      onChange(tabValue);
    } else {
      setSelectedTab(tabValue);
    }
  };
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleTabChange }}>
      <div className={`${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

export const TabList = ({ children, className = '' }) => {
  return (
    <div className={`flex border-b border-gray-200 mb-6 ${className}`}>
      {children}
    </div>
  );
};

TabList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const Tab = ({ children, value, className = '' }) => {
  const { value: selectedValue, onChange } = useContext(TabsContext);
  const isActive = selectedValue === value;
  
  return (
    <button
      type="button"
      className={`px-4 py-2 text-sm font-medium ${isActive 
        ? 'text-primary border-b-2 border-primary' 
        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'} ${className}`}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  );
};

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export const TabPanel = ({ children, value, className = '' }) => {
  const { value: selectedValue } = useContext(TabsContext);
  
  if (selectedValue !== value) {
    return null;
  }
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
};
