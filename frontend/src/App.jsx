/**
 * Main App Component
 * 
 * Root component for the Training Company Management Application.
 * Sets up routing, error boundaries, and provides global context.
 * 
 * @component
 * @fileoverview Main application component with routing and global providers
 * @author Training Company Development Team
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ClientProvider } from './context/ClientContext';
import ClientDashboard from './pages/ClientDashboard';

// Import API test utility in development mode
if (import.meta.env.DEV) {
  import('./utils/testAPI');
}

/**
 * Home page component - landing page for the application
 * 
 * @returns {JSX.Element} Home page component
 */
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
    <div className="card max-w-2xl w-full animate-fade-in">
      <div className="card-body text-center">
        <div className="text-6xl mb-6">🎯</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Training Company Manager
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Professional training management for Torn City companies
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 transition-all duration-200 hover:shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Client Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Check your training status and progress with your API key
            </p>
            <a
              href="/client"
              className="btn btn-primary w-full"
            >
              Access Dashboard
            </a>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 transition-all duration-200 hover:shadow-md">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Admin Panel
            </h2>
            <p className="text-gray-600 mb-4">
              Manage users and training assignments
            </p>
            <a
              href="/admin"
              className="btn btn-secondary w-full"
            >
              Admin Login
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Secure • Real-time • Professional</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Admin panel placeholder component
 * 
 * @returns {JSX.Element} Admin panel placeholder
 */
const AdminPanel = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="card animate-fade-in">
      <div className="card-body text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Panel
        </h1>
        <p className="text-gray-600 mb-6">
          Admin panel will be implemented in the next phase
        </p>
        <a href="/" className="btn btn-secondary">
          Back to Home
        </a>
      </div>
    </div>
  </div>
);

/**
 * 404 Not Found component
 * 
 * @returns {JSX.Element} 404 page component
 */
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="card animate-fade-in">
      <div className="card-body text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="btn btn-primary">
          Go Home
        </a>
      </div>
    </div>
  </div>
);

/**
 * Main App component with routing and error boundary
 * 
 * Sets up the application routing structure and provides error handling
 * for the entire application tree.
 * 
 * @returns {JSX.Element} Main App component
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Home route */}
            <Route path="/" element={<HomePage />} />
            
            {/* Client routes wrapped with ClientProvider */}
            <Route path="/client" element={
              <ClientProvider>
                <ClientDashboard />
              </ClientProvider>
            } />
            <Route path="/client/*" element={
              <ClientProvider>
                <ClientDashboard />
              </ClientProvider>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            
            {/* 404 fallback */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;