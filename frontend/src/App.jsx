/**
 * Main App Component with Admin and Client Routing
 * Handles routing between client dashboard and admin panel
 * 
 * @file src/App.jsx
 * @author Training Company App
 * @version 2.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import ClientDashboard from './pages/ClientDashboard';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import DebugCardTest from './components/DebugCardTest';



/**
 * Protected Admin Route Component
 * Handles authentication check and loading states
 */
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAdmin();
  
  // Show loading spinner while checking authentication
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
  
  // Redirect to login if not authenticated
  return isAuthenticated ? children : <AdminLogin />;
};

/**
 * Admin App Component
 * Wraps admin routes with AdminProvider and protection
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

/**
 * Client App Component
 * Wraps client routes with ClientProvider
 */
const ClientApp = () => {
  return (
    <ClientProvider>
      <ClientDashboard />
    </ClientProvider>
  );
};

/**
 * Main App Component
 * Root routing and error boundary setup
 */
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Default redirect to client */}
          <Route path="/" element={<Navigate to="/client" replace />} />
          
          {/* Client Dashboard Routes */}
          <Route path="/client" element={<ClientApp />} />
          <Route path="/client/*" element={<ClientApp />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminApp />} />
          <Route path="/admin/*" element={<AdminApp />} />

          // Add a route or replace your current dashboard temporarily
          <Route path="/debug" element={<DebugCardTest />} />
          
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;



// /**
//  * Main App Component - Root application component with routing and providers
//  * Manages global state and navigation for the entire application
//  * 
//  * @file src/App.jsx
//  * @author Training Company App
//  * @version 2.0.0
//  */

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ClientProvider } from './context/ClientContext';
// import ClientDashboard from './pages/ClientDashboard';
// import ErrorBoundary from './components/common/ErrorBoundary';

// /**
//  * Main Application Component
//  * @returns {JSX.Element} The root application component
//  */
// function App() {
//   return (
//     <ErrorBoundary>
//       <Router>
//         <ClientProvider>
//           <div className="App">
//             <Routes>
//               {/* Default route redirects to client dashboard */}
//               <Route 
//                 path="/" 
//                 element={<Navigate to="/client" replace />} 
//               />
              
//               {/* Client dashboard route */}
//               <Route 
//                 path="/client" 
//                 element={<ClientDashboard />} 
//               />
              
//               {/* Admin routes (placeholder for future implementation) */}
//               <Route 
//                 path="/admin/*" 
//                 element={
//                   <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                     <div className="text-center">
//                       <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                         Admin Panel
//                       </h1>
//                       <p className="text-gray-600">
//                         Coming soon...
//                       </p>
//                     </div>
//                   </div>
//                 } 
//               />
              
//               {/* Catch-all route for 404s */}
//               <Route 
//                 path="*" 
//                 element={<Navigate to="/client" replace />} 
//               />
//             </Routes>
//           </div>
//         </ClientProvider>
//       </Router>
//     </ErrorBoundary>
//   );
// }

// export default App;