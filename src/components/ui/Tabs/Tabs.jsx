import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create a context to share tab state
const TabsContext = createContext();

export const Tabs = ({ children, defaultIndex = 0, onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  const handleTabChange = (index) => {
    setSelectedIndex(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <TabsContext.Provider value={{ selectedIndex, handleTabChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultIndex: PropTypes.number,
  onChange: PropTypes.func,
};

export const TabList = ({ children }) => {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, { index });
      })}
    </div>
  );
};

TabList.propTypes = {
  children: PropTypes.node.isRequired,
};

export const Tab = ({ children, index, disabled = false }) => {
  const { selectedIndex, handleTabChange } = useContext(TabsContext);
  const isActive = selectedIndex === index;

  return (
    <button
      className={`py-2 px-4 font-medium text-sm focus:outline-none ${
        isActive
          ? 'text-primary border-b-2 border-primary'
          : 'text-gray-500 hover:text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && handleTabChange(index)}
      disabled={disabled}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </button>
  );
};

Tab.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number,
  disabled: PropTypes.bool,
};

export const TabPanel = ({ children, index }) => {
  const { selectedIndex } = useContext(TabsContext);
  const isSelected = selectedIndex === index;

  if (!isSelected) return null;

  return (
    <div role="tabpanel" tabIndex={0} className="py-4">
      {children}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number,
};
