import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ headers, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-4 sm:p-6 w-full"
  >
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead className="bg-[#FAFAFA] border-b-2 border-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-5 text-[10px] font-black text-[#191970] uppercase tracking-widest whitespace-nowrap first:rounded-tl-[16px] last:rounded-tr-[16px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default Table;