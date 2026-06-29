import React from 'react';
import { motion } from 'framer-motion';

const RequestRow = ({ request, onReview }) => (
  <motion.tr 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="hover:bg-[#191970]/5 transition-colors group"
  >
    <td className="px-6 py-5 border-b border-gray-50">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-[12px] bg-[#191970]/10 flex items-center justify-center text-[#191970] font-black text-xs mr-4">
          {request.user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-bold text-[#1A1A2E] capitalize">{request.user?.username}</div>
          <div className="text-[10px] font-medium text-gray-400 mt-0.5">{request.user?.email}</div>
        </div>
      </div>
    </td>
    
    <td className="px-6 py-5 border-b border-gray-50 text-sm font-semibold text-[#1A1A2E]">
      {request.fullName}
    </td>
    
    <td className="px-6 py-5 border-b border-gray-50 text-sm font-semibold text-[#1A1A2E]/60 font-mono tracking-wider">
      {request.cnicNumber}
    </td>
    
    <td className="px-6 py-5 border-b border-gray-50 text-right">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onReview(request)}
        className="text-[10px] font-black uppercase tracking-widest bg-[#191970]/10 text-[#191970] px-5 py-2.5 rounded-[12px] hover:bg-[#191970] hover:text-white transition-colors"
      >
        Review Documents
      </motion.button>
    </td>
  </motion.tr>
);

export default RequestRow;