/**
 * Main App Component - Root application component with routing and providers
 * Manages global state and navigation for the entire application
 * 
 * @file src/App.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext';
import ClientDashboard from './pages/ClientDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Main Application Component
 * @returns {JSX.Element} The root application component
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ClientProvider>
          <div className="App">
            <Routes>
              {/* Default route redirects to client dashboard */}
              <Route 
                path="/" 
                element={<Navigate to="/client" replace />} 
              />
              
              {/* Client dashboard route */}
              <Route 
                path="/client" 
                element={<ClientDashboard />} 
              />
              
              {/* Admin routes (placeholder for future implementation) */}
              <Route 
                path="/admin/*" 
                element={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Admin Panel
                      </h1>
                      <p className="text-gray-600">
                        Coming soon...
                      </p>
                    </div>
                  </div>
                } 
              />
              
              {/* Catch-all route for 404s */}
              <Route 
                path="*" 
                element={<Navigate to="/client" replace />} 
              />
            </Routes>
          </div>
        </ClientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;