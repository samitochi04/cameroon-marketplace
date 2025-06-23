import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Bell, Globe, User, ChevronDown, LogOut, Settings, HelpCircle, Layout } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const VendorHeader = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLangMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{t('vendor_dashboard')}</div>
        
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <Globe size={18} />
              <ChevronDown size={14} className="ml-1" />
            </button>
            
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'fr' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  Français
                </button>
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <Bell size={18} />
              {/* Notification indicator */}
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-medium">{t('notifications')}</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {/* Example notifications */}
                  <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium">{t('new_order')}</p>
                    <p className="text-xs text-gray-500">{t('new_order_received')}</p>
                    <p className="text-xs text-gray-400 mt-1">10 min ago</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium">{t('product_review')}</p>
                    <p className="text-xs text-gray-500">{t('new_review_received')}</p>
                    <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50">
                    <p className="text-sm font-medium">{t('payout_completed')}</p>
                    <p className="text-xs text-gray-500">{t('payout_completed_message')}</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-200 text-center">
                  <button className="text-xs text-primary hover:underline">
                    {t('view_all_notifications')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center text-gray-700"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full" 
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
              {user?.firstName && (
                <span className="ml-2 text-sm hidden md:block">{user.firstName}</span>
              )}
              <ChevronDown size={14} className="ml-1" />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.firstName || user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <Link 
                  to="/vendor-portal/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={16} className="inline mr-2" />
                  {t('my_profile')}
                </Link>
                
                <Link 
                  to="/vendor-portal/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings size={16} className="inline mr-2" />
                  {t('settings')}
                </Link>
                
                <Link 
                  to="/vendor-portal/store-preview"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Layout size={16} className="inline mr-2" />
                  {t('view_my_store')}
                </Link>
                
                <Link 
                  to="/help"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <HelpCircle size={16} className="inline mr-2" />
                  {t('help_and_support')}
                </Link>
                
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} className="inline mr-2" />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

VendorHeader.propTypes = {
  toggleSidebar: PropTypes.func,
};
