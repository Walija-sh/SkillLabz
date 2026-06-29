import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => (
  <div className="flex flex-col items-center justify-center p-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 rounded-full border-4 border-gray-200"
      style={{ borderTopColor: '#191970' }}
    />
    <p className="mt-5 text-[#191970] font-black text-[10px] uppercase tracking-widest">
      Loading data...
    </p>
  </div>
);

export default Loader;