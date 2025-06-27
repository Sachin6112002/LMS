import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loading from './Loading';

const PendingPurchases = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  const fetchPendingPurchases = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/user/pending-purchases`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setPendingPurchases(data.pendingPurchases || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching pending purchases:', error);
      toast.error('Failed to fetch pending purchases');
    } finally {
      setLoading(false);
    }
  };

  const completePurchase = async (purchaseId) => {
    setCompleting(purchaseId);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/complete-pending-purchase`,
        { purchaseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`Course enrollment completed: ${data.courseTitle}`);
        // Remove the completed purchase from the list
        setPendingPurchases(prev => prev.filter(p => p._id !== purchaseId));
        
        // Refresh the page after a short delay to update enrolled courses
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error completing purchase:', error);
      toast.error('Failed to complete purchase');
    } finally {
      setCompleting(null);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (pendingPurchases.length === 0) {
    return null; // Don't show anything if no pending purchases
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
        ⚠️ Pending Course Enrollments
      </h3>
      <p className="text-sm text-yellow-700 mb-4">
        The following course purchases are still being processed. If you completed payment but don't see your courses, click "Complete Enrollment" below:
      </p>
      
      <div className="space-y-3">
        {pendingPurchases.map((purchase) => (
          <div key={purchase._id} className="bg-white rounded border border-yellow-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {purchase.courseId?.title || 'Course Title Unavailable'}
                </h4>
                <p className="text-sm text-gray-600">
                  Purchase Date: {new Date(purchase.createdAt).toLocaleDateString()}
                </p>
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                  Status: Pending
                </span>
              </div>
              <button
                onClick={() => completePurchase(purchase._id)}
                disabled={completing === purchase._id}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded font-medium text-sm transition"
              >
                {completing === purchase._id ? 'Processing...' : 'Complete Enrollment'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-yellow-600">
        <p>
          <strong>Note:</strong> If you're still having issues, please contact support with your purchase details.
        </p>
      </div>
    </div>
  );
};

export default PendingPurchases;
