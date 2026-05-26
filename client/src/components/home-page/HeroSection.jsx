import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../common/Button';

const heroContainer = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1, y: 0,
    transition: { staggerChildren: 0.16, duration: 0.65, ease: 'easeOut' },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: 'easeOut' } },
};

export default function HeroSection() {
  const navigate   = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.status);

  const handleListToolClick = () => navigate(isLoggedIn ? '/list-tool' : '/login');

  return (
    <section className="pt-8 md:pt-12 pb-2 md:pb-3 px-4 bg-[#ECEFF1] overflow-hidden hero-section">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        {/* ── Left: Copy ── */}
        <motion.div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.h1 variants={heroItem} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Rent Tools. Share Skills. <br className="hidden md:block lg:hidden" />
            <span className="text-[#191970] mt-2 block">Build Community.</span>
          </motion.h1>

          <motion.p variants={heroItem} className="mt-6 text-lg md:text-xl text-gray-500 max-w-xl">
            Join Pakistan's first peer-to-peer tool rental and skill-sharing marketplace.
            Save money, earn income, and connect with your local community.
          </motion.p>

          <motion.div variants={heroItem} className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
              <Button
                className="px-8 py-4 text-lg w-full sm:w-auto bg-[#191970] hover:bg-[#141457] text-white shadow-lg shadow-blue-500/30"
                onClick={() => navigate('/browse-tools')}
              >
                Explore Tools
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }}>
              <Button
                variant="secondary"
                className="px-8 py-4 text-lg w-full sm:w-auto bg-gray-300 hover:bg-gray-380 text-gray-900 border-none transition-colors"
                onClick={handleListToolClick}
              >
                List Your Tool
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Right: Image ── */}
        <motion.div variants={heroItem} className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg lg:max-w-none rounded-3xl overflow-hidden">
            <img src="/home page/hero.png" alt="SkillLabz Hero" className="w-full h-auto object-cover" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}