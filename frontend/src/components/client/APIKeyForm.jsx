/**
 * API Key Form Component - Handles Torn City API key verification
 * Provides secure input, validation, and user authentication
 * 
 * @file src/components/client/APIKeyForm.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useClient } from '../../context/ClientContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * API Key Form Component for user authentication
 * @returns {JSX.Element} The API key form component
 */
const APIKeyForm = () => {
  // Form state
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Client context
  const { verifyApiKey, error, clearError } = useClient();

  /**
   * Handle API key input change with validation
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleApiKeyChange = (e) => {
    const value = e.target.value.trim();
    
    // Only allow alphanumeric characters, limit to 16 characters
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    setApiKey(filteredValue);
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Handle form submission
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (apiKey.length !== 16) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await verifyApiKey(apiKey);
      
      if (!result.success) {
        // Error is handled by context
        console.log('Authentication failed:', result.error);
      }
      // Success is handled by context (user will be redirected)
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Get input border color based on validation state
   * @returns {string} Tailwind CSS border classes
   */
  const getInputBorderClass = () => {
    if (error) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    }
    if (apiKey.length === 16) {
      return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  /**
   * Check if form is valid for submission
   * @returns {boolean} True if form is valid
   */
  const isFormValid = () => {
    return apiKey.length === 16 && !isSubmitting;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Training Dashboard
          </h1>
          <p className="text-gray-600">
            Enter your Torn City API key to view your training assignment
          </p>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="apiKey" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Torn City API Key
            </label>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your 16-character API key"
                maxLength={16}
                className={`
                  w-full px-3 py-3 pr-10 rounded-lg border-2 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 text-center font-mono text-lg
                  ${getInputBorderClass()}
                `}
                disabled={isSubmitting}
                autoComplete="off"
                spellCheck="false"
              />
              
              {/* Show/Hide Password Button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            
            {/* Character Counter */}
            <div className="mt-2 text-sm text-gray-500 text-right">
              {apiKey.length}/16 characters
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg 
                  className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${isFormValid()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Verifying API Key...
              </div>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
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
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Torn Preferences
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIKeyForm;