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

export default function Terms() {
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
              Terms of <span className="text-[#191970]">Service</span>
            </h1>
            <p className="mt-3 text-sm font-bold tracking-widest uppercase text-gray-400">
              Last Updated: June 2026
            </p>
          </div>
        </motion.div>

        {/* Content Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 sm:p-12 space-y-10">
          
          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">1. Acceptance of Terms</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed">
              By accessing and using the SkillLabz platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform. SkillLabz provides a peer-to-peer marketplace for renting tools and sharing skills.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">2. User Accounts & Verification</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed mb-3">
              To fully utilize the platform, users must create an account and complete the mandatory identity verification process (including CNIC and live selfie submission). 
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#1A1A2E]/80 font-medium">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>All information provided during registration and verification must be accurate and current.</li>
              <li>SkillLabz reserves the right to suspend or terminate accounts that provide false information or violate platform policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">3. Rentals & Transactions</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed">
              SkillLabz acts as a facilitator. Rental agreements are legally binding contracts directly between the Owner and the Renter. Payments (including security deposits) are processed via approved methods (Easypaisa, JazzCash, Bank Transfer, or Cash). Users must strictly adhere to the OTP-based handover and return confirmation process to ensure secure transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#191970] uppercase tracking-widest mb-4">4. Liability & Damages</h2>
            <p className="text-[#1A1A2E]/80 font-medium leading-relaxed">
              Renters are fully responsible for the items during the rental period. In the event of loss, theft, or damage beyond normal wear and tear, the Renter agrees to compensate the Owner up to the full replacement value of the item, starting with the forfeiture of the security deposit.
            </p>
          </section>

        </motion.div>
      </div>
    </motion.div>
  );
}