/**
 * ErrorBoundary Component
 * 
 * React Error Boundary component that catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI instead of crashing the app.
 * 
 * @component
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import React from 'react';

/**
 * ErrorBoundary class component for handling React errors
 * 
 * Catches errors during rendering, in lifecycle methods, and in constructors
 * of the whole tree below them. Displays a user-friendly error message.
 */
class ErrorBoundary extends React.Component {
  /**
   * Initialize error boundary state
   * 
   * @param {Object} props - Component props
   */
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  /**
   * Static method called when an error occurs
   * Updates state to indicate an error has occurred
   * 
   * @param {Error} error - The error that was caught
   * @returns {Object} New state object
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Lifecycle method called after an error has been thrown
   * Logs error details for debugging
   * 
   * @param {Error} error - The error that was caught
   * @param {Object} errorInfo - Information about the error
   */
  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details in state for display
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Report error to monitoring service in production
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  /**
   * Report error to monitoring service (placeholder)
   * In production, this would send error details to a service like Sentry
   * 
   * @param {Error} error - The error that was caught
   * @param {Object} errorInfo - Information about the error
   */
  reportError(error, errorInfo) {
    // TODO: Implement error reporting to monitoring service
    console.log('Error reported to monitoring service:', { error, errorInfo });
  }

  /**
   * Reset error boundary state
   * Allows user to try again after an error
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Reload the current page
   * Last resort recovery option
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Render method - shows error UI or children
   * 
   * @returns {JSX.Element} Error UI or children components
   */
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card">
              <div className="card-body text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  We're sorry, but something unexpected happened. 
                  Please try refreshing the page or contact support if the problem persists.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={this.handleReset}
                    className="btn btn-primary w-full"
                  >
                    Try Again
                  </button>
                  
                  <button
                    onClick={this.handleReload}
                    className="btn btn-secondary w-full"
                  >
                    Reload Page
                  </button>
                </div>
                
                {/* Show error details in development mode */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Show Error Details (Development Mode)
                    </summary>
                    <div className="mt-2 p-4 bg-gray-100 rounded border text-xs font-mono text-gray-800 overflow-auto max-h-40">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
