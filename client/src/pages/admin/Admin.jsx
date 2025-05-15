import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/admin/Navbar'; // Admin-specific Navbar
import Footer from '../../components/admin/Footer'; // Admin-specific Footer
import AdminSidebar from '../../components/admin/SideBar';

const Admin = () => {
  return (
    <div className="text-default min-h-screen bg-red">
      <Navbar />
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
