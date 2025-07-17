/**
 * User Profile Button Component
 * Displays user information with dropdown menu for profile actions
 * 
 * @file src/components/common/UserProfileButton.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';

/**
 * User Menu Dropdown Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether menu is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onLogout - Logout handler
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Object} props.admin - Admin user data
 */
const UserMenu = ({ isOpen, onClose, onLogout, darkMode, admin }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-48 z-50">
      <div className={`${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      } rounded-lg shadow-lg border py-1`}>
        {/* User Info Header */}
        <div className={`px-4 py-3 border-b ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {admin?.username || 'User'}
          </div>
          <div className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {admin?.role || 'Administrator'}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <button
            onClick={() => {
              onClose();
              // Add profile functionality here
            }}
            className={`w-full text-left px-4 py-2 text-sm ${
              darkMode 
                ? 'text-slate-300 hover:bg-slate-700 hover:text-white' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } transition-colors`}
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </div>
          </button>
          
          <button
            onClick={() => {
              onClose();
              // Add settings functionality here
            }}
            className={`w-full text-left px-4 py-2 text-sm ${
              darkMode 
                ? 'text-slate-300 hover:bg-slate-700 hover:text-white' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            } transition-colors`}
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </div>
          </button>

          <hr className={`my-1 ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`} />

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className={`w-full text-left px-4 py-2 text-sm ${
              darkMode 
                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            } transition-colors`}
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * User Profile Button Component
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {string} props.user.username - Username to display
 * @param {string} props.user.role - User role to display
 * @param {string} props.user.avatar - Optional avatar URL
 * @param {boolean} props.darkMode - Dark mode state
 * @param {Function} props.onLogout - Logout handler function
 * @param {string} props.className - Additional CSS classes
 */
const UserProfileButton = ({ 
  user = { username: 'User', role: 'Administrator' }, 
  darkMode = false, 
  onLogout, 
  className = '' 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  /**
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Get user initials for avatar
   * @param {string} username - Username
   * @returns {string} User initials
   */
  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback logout implementation
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-10 hover:bg-white transition-colors"
      >
        <div className="text-right">
          <div className={`text-sm font-medium ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user.username}
          </div>
          <div className={`text-xs ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {user.role}
          </div>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:shadow-lg transition-shadow">
          <span className="text-sm font-bold text-white">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              getUserInitials(user.username)
            )}
          </span>
        </div>
      </button>

      <UserMenu 
        isOpen={showUserMenu}
        onClose={() => setShowUserMenu(false)}
        onLogout={handleLogout}
        darkMode={darkMode}
        admin={user}
      />
    </div>
  );
};

export default UserProfileButton;