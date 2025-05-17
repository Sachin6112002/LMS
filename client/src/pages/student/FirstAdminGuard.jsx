import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/student/Loading';

// This component checks if an admin exists. If not, renders children (registration form). If admin exists, redirects to login/home.
const FirstAdminGuard = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await axios.get('/api/admin/check-admin-exists');
        setAdminExists(data.exists);
        setChecking(false);
        if (data.exists) {
          // If admin exists, redirect to login or home
          navigate('/login', { replace: true });
        }
      } catch (err) {
        setChecking(false);
        setAdminExists(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (checking) return <Loading />;
  if (adminExists) return null; // Will redirect
  return children;
};

export default FirstAdminGuard;
