import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  ClipboardList, 
  DollarSign, 
  Settings, 
  User,
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


export const VendorSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      path: '/vendor-portal/dashboard', 
      name: t('dashboard'), 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/vendor-portal/products', 
      name: t('products'), 
      icon: <ShoppingBag size={20} /> 
    },
    { 
      path: '/vendor-portal/orders', 
      name: t('orders'), 
      icon: <ClipboardList size={20} /> 
    },
    { 
      path: '/vendor-portal/earnings', 
      name: t('earnings'), 
      icon: <DollarSign size={20} /> 
    },
    { 
      path: '/vendor-portal/profile', 
      name: t('store_profile'), 
      icon: <User size={20} /> 
    },
    { 
      path: '/vendor-portal/settings', 
      name: t('settings'), 
      icon: <Settings size={20} /> 
    },
  ];

  return (
    <aside className={`bg-white h-screen border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo and collapse button */}
        <div className={`flex items-center p-4 border-b border-gray-200 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!collapsed && (
            <div className="font-semibold text-lg text-primary">
              {t('vendor_portal')}
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label={collapsed ? t('expand_sidebar') : t('collapse_sidebar')}
          >
            {collapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Storefront link */}
        <div className={`px-3 py-2 ${
          collapsed ? 'flex justify-center' : ''
        }`}>
          <NavLink
            to="/"
            className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Package size={20} />
            {!collapsed && <span className="ml-3">{t('visit_storefront')}</span>}
          </NavLink>
        </div>
        
        {/* Logout Button */}
        <div className={`p-4 border-t border-gray-200 ${
          collapsed ? 'flex justify-center' : ''
        }`}>
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 w-full rounded-md text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">{t('logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
