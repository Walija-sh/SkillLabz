import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-[#ECEFF1] overflow-hidden font-sans">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Navbar Component */}
        <Navbar />
        
        {/* Page Content with smooth entrance */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;