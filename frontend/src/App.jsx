/**
 * Fixed Development Routes - Working Solution
 * Sets localStorage BEFORE the context providers mount
 * 
 * @file src/App.jsx (Fixed Version)
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { DirectorProvider, useDirector } from './context/DirectorContext';
import { ClientProvider, useClient } from './context/ClientContext';
import UnifiedLogin from './components/auth/UnifiedLogin';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import DirectorDashboard from './components/director/DirectorDashboard';
import ClientDashboard from './components/client/ClientDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

/**
 * Development Banner Component
 */
const DevBanner = ({ userType }) => (
  <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium flex justify-between items-center">
    <span>⚠️ DEVELOPMENT MODE - {userType.toUpperCase()} DASHBOARD</span>
    <button 
      onClick={() => {
        // Clear localStorage and redirect
        localStorage.clear();
        window.location.href = '/login';
      }}
      className="text-white hover:text-red-200 underline"
    >
      Exit Dev Mode
    </button>
  </div>
);

/**
 * Development Director Component
 * Sets localStorage before rendering
 */
const DevDirector = () => {
  // Set localStorage immediately (synchronously)
  localStorage.setItem('director_user', JSON.stringify({
    id: 'director_1',
    name: 'MonChoon',
    tornId: 2250591
  }));
  
  localStorage.setItem('director_company', JSON.stringify({
    id: 'eagle-tavern',
    name: 'Eagle Tavern',
    type: 'Pub',
    director: { name: 'MonChoon', tornId: 2250591 },
    trainsBuyer: { name: 'Kelpgrizzley', tornId: 3189518 },
    rate: 500000,
    employeeCount: 25,
    trainsRemaining: 339,
    daysRemaining: 22.6,
    status: 'good',
    companyBank: 5000000,
    totalTrainsPurchased: 800,
    isActive: true,
    lastScraped: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }));
  
  localStorage.setItem('director_authenticated', 'true');

  return (
    <DirectorProvider>
      <div>
        <DevBanner userType="director" />
        <DirectorDashboard />
      </div>
    </DirectorProvider>
  );
};

/**
 * Development Client Component
 * Sets localStorage before rendering
 */
const DevClient = () => {
  // Set localStorage immediately (synchronously)
  localStorage.setItem('client_user', JSON.stringify({
    id: 'client_1',
    name: 'Kelpgrizzley',
    tornId: 3189518
  }));
  
  localStorage.setItem('client_company', JSON.stringify({
    id: 'eagle-tavern',
    name: 'Eagle Tavern',
    rate: 500000,
    director: { name: 'MonChoon', tornId: 2250591 }
  }));
  
  localStorage.setItem('client_authenticated', 'true');

  return (
    <ClientProvider>
      <div>
        <DevBanner userType="client" />
        <ClientDashboard />
      </div>
    </ClientProvider>
  );
};

/**
 * Protected Route Components
 */
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAdmin();
  
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="white" />
          <p className="text-slate-400 mt-4">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <AdminLogin />;
};

const ProtectedDirectorRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useDirector();
  
  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="white" />
          <p className="text-slate-400 mt-4">Loading director dashboard...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <UnifiedLogin />;
};

const ProtectedClientRoute = ({ children }) => {
  const { isAuthenticated, loading } = useClient();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="white" />
          <p className="text-slate-400 mt-4">Loading client dashboard...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <UnifiedLogin />;
};

/**
 * App Components
 */
const AdminApp = () => {
  return (
    <AdminProvider>
      <ProtectedAdminRoute>
        <AdminDashboard />
      </ProtectedAdminRoute>
    </AdminProvider>
  );
};

const DirectorApp = () => {
  return (
    <DirectorProvider>
      <ProtectedDirectorRoute>
        <DirectorDashboard />
      </ProtectedDirectorRoute>
    </DirectorProvider>
  );
};

const ClientApp = () => {
  return (
    <ClientProvider>
      <ProtectedClientRoute>
        <ClientDashboard />
      </ProtectedClientRoute>
    </ClientProvider>
  );
};

/**
 * Main App Component
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Default redirect to unified login */}
          <Route path="/" element={<UnifiedLogin />} />
          
          {/* Unified Login Route */}
          <Route path="/login" element={<UnifiedLogin />} />
          
          {/* Production Routes */}
          <Route path="/director" element={<DirectorApp />} />
          <Route path="/director/*" element={<DirectorApp />} />
          <Route path="/client" element={<ClientApp />} />
          <Route path="/client/*" element={<ClientApp />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
          
          {/* FIXED DEVELOPMENT ROUTES */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <Route path="/dev/director" element={<DevDirector />} />
              <Route path="/dev/client" element={<DevClient />} />
            </>
          )}
          
          {/* Legacy user route - redirect to director */}
          <Route path="/user" element={<Navigate to="/director" replace />} />
          <Route path="/user/*" element={<Navigate to="/director" replace />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;