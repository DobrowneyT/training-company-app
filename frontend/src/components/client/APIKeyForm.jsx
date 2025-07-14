/**
 * API Key Verification Form Component
 * 
 * Form component for users to enter their Torn City API key for verification
 * and authentication. Includes validation, error handling, and loading states.
 * 
 * @component
 * @example
 * <APIKeyForm />
 */

import React, { useState } from 'react';
import { useClient } from '../../context/ClientContext';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * API Key verification form component
 * 
 * Allows users to enter their 16-character Torn City API key for verification
 * and authentication. Provides real-time validation and error feedback.
 * 
 * @returns {JSX.Element} API Key form component
 */
const APIKeyForm = () => {
  const { verifyApiKey, loading, error, clearError } = useClient();
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle API key input change
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleApiKeyChange = (e) => {
    const value = e.target.value;
    
    // Allow only alphanumeric characters and limit to 16 characters
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    
    setApiKey(sanitized);
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Handle form submission
   * 
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate API key format
    if (!apiKey) {
      return;
    }
    
    if (apiKey.length !== 16) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await verifyApiKey(apiKey);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if form is valid for submission
   * 
   * @returns {boolean} Form validity
   */
  const isFormValid = apiKey.length === 16;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="card max-w-md w-full animate-fade-in">
        <div className="card-body">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Training Dashboard
            </h1>
            <p className="text-gray-600">
              Enter your Torn City API key to view your training assignment and progress
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="form-label">
                Torn City API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your 16-character API key"
                className="form-input font-mono text-center text-lg tracking-widest"
                required
                disabled={loading || isSubmitting}
                autoComplete="off"
                autoFocus
              />
              <div className="form-help">
                API key should be exactly 16 characters long
              </div>
              
              {/* Character count indicator */}
              <div className="mt-2 text-right">
                <span className={`text-sm ${
                  apiKey.length === 16 
                    ? 'text-success-600' 
                    : apiKey.length > 0 
                      ? 'text-warning-600' 
                      : 'text-gray-400'
                }`}>
                  {apiKey.length}/16
                </span>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="alert alert-danger animate-slide-in">
                <div className="flex items-center">
                  <span className="text-lg mr-2">❌</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!isFormValid || loading || isSubmitting}
              className="btn btn-primary w-full btn-lg"
            >
              {loading || isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" inline />
                  <span className="ml-2">Verifying...</span>
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          {/* Help section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Need help finding your API key?
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  1. Go to{' '}
                  <a
                    href="https://www.torn.com/preferences.php#tab=api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Torn Preferences
                  </a>
                </p>
                <p>2. Click on the "API" tab</p>
                <p>3. Copy your API key (16 characters)</p>
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-lg mr-2">🔒</span>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">
                  Your API key is secure
                </p>
                <p>
                  Your API key is encrypted and stored securely. 
                  It's only used to fetch your training data from Torn City.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeyForm;