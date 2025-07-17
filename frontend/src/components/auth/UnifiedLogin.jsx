/**
 * Unified Login Component - Single login page for all user types
 * Handles API key verification and routes users based on their role
 * 
 * @file src/components/auth/UnifiedLogin.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Detect user's OS color scheme preference
 * @returns {boolean} True if user prefers dark mode
 */
const detectOSColorScheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

/**
 * Login Form Component
 * @param {Object} props - Component props
 * @param {string} props.apiKey - API key input value
 * @param {Function} props.onApiKeyChange - API key change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {boolean} props.isSubmitting - Whether form is submitting
 * @param {string} props.error - Error message to display
 * @param {boolean} props.darkMode - Dark mode state
 * @param {boolean} props.showPassword - Whether to show password
 * @param {Function} props.onTogglePassword - Password visibility toggle
 * @returns {JSX.Element} Login form component
 */
const LoginForm = ({ 
  apiKey, 
  onApiKeyChange, 
  onSubmit, 
  isSubmitting, 
  error, 
  darkMode,
  showPassword,
  onTogglePassword 
}) => {
  const isFormValid = apiKey.length === 16 && !isSubmitting;

  return (
    <div className="space-y-6">
      <div>
        <label 
          htmlFor="apiKey" 
          className={`block text-sm font-medium mb-3 ${
            darkMode ? 'text-slate-300' : 'text-gray-700'
          }`}
        >
          Enter your Torn City API Key:
        </label>
        
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="apiKey"
            name="apiKey"
            value={apiKey}
            onChange={onApiKeyChange}
            placeholder="Enter your 16-character API key"
            maxLength={16}
            className={`w-full px-4 py-3 pr-10 rounded-lg border-2 transition-all duration-200 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              darkMode 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${error ? 'border-red-500' : ''}`}
            disabled={isSubmitting}
            autoComplete="off"
            spellCheck="false"
          />
          
          <button
            type="button"
            onClick={onTogglePassword}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
            }`}
            disabled={isSubmitting}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        
        <div className={`mt-2 text-sm text-right ${
          darkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          {apiKey.length}/16 characters
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg border ${
          darkMode 
            ? 'bg-red-900/50 border-red-700 text-red-300' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-start">
            <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!isFormValid}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          darkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'
        } ${
          isFormValid
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            Verifying...
          </div>
        ) : (
          'Login'
        )}
      </button>
    </div>
  );
};

/**
 * Footer Component
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Dark mode state
 * @returns {JSX.Element} Footer component
 */
const Footer = ({ darkMode }) => (
  <div className="mt-8 text-center">
    <div className={`space-y-2 text-sm ${
      darkMode ? 'text-slate-400' : 'text-gray-500'
    }`}>
      <p className="flex items-center justify-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your API key is stored securely and never shared
      </p>
      <p>
        Get your API key:{' '}
        <a
          href="https://www.torn.com/preferences.php#tab=api"
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-colors ${
            darkMode 
              ? 'text-blue-400 hover:text-blue-300' 
              : 'text-blue-600 hover:text-blue-700'
          } hover:underline`}
        >
          Torn Preferences
        </a>
      </p>
    </div>
    
    <div className="mt-4 pt-4 border-t border-opacity-20 border-gray-400">
      <a
        href="/admin"
        className={`text-xs transition-colors ${
          darkMode 
            ? 'text-slate-400 hover:text-slate-300' 
            : 'text-gray-500 hover:text-gray-700'
        } hover:underline`}
      >
        Admin Access
      </a>
    </div>
  </div>
);

/**
 * Main UnifiedLogin Component
 * @returns {JSX.Element} The unified login page
 */
const UnifiedLogin = () => {
  const [darkMode, setDarkMode] = useState(() => detectOSColorScheme());
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handle API key input change
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleApiKeyChange = (e) => {
    const value = e.target.value.trim();
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    setApiKey(filteredValue);
    
    if (error) {
      setError(null);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (apiKey.length !== 16) {
      setError('API key must be exactly 16 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement API key verification with backend
      // 1. Verify API key with Torn API
      // 2. Get user info and company info
      // 3. Check if company exists in admin panel
      // 4. Route based on role (Director → Director Dashboard, Buyer → Client Dashboard)
      
      // Simulate API call for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock routing logic - replace with actual API calls
      if (apiKey === 'director123456789') {
        // Route to Director Dashboard
        window.location.href = '/director/dashboard';
      } else if (apiKey === 'buyer1234567890ab') {
        // Route to Trains Buyer Dashboard
        window.location.href = '/client/dashboard';
      } else {
        throw new Error('Invalid API key or you are not registered with any company');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Authentication failed. Please check your API key.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
      darkMode 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-blue-600 to-purple-700'
    }`}>
      <div className={`w-full max-w-md rounded-xl shadow-2xl p-8 transition-colors duration-200 ${
        darkMode 
          ? 'bg-slate-800 border border-slate-700' 
          : 'bg-white'
      }`}>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Training Dashboard
          </h1>
          <p className={`${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Access your training company dashboard
          </p>
        </div>

        <LoginForm
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
          darkMode={darkMode}
          showPassword={showPassword}
          onTogglePassword={togglePasswordVisibility}
        />

        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

export default UnifiedLogin;