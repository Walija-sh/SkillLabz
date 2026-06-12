import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toolService from '../../services/tool.service';
import rentalService from '../../services/rental.service';
import MonthlyEarningsChart from '../../components/dashboard/MonthlyEarningsChart';
import WeeklyRentalsChart from '../../components/dashboard/WeeklyRentalsChart';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const NAVY   = '#191970';
const ORANGE = '#f06424';
const BG     = '#ECEFF1';

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.42, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const tabContent = {
  hidden:  { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -12, transition: { duration: 0.18 } },
};

const modalOverlay = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

const modalPanel = {
  hidden:  { opacity: 0, scale: 0.94, y: 18 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.94, y: 18, transition: { duration: 0.18 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const RentalStatusBadge = ({ status }) => {
  const map = {
    active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    approved:  'bg-[#191970]/10 text-[#191970] border-[#191970]/20',
    pending:   'bg-amber-100 text-amber-700 border-amber-200',
    requested: 'bg-amber-100 text-amber-700 border-amber-200',
    rejected:  'bg-red-100 text-red-600 border-red-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200',
    completed: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
    status === 'paid'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-amber-100 text-amber-700 border-amber-200'
  }`}>
    {status === 'paid' ? '✓ Paid' : 'Unpaid'}
  </span>
);

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,20,60,0.55)' }}
          variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            variants={modalPanel} initial="hidden" animate="visible" exit="exit"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: NAVY }}>{title}</h3>
                {subtitle && <p className="text-gray-500 text-sm font-medium mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [items,   setItems]   = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tools');

  const [otpByRentalId, setOtpByRentalId] = useState({});
  const [otpLoading,    setOtpLoading]    = useState({});

  const [cancelModal,     setCancelModal]     = useState({ open: false, rental: null });
  const [cancelReason,    setCancelReason]    = useState('');
  const [cancelSubmitting,setCancelSubmitting]= useState(false);
  const [cancelError,     setCancelError]     = useState(null);

  const [approveModal,    setApproveModal]    = useState({ open: false, rentalId: null });
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [approveError,    setApproveError]    = useState('');
  const [approveSubmitting,setApproveSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete,    setItemToDelete]    = useState(null);
  const [isDeleting,      setIsDeleting]      = useState(false);
  const [deleteError,     setDeleteError]     = useState(null);

  const isRequestStatus = (s) => ['pending', 'requested'].includes(s);

  // --- Auto-Reload (Polling) Logic ---
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const [ir, rr] = await Promise.all([toolService.getMyTools(), rentalService.getOwnerRentals()]);
        if (isMounted) {
          setItems(ir.items || []);
          setRentals(rr.rentals || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    };

    fetchDashboardData();

    // Poll for updates every 15 seconds silently
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ── Tool actions ──
  const handleToggleAvailability = async (toolId) => {
    try {
      await toolService.toggleAvailability(toolId);
      setItems((prev) => prev.map((i) => i._id === toolId ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch (err) { alert(err.message || 'Error updating tool status'); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true); setDeleteError(null);
    try {
      await toolService.deleteTool(itemToDelete);
      setItems((prev) => prev.filter((i) => i._id !== itemToDelete));
      setDeleteModalOpen(false); setItemToDelete(null);
    } catch (err) { setDeleteError(err.message || 'Failed to delete tool.'); }
    finally { setIsDeleting(false); }
  };

  // ── Rental actions ──
  const handleRentalAction = async (actionType, rentalId) => {
    try {
      let u;
      if (actionType === 'approve')  u = await rentalService.approveRental(rentalId, additionalTerms);
      if (actionType === 'reject')   u = await rentalService.rejectRental(rentalId);
      if (actionType === 'start')    u = await rentalService.startRental(rentalId);
      if (actionType === 'complete') u = await rentalService.completeRental(rentalId);
      setRentals((prev) => prev.map((r) => r._id === rentalId ? { ...r, rentalStatus: u.rental.rentalStatus } : r));
    } catch (err) {
      alert(err.message || `Failed to ${actionType} rental.`);
      throw err;
    }
  };

  const openApproveModal = (rentalId) => {
    setApproveModal({ open: true, rentalId });
    setAdditionalTerms(''); setApproveError(''); setApproveSubmitting(false);
  };

  const submitApprove = async () => {
    if (!approveModal.rentalId) return;
    if (additionalTerms.trim().length > 500) { setApproveError('Max 500 characters.'); return; }
    setApproveSubmitting(true); setApproveError('');
    try {
      await handleRentalAction('approve', approveModal.rentalId);
      setApproveModal({ open: false, rentalId: null }); setAdditionalTerms('');
    } catch { setApproveError('Approval failed.'); }
    finally { setApproveSubmitting(false); }
  };

  const handleGenerateOtp = async (type, rentalId) => {
    setOtpLoading((p) => ({ ...p, [rentalId]: true }));
    try {
      const data = type === 'handover'
        ? await rentalService.generateHandoverOtp(rentalId)
        : await rentalService.generateReturnOtp(rentalId);
      setOtpByRentalId((p) => ({ ...p, [rentalId]: { otp: data.otp, expiresAt: data.expiresAt, type } }));
    } catch (err) { alert(err?.message || 'Failed to generate OTP.'); }
    finally { setOtpLoading((p) => ({ ...p, [rentalId]: false })); }
  };

  const canCancelRental = (s) => ['pending', 'requested', 'approved', 'active'].includes(s);

  const openCancelModal  = (rental) => { setCancelModal({ open: true, rental }); setCancelReason(''); setCancelSubmitting(false); setCancelError(null); };
  const closeCancelModal = () => { setCancelModal({ open: false, rental: null }); setCancelReason(''); setCancelSubmitting(false); setCancelError(null); };

  const submitCancellation = async () => {
    const rental = cancelModal.rental;
    if (!rental?._id) return;
    if (!cancelReason.trim()) { setCancelError('Cancellation reason is required.'); return; }
    setCancelSubmitting(true); setCancelError(null);
    try {
      const u = await rentalService.cancelRental(rental._id, cancelReason.trim());
      setRentals((prev) => prev.map((r) => r._id === rental._id ? { ...r, ...u.rental } : r));
      closeCancelModal();
    } catch (err) { setCancelError(err?.message || 'Failed to cancel rental.'); }
    finally { setCancelSubmitting(false); }
  };

  const handlePaymentStatusUpdate = async (rentalId) => {
    try {
      const res = await rentalService.updateRentalPaymentStatus(rentalId, 'paid');
      setRentals((prev) => prev.map((r) => r._id === rentalId ? { ...r, paymentStatus: res.paymentStatus } : r));
    } catch (err) { alert(err?.message || 'Failed to update payment status.'); }
  };

  // ── Stats ──
  let activeRentalsCount = 0, pendingRequestsCount = 0, totalEarnings = 0;
  rentals.forEach((r) => {
    if (r.rentalStatus === 'active') activeRentalsCount++;
    if (isRequestStatus(r.rentalStatus)) pendingRequestsCount++;
    if (r.rentalStatus === 'completed') {
      const days = Math.max(1, Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / 86400000));
      totalEarnings += days * r.pricePerDay;
    }
  });

  const pendingRequests      = rentals.filter((r) => isRequestStatus(r.rentalStatus));
  const activeAndPastRentals = rentals.filter((r) => !isRequestStatus(r.rentalStatus));

  const stats = [
    { label: 'Inventory',    value: items.length,         color: NAVY },
    { label: 'Active Rent',  value: activeRentalsCount,   color: NAVY },
    { label: 'Earnings',     value: `Rs. ${totalEarnings}`,color: NAVY},
    { label: 'Pending',      value: pendingRequestsCount,  color: NAVY},
  ];

  const tabs = [
    { key: 'tools',    label: 'Tools' },
    { key: 'requests', label: `Requests (${pendingRequests.length})` },
    { key: 'rentals',  label: 'Rentals' },
  ];

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-gray-200"
          style={{ borderTopColor: NAVY }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ── */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4"
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight" style={{ color: NAVY }}>
              Dash<span className="text-black">board</span>
            </h1>
            <p className="text-gray-900 font-medium text-sm mt-1 tracking-wide">
              Tracking {user?.username}'s growth
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/list-tool')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg transition-colors"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#141660'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NAVY}
          >
            List New Tool
          </motion.button>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
              whileHover={{ y: -3, boxShadow: '0 10px 32px rgba(25,25,112,0.10)' }}
              className="bg-white border border-gray-200 rounded-3xl p-5 transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-black text-gray-900 uppercase tracking-widest">{stat.label}</p>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Charts ── */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-10"
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
        >
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <MonthlyEarningsChart rentals={rentals} />
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <WeeklyRentalsChart rentals={rentals} />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          className="flex gap-2 mb-6"
          variants={fadeUp} initial="hidden" animate="visible" custom={6}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200"
              style={activeTab === tab.key
                ? { backgroundColor: NAVY, color: '#fff', boxShadow: `0 4px 14px ${NAVY}33` }
                : { backgroundColor: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb' }
              }
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ── Tab Content ── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContent} initial="hidden" animate="visible" exit="exit"
            >

              {/* ══ TOOLS TAB ══════════════════════════════════════════════════ */}
              {activeTab === 'tools' && (
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <EmptyState message="No tools listed yet." />
                  ) : (
                    items.map((item, i) => (
                      <motion.div
                        key={item._id}
                        variants={fadeUp} initial="hidden" animate="visible" custom={i}
                        whileHover={{ x: 3 }}
                        className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:border-gray-200 transition-all gap-4"
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                            <img src={item.images[0]?.url || 'https://via.placeholder.com/150'} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-black text-base uppercase tracking-tight" style={{ color: NAVY }}>{item.title}</h3>
                            <p className="text-sm font-bold mt-0.5" style={{ color: NAVY }}>Rs. {item.pricePerDay}/day</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {/* Availability toggle */}
                          <button
                            onClick={() => handleToggleAvailability(item._id)}
                            className="relative w-12 h-7 rounded-full transition-all duration-300 focus:outline-none"
                            style={{ backgroundColor: item.isAvailable ? NAVY : '#d1d5db' }}
                          >
                            <motion.div
                              animate={{ x: item.isAvailable ? 22 : 2 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                            >
                              {item.isAvailable && (
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-3 h-3" style={{ color: NAVY }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              )}
                            </motion.div>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/edit-tool/${item._id}`)}
                            className="font-black text-sm p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                          >
                            Edit Tool
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => { setItemToDelete(item._id); setDeleteModalOpen(true); }}
                            className="font-black text-sm p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* ══ REQUESTS TAB ═══════════════════════════════════════════════ */}
              {activeTab === 'requests' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pendingRequests.length === 0 ? (
                    <div className="col-span-full"><EmptyState message="No pending requests." /></div>
                  ) : (
                    pendingRequests.map((req, i) => (
                      <motion.div
                        key={req._id}
                        variants={fadeUp} initial="hidden" animate="visible" custom={i}
                        className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 flex flex-col justify-between"
                      >
                        {/* Top: item + renter */}
                        <div className="flex gap-4 mb-5">
                          <img
                            src={req.item?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover bg-gray-200 shrink-0 border border-gray-200"
                          />
                          <div>
                            <h3 className="font-black uppercase tracking-tight text-lg" style={{ color: NAVY }}>
                              {req.item?._id ? (
                                <Link to={`/items/${req.item._id}`}>{req.item?.title}</Link>
                              ) : req.item?.title}
                            </h3>
                            <p className="text-l font-bold text-gray-400 mt-1">
                              by{' '}
                              {req.renter?._id ? (
                                <Link to={`/users/${req.renter._id}`} className="font-black" style={{ color: NAVY }}>{req.renter?.username}</Link>
                              ) : <span className="text-gray-400">Deleted user</span>}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 mb-5">
                          {/* Period */}
                          <div className="bg-white rounded-2xl p-4 border border-gray-100">
                            <p className="text-[14px] font-black uppercase tracking-widest text-gray-900 mb-2">Rental Period</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-gray-700">{fmt(req.startDate)}</span>
                              <span className="text-gray-300 text-xs">→</span>
                              <span className="font-bold text-gray-700">{fmt(req.endDate)}</span>
                            </div>
                            <p className="mt-1.5 text-xs font-black" style={{ color: NAVY }}>
                              {req.rentalDays} day{req.rentalDays > 1 ? 's' : ''}
                            </p>
                          </div>

                          {/* Pricing */}
                          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
                            <p className="text-[14px] font-black uppercase tracking-widest text-gray-900">Payment Breakdown</p>
                            <PriceRow label="Rental Price" value={`Rs. ${req.pricePerDay}/day`} />
                            <PriceRow label="Deposit" value={`Rs. ${req.depositAmount}`} />
                            {req.includesSkillSession && (
                              <PriceRow label="Skill Session" value={`+ Rs. ${req.skillSessionPrice}`} valueColor="#9333ea" />
                            )}
                            <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                              <span className="text-[14px] font-black uppercase tracking-widest text-gray-900">Total</span>
                              <span className="text-lg font-black text-blue-600">Rs. {req.totalPrice}</span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex gap-2 flex-wrap">
                            {req.includesSkillSession ? (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[12px] font-black uppercase tracking-widest border border-blue-200">
                                Includes Skill Session
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[12px] font-black uppercase tracking-widest border border-blue-200">
                                Rental Only
                              </span>
                            )}
                          </div>

                          {/* Renter note */}
                          {req.renterNote?.trim() && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                              <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-1">Renter Note</p>
                              <p className="text-sm text-amber-900">{req.renterNote}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => openApproveModal(req._id)}
                            className="flex-1 py-2.5 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                            style={{ backgroundColor: NAVY }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#141660'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NAVY}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRentalAction('reject', req._id)}
                            className="flex-1 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openCancelModal(req)}
                            className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* ══ RENTALS TAB ════════════════════════════════════════════════ */}
              {activeTab === 'rentals' && (
                <div className="space-y-3">
                  {activeAndPastRentals.length === 0 ? (
                    <EmptyState message="No rental history." />
                  ) : (
                    activeAndPastRentals.map((rental, i) => (
                      <motion.div
                        key={rental._id}
                        variants={fadeUp} initial="hidden" animate="visible" custom={i}
                        whileHover={{ x: 3 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:border-gray-200 transition-all gap-4"
                      >
                        {/* Left: image + info */}
                        <div className="flex items-center gap-4">
                          <img
                            src={rental.item?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                            alt=""
                            className="w-15 h-15 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-200"
                          />
                          <div>
                            <h3 className="font-black text-sm uppercase tracking-tight" style={{ color: NAVY }}>
                              {rental.item?._id ? (
                                <Link to={`/items/${rental.item._id}`} className="hover:opacity-70 transition-opacity">{rental.item?.title}</Link>
                              ) : rental.item?.title}
                            </h3>
                            <p className="text-xs text-gray-900 font-bold mt-0.5">
                              {fmt(rental.startDate)} → {fmt(rental.endDate)} · <span className="text-gray-900">Rs. {rental.totalPrice}</span>
                            </p>
                            <p className="text-xs text-gray-900 mt-0.5">
                              Renter:{' '}
                              {rental.renter?._id ? (
                                <Link to={`/users/${rental.renter._id}`} className="font-black" style={{ color: NAVY }}>
                                  {rental.renter.username || rental.renter.fullName || 'View profile'}
                                </Link>
                              ) : 'Deleted user'}
                            </p>
                          </div>
                        </div>

                        {/* Right: badges + actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <RentalStatusBadge status={rental.rentalStatus} />
                          <PaymentBadge status={rental.paymentStatus || 'pending'} />

                          {/* Handover OTP */}
                          {rental.rentalStatus === 'approved' && (
                            <>
                              <button
                                onClick={() => handleGenerateOtp('handover', rental._id)}
                                disabled={!!otpLoading[rental._id]}
                                className="px-3 py-2 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-60"
                                style={{ backgroundColor: NAVY }}
                              >
                                {otpLoading[rental._id] ? 'Generating…' : 'Handover OTP'}
                              </button>
                              {otpByRentalId[rental._id]?.type === 'handover' && (
                                <OtpPill otp={otpByRentalId[rental._id].otp} />
                              )}
                            </>
                          )}

                          {/* Return OTP */}
                          {rental.rentalStatus === 'active' && (
                            <>
                              <button
                                onClick={() => handleGenerateOtp('return', rental._id)}
                                disabled={!!otpLoading[rental._id]}
                                className="px-3 py-2 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-60"
                                style={{ backgroundColor: '#191970' }}
                              >
                                {otpLoading[rental._id] ? 'Generating…' : 'Return OTP'}
                              </button>
                              {otpByRentalId[rental._id]?.type === 'return' && (
                                <OtpPill otp={otpByRentalId[rental._id].otp} />
                              )}
                            </>
                          )}

                          {/* Mark as paid */}
                          {['approved', 'active'].includes(rental.rentalStatus) && rental.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => handlePaymentStatusUpdate(rental._id)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}

                          <Link
                            to={`/rentals/${rental._id}`}
                            className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                          >
                            Details
                          </Link>
                          
                          {/* Cancel */}
                          {canCancelRental(rental.rentalStatus) && (
                            <button
                              onClick={() => openCancelModal(rental)}
                              className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                            >
                              Cancel
                            </button>
                          )}

                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══ DELETE MODAL ══════════════════════════════════════════════════════ */}
      <Modal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteError(null); }}
        title="Delete Tool?"
        subtitle="This is permanent. Your listing will be gone."
      >
        {deleteError && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl mb-5 text-xs font-bold text-center">
            {deleteError}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Delete Permanently'}
          </button>
          <button
            onClick={() => { setDeleteModalOpen(false); setDeleteError(null); }}
            disabled={isDeleting}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
          >
            Keep It
          </button>
        </div>
      </Modal>

      {/* ══ CANCEL MODAL ══════════════════════════════════════════════════════ */}
      <Modal
        open={cancelModal.open}
        onClose={closeCancelModal}
        title="Cancel Rental?"
        subtitle="This action requires a reason and will be logged for trust and dispute tracking."
      >
        {cancelError && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl mb-5 text-xs font-bold">{cancelError}</div>
        )}
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          rows={4}
          placeholder="Enter cancellation reason…"
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-red-400 outline-none font-medium text-sm resize-none transition-colors mb-5"
        />
        <div className="flex flex-col gap-3">
          <button
            onClick={submitCancellation}
            disabled={cancelSubmitting}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-60"
          >
            {cancelSubmitting ? 'Cancelling…' : 'Confirm Cancellation'}
          </button>
          <button
            onClick={closeCancelModal}
            disabled={cancelSubmitting}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
          >
            Keep Rental
          </button>
        </div>
      </Modal>

      {/* ══ APPROVE MODAL ═════════════════════════════════════════════════════ */}
      <Modal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, rentalId: null })}
        title="Approve & Generate Contract"
        subtitle="Optional additional terms (max 500 chars). SkillLabz baseline terms always included."
      >
        {approveError && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-2xl mb-4 text-xs font-bold">{approveError}</div>
        )}
        <textarea
          value={additionalTerms}
          onChange={(e) => setAdditionalTerms(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Usage instructions, care guidelines, return expectations…"
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-[#191970] outline-none font-medium text-sm resize-none transition-colors mb-1"
        />
        <p className="text-[10px] font-bold text-gray-400 text-right mb-5">{additionalTerms.length}/500</p>
        <div className="flex gap-3">
          <button
            onClick={submitApprove}
            disabled={approveSubmitting}
            className="flex-1 py-3 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-60"
            style={{ backgroundColor: NAVY }}
          >
            {approveSubmitting ? 'Approving…' : 'Approve Rental'}
          </button>
          <button
            onClick={() => setApproveModal({ open: false, rentalId: null })}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#191970]/5 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-[#191970]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m0 0l8 4m0 0v10" />
        </svg>
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{message}</p>
    </div>
  );
}

function PriceRow({ label, value, valueColor }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="font-black" style={{ color: valueColor || '#111827' }}>{value}</span>
    </div>
  );
}

function OtpPill({ otp }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 py-2 bg-[#191970]/5 border border-[#191970]/20 rounded-xl text-xs font-black tracking-[0.2em] text-[#191970]"
    >
      {otp}
    </motion.div>
  );
}