import React from 'react';
import { motion } from 'framer-motion';

// ─── Animation Variants ──────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const ImageGallery = ({ selfie, front, back }) => (
  <motion.div 
    variants={stagger} 
    initial="hidden" 
    animate="show" 
    className="grid grid-cols-1 md:grid-cols-3 gap-6"
  >
    <motion.div variants={fadeUp} className="space-y-3">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Selfie</span>
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        className="aspect-3/4 rounded-[24px] overflow-hidden border-2 border-gray-100 shadow-sm bg-[#FAFAFA] transition-colors hover:border-[#191970]/30"
      >
        <img src={selfie} alt="Selfie" className="w-full h-full object-cover" />
      </motion.div>
    </motion.div>

    <motion.div variants={fadeUp} className="space-y-3">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNIC Front</span>
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        className="aspect-video rounded-[24px] overflow-hidden border-2 border-gray-100 shadow-sm bg-[#FAFAFA] transition-colors hover:border-[#191970]/30"
      >
        <img src={front} alt="CNIC Front" className="w-full h-full object-cover" />
      </motion.div>
    </motion.div>

    <motion.div variants={fadeUp} className="space-y-3">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNIC Back</span>
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        className="aspect-video rounded-[24px] overflow-hidden border-2 border-gray-100 shadow-sm bg-[#FAFAFA] transition-colors hover:border-[#191970]/30"
      >
        <img src={back} alt="CNIC Back" className="w-full h-full object-cover" />
      </motion.div>
    </motion.div>
  </motion.div>
);

export default ImageGallery;