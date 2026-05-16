import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiSmartphone, FiFileText, FiStar } from 'react-icons/fi';

const leftColVariants = {
  hidden: { opacity: 0, x: -30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

const trustContainerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.15, delayChildren: 0.25 } },
};

const trustCardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function TrustAndSafety() {
  return (
    <section className="pt-8 md:pt-12 pb-12 md:pb-20 px-4 bg-[#ECEFF1]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Narrative copy ── */}
          <motion.div
            className="flex flex-col justify-center"
            variants={leftColVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <span className="inline-flex items-center self-start gap-2 bg-[#191970]/10 text-[#191970] px-4 py-1.5 rounded-full text-sm font-semibold mb-6 tracking-wide">
              <FiShield size={14} />
              Security Guarantee
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
              Trust &amp; Safety <br />
              <span className="text-[#191970]">First.</span>
            </h2>

            <div className="space-y-6">
              <div className="border-l-4 border-[#191970] pl-6 py-1">
                <p className="text-gray-600 text-lg leading-relaxed">
                  Every rental is shielded by OTP verification and legally-binding digital contracts — so you transact with complete confidence.
                </p>
              </div>
              <div className="border-l-4 border-[#191970]/30 pl-6 py-1">
                <p className="text-gray-500 text-base leading-relaxed">
                  Our community trust scores and user reviews keep bad actors out and great neighbours in. Your security isn't an afterthought — it's the foundation.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Staggered cards ── */}
          <motion.div
            className="flex flex-col gap-4"
            variants={trustContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            {/* Card 1 — OTP (full-width, solid blue) */}
            <motion.div
              variants={trustCardVariants}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 24px 48px rgba(25,25,112,0.30)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-2xl bg-[#191970] p-7 flex items-center gap-6 cursor-default"
            >
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <div className="shrink-0 w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner relative z-10">
                <FiSmartphone size={28} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-1">Step 01</p>
                <h3 className="text-xl font-bold text-white mb-1">OTP Verification</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Every pickup and return is secured with a one-time password — no trust required, just proof.
                </p>
              </div>
            </motion.div>

            {/* Bottom row: two cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 2 — Digital Contracts */}
              <motion.div
                variants={trustCardVariants}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(25,25,112,0.12)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl bg-white shadow-xl p-6 flex flex-col gap-4 cursor-default"
              >
                <div className="flex items-center justify-start">
                  <div className="w-12 h-12 rounded-xl bg-[#191970]/10 flex items-center justify-center text-[#191970]">
                    <FiFileText size={22} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#191970] mb-1">Step 02</p>
                  <h3 className="font-bold text-gray-900 text-base leading-snug">Digital Contracts</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mt-1">Legally binding agreements generated instantly — no paperwork needed.</p>
                </div>
              </motion.div>

              {/* Card 3 — Trust Scores */}
              <motion.div
                variants={trustCardVariants}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(25,25,112,0.14)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl bg-white shadow-xl p-6 flex flex-col gap-4 cursor-default"
              >
                <div className="flex items-center justify-start">
                  <div className="w-12 h-12 rounded-xl bg-[#191970]/15 flex items-center justify-center text-[#191970]">
                    <FiStar size={22} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#191970] mb-1">Step 03</p>
                  <h3 className="font-bold text-gray-900 text-base leading-snug">Trust Scores</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mt-1">Community-driven ratings that reward reliability and weed out bad actors.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}