import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { toast } from 'react-toastify';

const PaymentResult = () => {
  const { redirectTo } = useParams();
  const navigate = useNavigate();
  const { fetchUserEnrolledCourses, isAuthenticated } = useContext(AppContext);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Update enrolled courses when coming from a successful payment - only if user is authenticated
    if (isAuthenticated()) {
      fetchUserEnrolledCourses();
    }
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect based on the parameter
          if (redirectTo === 'my-enrollments') {
            navigate('/my-enrollments');
          } else {
            navigate('/');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, redirectTo, fetchUserEnrolledCourses, isAuthenticated]);

  const handleManualRedirect = () => {
    if (redirectTo === 'my-enrollments') {
      navigate('/my-enrollments');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
        <div className="mb-6">
          <Loading />
        </div>
        
        <h1 className="text-2xl font-bold text-green-900 mb-4">
          🎉 Payment Successful!
        </h1>
        
        <p className="text-green-700 mb-4">
          Your course enrollment is being processed. You'll be redirected to your enrollments in {countdown} seconds.
        </p>
        
        <div className="mb-6">
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <button
          onClick={handleManualRedirect}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Go to My Enrollments Now
        </button>
        
        <p className="text-sm text-gray-600 mt-4">
          If you don't see your course immediately, please wait a moment for the payment to process completely.
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;
