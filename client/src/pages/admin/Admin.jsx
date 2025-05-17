import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/admin/Navbar'; // Admin-specific Navbar
import Footer from '../../components/admin/Footer'; // Admin-specific Footer
import AdminSidebar from '../../components/admin/SideBar';
import AdminLoginModal from '../../components/admin/AdminLoginModal';

const Admin = () => {
  const [showLogin, setShowLogin] = useState(true); // Show login by default

  // Dummy login handler (replace with real logic)
  const handleAdminLogin = async (email, password) => {
    // TODO: Implement real admin login logic and set showLogin(false) on success
    setShowLogin(false);
  };

  return (
    <div className="text-default min-h-screen bg-red">
      {/* Only render the admin-specific Navbar, not the student one */}
      <Navbar />
      <AdminLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={handleAdminLogin} />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
