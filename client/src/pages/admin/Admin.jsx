import React from 'react';
import { Outlet } from 'react-router-dom';
 // Admin-specific Navbar
import Footer from '../../components/admin/Footer'; // Admin-specific Footer
import AdminSidebar from '../../components/admin/SideBar';
import AdminNavbar from '../../components/admin/Navbar'; // Admin-specific Navbar
import AdminProfile from '../../components/admin/Profile'; // Admin-specific Profile Component

const Admin = () => {
  return (
    <div className="text-default min-h-screen bg-white"> {/* Changed background color to white for better visibility */}
      <AdminNavbar /> {/* Updated to use Admin-specific Navbar */}
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <Outlet />
          <AdminProfile /> {/* Added Admin Profile to the right-hand side */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;