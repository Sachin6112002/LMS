import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/student/Loading';

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
