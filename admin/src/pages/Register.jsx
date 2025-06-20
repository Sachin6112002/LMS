import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form className="bg-white p-8 rounded shadow-md w-full max-w-md border border-green-200">
        {/* ...rest of the form... */}
      </form>
    </div>
  );
};

export default Register;
