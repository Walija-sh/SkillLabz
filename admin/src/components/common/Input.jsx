import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({ label, type = "text", value, onChange, placeholder, error, className = "" }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label className="block text-[10px] font-black tracking-widest uppercase text-[#191970] mb-2">
        {label}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl bg-[#FAFAFA] border-2 px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] outline-none transition-all placeholder:text-gray-400 placeholder:font-medium focus:bg-white focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-gray-100'}`}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-widest"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export default Input;