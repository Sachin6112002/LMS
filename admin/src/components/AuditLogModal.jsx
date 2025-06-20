import React from 'react';

const AuditLogModal = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Timestamp</th>
                <th className="p-2 border">Admin</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-4">No logs found.</td></tr>
              ) : logs.map((log, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-2 border">{log.adminName || log.adminEmail}</td>
                  <td className="p-2 border">{log.action}</td>
                  <td className="p-2 border">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;
