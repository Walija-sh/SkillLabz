import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="min-h-screen bg-[#ECEFF1] px-4 sm:px-6 py-12 pb-24 flex justify-center"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-4xl space-y-8">      
        {/* Navigation & Header */}
        <motion.div variants={fadeUp} className="space-y-6">
          
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1A2E] uppercase">
              Privacy <span className="text-[#191970]">Policy</span>
            </h1>
            <p className="mt-3 text-sm font-bold tracking-widest uppercase text-gray-400">
              Last Updated: June 2026
            </p>
          </div>
        </motion.div>

        {/* Content Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 sm:p-12 space-y-10">
          
          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">1. Information We Collect</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed mb-3">
              We collect information to provide a safe and reliable peer-to-peer marketplace. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#1A1A2E]/80 font-medium">
              <li><strong>Personal Details:</strong> Name, email address, phone number, and location.</li>
              <li><strong>Verification Data:</strong> CNIC images, live selfies, and date of birth for trust and safety purposes.</li>
              <li><strong>Platform Activity:</strong> Rental history, chat messages, reviews, and tool listings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">2. How We Use Your Information</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed">
              Your data is primarily used to facilitate secure tool rentals and skill-sharing sessions. Verification data is used strictly to establish a trusted community and prevent fraud. We also use your contact information to send transactional updates, such as OTPs for tool handover and return, and contract confirmations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">3. Data Sharing & Security</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed">
              We do not sell your personal data. Limited profile information (such as your first name, location area, and reviews) is visible to other users to facilitate rentals. Highly sensitive information like CNIC details are encrypted, stored securely, and only accessible by authorized admins for verification purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">4. Your Rights</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed">
              You have the right to access, update, or request the deletion of your personal data. If you wish to permanently delete your account and associated verification data, please contact our support team. Note that data related to past rental contracts may be retained for legal and dispute resolution purposes.
            </p>
          </section>

        </motion.div>
      </div>
    </motion.div>
  );
}