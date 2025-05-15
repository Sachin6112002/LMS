import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../../components/admin/Footer';
import AdminSidebar from '../../components/admin/SideBar';
import AdminNavbar from '../../components/admin/Navbar';
import AdminProfile from '../../components/admin/Profile';

const Admin = () => {
  console.log('Rendering Admin Component');

  return (
    <div className="text-default min-h-screen bg-white">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <Outlet /> {/* Ensures child routes render here */}
          <AdminProfile />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;