import React from 'react';
import { useClient } from '../context/ClientContext';

const ClientDashboard = () => {
  const { user, isAuthenticated } = useClient();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎯 Training Dashboard</h1>
            <p className="text-gray-600 mb-6">Please enter your API key to continue</p>
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-warning-800 text-sm">
                Client dashboard components are being loaded...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="card">
          <div className="card-body text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600">
              Client dashboard is loading...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
