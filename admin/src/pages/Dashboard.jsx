import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import verificationService from '../services/verification.service';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const counterVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, index, loading }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(25,25,112,0.10)' }}
    className="bg-white rounded-3xl p-7 flex flex-col gap-5 border border-slate-100 shadow-sm transition-shadow"
  >
    {/* Icon */}
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ backgroundColor: `${accent}15` }}
    >
      <Icon className="w-6 h-6" style={{ color: accent }} strokeWidth={2} />
    </div>

    {/* Value */}
    <div>
      <motion.p
        variants={counterVariant}
        initial="hidden"
        animate="visible"
        className="text-4xl font-black leading-none mb-2"
        style={{ color: accent, fontFamily: 'DM Sans, sans-serif' }}
      >
        {loading ? (
          <span className="inline-block w-10 h-9 bg-slate-100 rounded-xl animate-pulse" />
        ) : (
          value
        )}
      </motion.p>
      <p
        className="text-[11px] font-black uppercase tracking-widest"
        style={{ color: '#94a3b8' }}
      >
        {label}
      </p>
    </div>
  </motion.div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [pending, setPending]     = useState(0);
  const [error, setError]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);

        // Fetch Pending Requests
        const pendingRes = await verificationService.getPendingRequests();
        const pendingData = pendingRes?.data || pendingRes || [];
        setPending(Array.isArray(pendingData) ? pendingData.length : pendingData.count ?? 0);

      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        setError('Failed to load dashboard stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      icon: ClipboardDocumentListIcon,
      label: 'Pending Requests',
      value: pending,
      accent: '#191970',
    },
  ];

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Page Header ── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <p
          className="text-[10px] font-black uppercase tracking-widest mb-1"
          style={{ color: '#191970' }}
        >
          Admin Panel
        </p>
        <h1 className="text-3xl font-black text-slate-800" style={{ letterSpacing: '-0.02em' }}>
          Dashboard Overview
        </h1>
      </motion.div>

      {/* ── Error Banner ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-7 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl"
          >
            <XCircleIcon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            <p className="text-sm font-bold">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        {cards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i + 1} loading={loading} />
        ))}
      </div>

      {/* ── Divider ── */}
      <motion.div
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
        className="my-9 border-t border-slate-100"
      />

      {/* ── Summary Strip ── */}
      <motion.div
        variants={fadeUp}
        custom={3}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl px-7 py-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4 max-w-2xl"
      >
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-widest mb-1.5"
            style={{ color: '#94a3b8' }}
          >
            Verification Queue
          </p>
          <p className="text-sm font-bold text-slate-600">
            {loading
              ? 'Loading...'
              : pending === 0
              ? "No pending verifications — you're all caught up."
              : `${pending} verification${pending > 1 ? 's' : ''} awaiting your review.`}
          </p>
        </div>

        {!loading && pending > 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full"
            style={{ backgroundColor: '#191970', color: '#fff' }}
          >
            Action Required
          </motion.span>
        )}

        {!loading && pending === 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="shrink-0 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full"
            style={{ backgroundColor: '#10b98115', color: '#10b981' }}
          >
            All Clear
          </motion.span>
        )}
      </motion.div>

    </div>
  );
};

export default Dashboard;