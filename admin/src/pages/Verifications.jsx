import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import verificationService from '../services/verification.service';
import { formatDate } from '../utils/dateFormatter';

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: 'easeOut' },
  }),
};

const modalOverlay = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

const modalPanel = {
  hidden:  { opacity: 0, scale: 0.97, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.97, y: 12,
    transition: { duration: 0.18 } },
};

const sectionVariant = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, delay: 0.08 + i * 0.07, ease: 'easeOut' },
  }),
};

// ─── Custom scrollbar ─────────────────────────────────────────────────────────
const scrollbarStyle = `
  .custom-scroll::-webkit-scrollbar { width: 5px; }
  .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(25,25,112,0.18);
    border-radius: 99px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(25,25,112,0.32);
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────
const InfoField = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>
      {label}
    </p>
    <p className="text-sm font-bold text-slate-800">{value || 'N/A'}</p>
  </div>
);

const DocImage = ({ label, url, index }) => (
  <motion.div
    variants={sectionVariant}
    custom={index}
    initial="hidden"
    animate="visible"
  >
    <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
      {label}
    </p>
    <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50" style={{ maxHeight: 180 }}>
      <img src={url} alt={label} className="w-full h-full object-cover" style={{ maxHeight: 180 }} />
    </div>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Verifications = () => {
  const [requests, setRequests]           = useState([]);
  const [selected, setSelected]           = useState(null);
  const [reason, setReason]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]                 = useState(null);

  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = scrollbarStyle;
    document.head.appendChild(tag);
    loadRequests();
    return () => document.head.removeChild(tag);
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      setError(null);
      const res = await verificationService.getPendingRequests();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load verification requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'reject' && !reason.trim()) {
      setError('Please provide a rejection reason before rejecting.');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      if (action === 'approve') {
        await verificationService.approveRequest(id);
      } else {
        await verificationService.rejectRequest(id, reason);
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setSelected(null);
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4"
        style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-[#191970]"
        />
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
          Loading requests
        </p>
      </div>
    );
  }

  // ── Error (empty) ──
  if (error && requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-start gap-4 p-7 bg-white rounded-3xl border border-red-100 shadow-sm"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <ExclamationCircleIcon className="w-6 h-6 text-red-400" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">Failed to load</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl text-white transition-colors"
          style={{ backgroundColor: '#191970' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f0f4d')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#191970')}
        >
          <ArrowPathIcon className="w-4 h-4" strokeWidth={2} /> Retry
        </button>
      </motion.div>
    );
  }

  // ── Empty ──
  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-32 gap-3 bg-white rounded-3xl border border-slate-100"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#191970]/5 flex items-center justify-center mb-2">
          <CheckCircleIcon className="w-8 h-8" style={{ color: '#191970', opacity: 0.3 }} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#191970' }}>All caught up</p>
        <p className="text-xs text-slate-400 font-medium">No pending verifications to review.</p>
      </motion.div>
    );
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mb-8"
      >
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#191970' }}>
          Admin Panel
        </p>
        <h1 className="text-3xl font-black text-slate-800" style={{ letterSpacing: '-0.02em' }}>
          Verifications
        </h1>
      </motion.div>

      {/* ── Inline Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="inline-error"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
            className="flex items-center gap-3 mb-6 px-5 py-3.5 rounded-2xl border border-red-100 bg-red-50"
          >
            <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" strokeWidth={2} />
            <p className="text-sm font-bold text-red-600 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-red-500 transition-colors">
              <XMarkIcon className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        {/* Card Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#191970' }}>
              Identity Verifications
            </p>
            <p className="text-sm text-slate-400 font-medium">{requests.length} pending review</p>
          </div>
          <span
            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full"
            style={{ backgroundColor: '#191970', color: '#fff' }}
          >
            {requests.length} Pending
          </span>
        </div>

        {/* Table */}
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {['User', 'Legal Name', 'Action'].map((h, i) => (
                <th
                  key={h}
                  className={`px-7 py-3.5 text-[10px] font-black uppercase tracking-widest ${i === 2 ? 'text-right' : ''}`}
                  style={{ color: '#94a3b8' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((req, i) => (
              <motion.tr
                key={req._id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="border-b border-slate-50 last:border-0 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* User */}
                <td className="px-7 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ backgroundColor: 'rgba(25,25,112,0.08)', color: '#191970' }}
                    >
                      {req.user?.username?.[0]?.toUpperCase() || <UserCircleIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{req.user?.username}</p>
                      <p className="text-xs text-slate-400 font-medium">{req.user?.email}</p>
                    </div>
                  </div>
                </td>

                {/* Legal Name */}
                <td className="px-7 py-4">
                  <p className="text-sm font-bold text-slate-600">{req.fullName}</p>
                </td>

                {/* Action */}
                <td className="px-7 py-4 text-right">
                  <button
                    onClick={() => { setSelected(req); setError(null); }}
                    className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-colors"
                    style={{ backgroundColor: 'rgba(25,25,112,0.07)', color: '#191970' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(25,25,112,0.14)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(25,25,112,0.07)')}
                  >
                    Review
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* ══ REVIEW MODAL ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="modal-backdrop"
            variants={modalOverlay}
            initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.60)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          >
            <motion.div
              key="modal-panel"
              variants={modalPanel}
              initial="hidden" animate="visible" exit="exit"
              className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 flex flex-col"
              style={{ maxHeight: '90vh', boxShadow: '0 32px 80px rgba(25,25,112,0.15)' }}
            >
              {/* Modal Header */}
              <div className="px-8 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#191970' }}>
                    Identity Review
                  </p>
                  <h2 className="text-2xl font-black text-slate-800" style={{ letterSpacing: '-0.02em' }}>
                    {selected.fullName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors mt-1 flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto custom-scroll flex-1 px-8 py-7 space-y-6">

                {/* Info Fields */}
                <motion.div
                  variants={sectionVariant} custom={0} initial="hidden" animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl border border-slate-100"
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <InfoField label="Full Name"     value={selected.fullName} />
                  <InfoField label="CNIC Number"   value={selected.cnicNumber || selected.cnic} />
                  <InfoField label="Date of Birth" value={formatDate(selected.dateOfBirth || selected.dob)} />
                </motion.div>

                {/* Document Images */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DocImage label="Selfie"     url={selected.selfie?.url}    index={1} />
                  <DocImage label="CNIC Front" url={selected.cnicFront?.url} index={2} />
                  <DocImage label="CNIC Back"  url={selected.cnicBack?.url}  index={3} />
                </div>

                {/* Action Area */}
                <motion.div
                  variants={sectionVariant} custom={3} initial="hidden" animate="visible"
                  className="p-5 rounded-2xl border border-slate-100 space-y-4"
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                      Rejection Reason
                    </label>
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Required only if rejecting..."
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '0.875rem',
                        outline: 'none',
                        fontSize: '0.9rem',
                        fontFamily: 'DM Sans, sans-serif',
                        color: '#0f172a',
                        backgroundColor: '#fff',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#191970';
                        e.target.style.boxShadow = '0 0 0 3px rgba(25,25,112,0.08)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(selected._id, 'reject')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 border"
                      style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                      onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                    >
                      <XCircleIcon className="w-4 h-4" strokeWidth={2} />
                      {actionLoading ? 'Processing…' : 'Reject'}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(selected._id, 'approve')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#191970', color: '#fff' }}
                      onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.backgroundColor = '#0f0f4d'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#191970'; }}
                    >
                      <CheckCircleIcon className="w-4 h-4" strokeWidth={2} />
                      {actionLoading ? 'Processing…' : 'Approve'}
                    </motion.button>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Verifications;