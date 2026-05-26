import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#ECEFF1] pt-8 md:pt-12 pb-8 md:pb-12 px-4 text-center text-gray-900">
      <h2 className="text-4xl font-bold mb-4 text-gray-900">Ready to Get Started?</h2>
      <p className="text-gray-600 mb-8 text-lg">Join thousands of users already renting and sharing tools in your community</p>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="inline-block"
      >
        <Button
          variant="primary"
          className="bg-[#191970] text-white hover:bg-[#141457] border-none px-10 py-4 text-lg font-bold"
          onClick={() => navigate('/register')}
        >
          Create Free Account
        </Button>
      </motion.div>
    </section>
  );
}