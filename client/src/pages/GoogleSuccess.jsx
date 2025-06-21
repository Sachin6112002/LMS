import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// This page handles the redirect after Google OAuth login
export default function GoogleSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId) {
      // Optionally, fetch user data or set user in context/localStorage
      // Example: fetch user profile
      axios.get(`/api/user/${userId}`)
        .then(res => {
          // Save user data to localStorage or context
          localStorage.setItem('user', JSON.stringify(res.data.user));
          // Redirect to dashboard or home
          navigate('/student/home');
        })
        .catch(() => {
          navigate('/student/login');
        });
    } else {
      navigate('/student/login');
    }
  }, [location, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Signing you in with Google...</h2>
    </div>
  );
}
