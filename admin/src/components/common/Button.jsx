import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = "button", variant = "primary", disabled, className = "" }) => {
  const variants = {
    primary: "bg-[#191970] hover:bg-[#0f0f50] text-white shadow-xl shadow-[#191970]/20",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20",
    success: "bg-[#00875A] hover:bg-[#006845] text-white shadow-xl shadow-[#00875A]/20",
    outline: "border-2 border-gray-100 hover:border-[#191970]/30 hover:bg-[#FAFAFA] text-[#1A1A2E] bg-white",
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3.5 rounded-[16px] font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default Button;