import React from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      /* Added px-4 for mobile padding and md:px-8 for desktop */
      className="bg-transparent py-4 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10"
    >
      {/* pl-14 pushes the text right to clear the hamburger button on mobile. md:pl-0 resets it on desktop. */}
      <h2 className="pl-14 md:pl-0 text-xs sm:text-[13px] font-black text-[#191970] uppercase tracking-widest">
        Management Console
      </h2>

      {/* User Profile Section */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#191970]/10 flex items-center justify-center shrink-0">
          <span className="text-[#191970] text-[10px] font-black uppercase">
            {user.username?.charAt(0) || 'A'}
          </span>
        </div>
        <span className="text-[11px] font-black text-[#191970] uppercase tracking-widest hidden sm:block">
          {user.username || 'Admin User'}
        </span>
      </div>
    </motion.header>
  );
};

export default Navbar;