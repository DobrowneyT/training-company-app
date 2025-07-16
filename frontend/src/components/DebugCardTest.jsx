/**
 * Debug Card Test Component
 * Minimal component to test if Tailwind CSS is working properly
 * 
 * @file src/components/DebugCardTest.jsx
 * @author Training Company App
 * @version 1.0.0
 */

import React from 'react';

const DebugCardTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Test */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CSS Debug Test</h1>
          <p className="text-gray-600">If you can see this styled properly, Tailwind is working</p>
        </div>

        {/* Card Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-medium">
                ✅ Good
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Test Company</h3>
              <p className="text-sm text-gray-600">Fireworks Stand</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Owner:</span>
                <span className="text-sm font-medium text-gray-900">TestUser</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trains:</span>
                <span className="text-sm font-bold text-green-600">+150</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="px-2 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-medium">
                🚨 Critical
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Another Company</h3>
              <p className="text-sm text-gray-600">Pub</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Owner:</span>
                <span className="text-sm font-medium text-gray-900">TestUser2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trains:</span>
                <span className="text-sm font-bold text-red-600">-25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Button Test */}
        <div className="mt-6 flex space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Secondary Button
          </button>
        </div>

        {/* Dark Mode Test */}
        <div className="mt-6 bg-slate-900 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Dark Mode Test</h3>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-300">If this looks good, dark mode classes are working</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugCardTest;