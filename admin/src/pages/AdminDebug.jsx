import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../context/AppContext';

const AdminDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const runDiagnostics = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check if backend is reachable
      const corsTest = await axios.get(`${backendUrl}/api/cors-test`);
      results.corsTest = { success: true, data: corsTest.data };
    } catch (err) {
      results.corsTest = { success: false, error: err.message };
    }

    try {
      // Test 2: Check admin existence
      const adminCheck = await axios.get(`${backendUrl}/api/admin/check-admin-exists`);
      results.adminExists = { success: true, data: adminCheck.data };
    } catch (err) {
      results.adminExists = { success: false, error: err.message };
    }

    if (testEmail) {
      try {
        // Test 3: Debug admin login (if email provided)
        const debugLogin = await axios.post(`${backendUrl}/api/admin/debug-login`, { email: testEmail });
        results.debugLogin = { success: true, data: debugLogin.data };
      } catch (err) {
        results.debugLogin = { success: false, error: err.response?.data || err.message };
      }
    }

    setDebugInfo(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Run Diagnostics</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Email (optional - for admin debug)
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin email to test"
              />
            </div>
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </button>
          </div>
        </div>

        {debugInfo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Diagnostic Results</h2>
            <div className="space-y-4">
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium">CORS Test</h3>
                <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(debugInfo.corsTest, null, 2)}
                </pre>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium">Admin Existence Check</h3>
                <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(debugInfo.adminExists, null, 2)}
                </pre>
              </div>

              {debugInfo.debugLogin && (
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-medium">Debug Login Info</h3>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-2 overflow-auto">
                    {JSON.stringify(debugInfo.debugLogin, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Common Issues & Solutions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>409 Error:</strong> Admin already exists - try logging in instead</li>
            <li>• <strong>401 Error:</strong> Check email/password combination</li>
            <li>• <strong>CORS Error:</strong> Backend URL might be incorrect</li>
            <li>• <strong>Network Error:</strong> Backend server might be down</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDebug;
