import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import rentalService from '../../services/rental.service';
import reviewService from "../../services/review.service";
import Stars from "../../components/reviews/Stars";
import ContractView from "../../components/rentals/ContractView";
import { useSelector } from "react-redux";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalPanel = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.2 } },
};

const tabContentVariant = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const getStatusBadge = (status) => {
  const base = "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest";
  switch (status) {
    case 'active':     return <span className={`${base} bg-emerald-100 text-emerald-700 border border-emerald-200`}>Active</span>;
    case 'approved':   return <span className={`${base} bg-[#1B2A6B]/10 text-[#1B2A6B] border border-[#1B2A6B]/20`}>Approved</span>;
    case 'pending':
    case 'requested':  return <span className={`${base} bg-amber-100 text-amber-700 border border-amber-200`}>Pending</span>;
    case 'completed':  return <span className={`${base} bg-gray-100 text-gray-500 border border-gray-200`}>Completed</span>;
    case 'rejected':
    case 'cancelled':  return <span className={`${base} bg-red-100 text-red-600 border border-red-200`}>{status}</span>;
    default:           return <span className={`${base} bg-gray-100 text-gray-600 border border-gray-200`}>{status}</span>;
  }
};

const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children, accentColor = "navy" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(17,24,58,0.55)" }}
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#1B2A6B] uppercase tracking-tight">{title}</h3>
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

// ─── Alert ────────────────────────────────────────────────────────────────────
function Alert({ type, text }) {
  if (!text) return null;
  const styles = type === "success"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-red-50 text-red-600 border-red-200";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-5 p-4 rounded-2xl border text-sm font-bold ${styles}`}
    >
      {text}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyRentals() {
  const userId = useSelector((state) => state.auth.userData?.id);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewModal, setReviewModal] = useState({ open: false, rental: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: "", text: "" });

  const [otpModal, setOtpModal] = useState({ open: false, rental: null, type: null });
  const [otpValue, setOtpValue] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpMessage, setOtpMessage] = useState({ type: "", text: "" });

  const [cancelModal, setCancelModal] = useState({ open: false, rental: null });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelMessage, setCancelMessage] = useState({ type: "", text: "" });

  const [contractModal, setContractModal] = useState({ open: false, rental: null });
  const [contractSubmitting, setContractSubmitting] = useState(false);
  const [contractError, setContractError] = useState("");

  const [paymentModal, setPaymentModal] = useState({ open: false, rental: null, methods: [], loading: false, error: "" });

  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    (async () => {
      try {
        const response = await rentalService.getMyRentals();
        setRentals(response.rentals);
      } catch (err) {
        setError(err.message || "Failed to load your rentals.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Review ──
  const openReviewModal = (rental) => {
    setReviewMessage({ type: "", text: "" });
    setReviewForm({ rating: 5, comment: "" });
    setReviewModal({ open: true, rental });
  };
  const closeReviewModal = () => { setReviewModal({ open: false, rental: null }); setReviewMessage({ type: "", text: "" }); setIsSubmittingReview(false); };
  const submitReview = async () => {
    const rental = reviewModal.rental;
    if (!rental?._id) return;
    const reviewedUserId = rental.owner._id;
    if (!reviewedUserId) { setReviewMessage({ type: "error", text: "Owner not found for this rental." }); return; }
    setIsSubmittingReview(true);
    setReviewMessage({ type: "", text: "" });
    try {
      await reviewService.createReview({ rentalId: rental._id, reviewedUserId, rating: Number(reviewForm.rating), comment: reviewForm.comment });
      setReviewMessage({ type: "success", text: "Review submitted successfully." });
      setTimeout(() => closeReviewModal(), 700);
    } catch (err) {
      setReviewMessage({ type: "error", text: err?.message || "Failed to submit review." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── OTP ──
  const openOtpModal = (type, rental) => { setOtpModal({ open: true, rental, type }); setOtpValue(""); setOtpSubmitting(false); setOtpMessage({ type: "", text: "" }); };
  const closeOtpModal = () => { setOtpModal({ open: false, rental: null, type: null }); setOtpValue(""); setOtpSubmitting(false); setOtpMessage({ type: "", text: "" }); };
  const submitOtp = async () => {
    const rental = otpModal.rental;
    if (!rental?._id) return;
    if (!otpValue) { setOtpMessage({ type: "error", text: "OTP is required." }); return; }
    setOtpSubmitting(true);
    setOtpMessage({ type: "", text: "" });
    try {
      const updated = otpModal.type === "handover"
        ? await rentalService.verifyHandoverOtp(rental._id, otpValue)
        : await rentalService.verifyReturnOtp(rental._id, otpValue);
      setRentals((prev) => prev.map((r) => (r._id === rental._id ? { ...r, rentalStatus: updated.rental.rentalStatus } : r)));
      setOtpMessage({ type: "success", text: "Verified successfully." });
      setTimeout(() => closeOtpModal(), 700);
    } catch (err) {
      setOtpMessage({ type: "error", text: err?.message || "Failed to verify OTP." });
    } finally {
      setOtpSubmitting(false);
    }
  };

  // ── Cancel ──
  const canCancelRental = (status) => ['pending', 'requested', 'approved', 'active'].includes(status);
  const openCancelModal = (rental) => { setCancelModal({ open: true, rental }); setCancelReason(""); setCancelSubmitting(false); setCancelMessage({ type: "", text: "" }); };
  const closeCancelModal = () => { setCancelModal({ open: false, rental: null }); setCancelReason(""); setCancelSubmitting(false); setCancelMessage({ type: "", text: "" }); };
  const submitCancellation = async () => {
    if (!cancelModal.rental?._id) return;
    if (!cancelReason.trim()) { setCancelMessage({ type: "error", text: "Cancellation reason is required." }); return; }
    setCancelSubmitting(true);
    setCancelMessage({ type: "", text: "" });
    try {
      const updated = await rentalService.cancelRental(cancelModal.rental._id, cancelReason.trim());
      setRentals((prev) => prev.map((r) => (r._id === cancelModal.rental._id ? { ...r, ...updated.rental } : r)));
      setCancelMessage({ type: "success", text: "Rental cancelled successfully." });
      setTimeout(() => closeCancelModal(), 700);
    } catch (err) {
      setCancelMessage({ type: "error", text: err?.message || "Failed to cancel rental." });
    } finally {
      setCancelSubmitting(false);
    }
  };

  // ── Contract ──
  const openContractModal = async (rentalId) => {
    setContractError("");
    setContractSubmitting(false);
    try {
      const response = await rentalService.getRentalById(rentalId);
      setContractModal({ open: true, rental: response.rental });
    } catch (err) {
      setContractError(err?.message || "Failed to load contract.");
    }
  };
  const handleAgreeContract = async () => {
    if (!contractModal.rental?._id) return;
    setContractSubmitting(true);
    setContractError("");
    try {
      const response = await rentalService.agreeContract(contractModal.rental._id);
      setContractModal({ open: true, rental: response.rental });
      setRentals((prev) => prev.map((r) => (r._id === response.rental._id ? { ...r, contract: response.rental.contract } : r)));
    } catch (err) {
      setContractError(err?.message || "Failed to agree to contract.");
    } finally {
      setContractSubmitting(false);
    }
  };

  // ── Payment ──
  const openPaymentModal = async (rental) => {
    setPaymentModal({ open: true, rental, methods: [], loading: true, error: "" });
    try {
      const response = await rentalService.getRentalPaymentInfo(rental._id);
      setPaymentModal((prev) => ({ ...prev, methods: response.paymentMethods, loading: false }));
    } catch (err) {
      setPaymentModal((prev) => ({ ...prev, loading: false, error: err?.message || "Failed to load payment methods." }));
    }
  };
  const closePaymentModal = () => setPaymentModal({ open: false, rental: null, methods: [], loading: false, error: "" });

  // ── Filters & Counts ──
  const filteredRentals = rentals.filter((rental) => {
    if (activeTab === 'pending')   return ['pending', 'requested'].includes(rental.rentalStatus);
    if (activeTab === 'active')    return ['approved', 'active'].includes(rental.rentalStatus);
    if (activeTab === 'completed') return ['completed', 'rejected', 'cancelled'].includes(rental.rentalStatus);
    return true;
  });
  const pendingCount   = rentals.filter((r) => ['pending', 'requested'].includes(r.rentalStatus)).length;
  const activeCount    = rentals.filter((r) => ['approved', 'active'].includes(r.rentalStatus)).length;
  const completedCount = rentals.filter((r) => ['completed', 'rejected', 'cancelled'].includes(r.rentalStatus)).length;

  const contractRenterId = typeof contractModal.rental?.renter === "object" ? contractModal.rental?.renter?._id : contractModal.rental?.renter;
  const isContractRenter = String(contractRenterId) === String(userId);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#ECEFF1" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#1B2A6B]"
        />
      </div>
    );
  }

  // ── Tabs config ──
  const tabs = [
    { key: 'active',    label: 'Active',    count: activeCount },
    { key: 'pending',   label: 'Pending',   count: pendingCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ECEFF1" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Page Header ── */}
        <motion.div
          className="mb-10"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-1">
            My <span className="text-[#191970]">Rentals</span>
          </h1>
          <p className="text-gray-500 font-medium text-sm tracking-wide">
            Track your rental history and active bookings
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible"
            className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 font-bold text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* ── Tabs ── */}
        <motion.div
          className="flex gap-2 mb-8"
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#1B2A6B] text-white shadow-md shadow-[#1B2A6B]/20'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#1B2A6B]/30 hover:text-[#1B2A6B]'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs font-black ${activeTab === tab.key ? 'text-white/70' : 'text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Rental Cards ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="space-y-5"
            variants={tabContentVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {filteredRentals.length === 0 ? (
              <motion.div
                variants={fadeUp} initial="hidden" animate="visible"
                className="text-center py-24 bg-white rounded-3xl border border-gray-200"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1B2A6B]/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#1B2A6B]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8-4m-8-4V7m0 0l8 4m0 0v10" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-[#1B2A6B] uppercase tracking-tight">No {activeTab} rentals</h3>
                <p className="text-gray-400 mt-1 text-sm font-medium">When you request tools, they will appear here.</p>
              </motion.div>
            ) : (
              filteredRentals.map((rental, i) => (
                <motion.div
                  key={rental._id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(27,42,107,0.10)" }}
                  className="bg-white border border-gray-200 rounded-3xl p-6 relative transition-shadow"
                >
                  {/* Status badge */}
                  <div className="absolute top-5 right-5">
                    {getStatusBadge(rental.rentalStatus)}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                      <img
                        src={rental.item?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={rental.item?.title || 'Tool'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:pr-28">
                      {/* Col 1 – Title / Dates */}
                      <div>
                        <h2 className="text-base font-black text-[#1B2A6B] leading-snug mb-0.5">
                          {rental.item?._id ? (
                            <Link to={`/items/${rental.item._id}`}>
                              {rental.item?.title || 'Unknown Tool'}
                            </Link>
                          ) : 'Unknown Tool'}
                        </h2>
                        <p className="text-xs text-gray-00 9font-medium mb-2">
                          {rental.item?.location?.city || 'Location unavailable'}
                        </p>
                        <p className="text-xs text-gray-900 mb-3">
                          Owner:{" "}
                          {rental.owner?._id || rental.owner ? (
                            <Link to={`/users/${rental.owner?._id || rental.owner}`} className="text-[#1B2A6B] font-bold transition-colors">
                              {rental.owner?.username || rental.owner?.fullName || "View profile"}
                            </Link>
                          ) : "Deleted user"}
                        </p>
                        <div>
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Rental Period</p>
                          <p className="text-sm font-bold text-gray-800">
                            {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                          </p>
                        </div>
                      </div>

                      {/* Col 2 – Amount */}
                      <div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-xl font-black text-[#1B2A6B]">Rs. {rental.totalPrice}</p>
                      </div>

                      {/* Col 3 – Payment Status */}
                      <div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Payment Status</p>
                        {rental.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Action Buttons ── */}
                  <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-2">
                    {/* View Details */}
                    <Link
                      to={`/rentals/${rental._id}`}
                      className="inline-flex items-center gap-2 bg-[#191970] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      View Details
                    </Link>

                    {/* View Owner */}
                    {rental.owner && (
                      <Link
                        to={`/users/${rental.owner?._id || rental.owner}`}
                        className="inline-flex items-center gap-2 bg-[#191970] hover:bg-blue-700 text-white border border-blue-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        View Owner
                      </Link>
                    )}

                    {/* Contract + Handover OTP (approved) */}
                    {rental.rentalStatus === "approved" && (
                      <>
                        <button
                          onClick={() => openContractModal(rental._id)}
                          className="inline-flex items-center gap-2 bg-[#191970] hover:bg-blue-700 text-white border border-blue-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          View Contract
                        </button>
                        
                        <div className="relative group inline-block cursor-not-allowed">
                          <button
                            onClick={() => openOtpModal("handover", rental)}
                            disabled={!rental.contract?.agreedAt}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                              rental.contract?.agreedAt
                                ? "bg-[#191970] hover:bg-blue-700 text-white"
                                : "bg-gray-200 text-gray-400 pointer-events-none"
                            }`}
                          >
                            Handover OTP
                          </button>
                          {!rental.contract?.agreedAt && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-[10px] leading-relaxed tracking-wide font-bold px-3 py-2 rounded-lg shadow-lg z-10">
                              Read and agree the contract before getting the product
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Return OTP (active) */}
                    {rental.rentalStatus === "active" && (
                      <button
                        onClick={() => openOtpModal("return", rental)}
                        className="inline-flex items-center gap-2 bg-[#191970] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        Return OTP
                      </button>
                    )}

                    {/* Payment Info */}
                    {["approved", "active"].includes(rental.rentalStatus) && (
                      <button
                        onClick={() => openPaymentModal(rental)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        Payment Info
                      </button>
                    )}

                    {/* Cancel */}
                    {canCancelRental(rental.rentalStatus) && (
                      <button
                        onClick={() => openCancelModal(rental)}
                        className="inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 border border-blue-400 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Completed actions */}
                    {rental.rentalStatus === "completed" && (
                      <>
                        <button
                          onClick={() => openReviewModal(rental)}
                          className="inline-flex items-center gap-2 bg-[#1B2A6B] hover:bg-[#14205a] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                        >
                          Leave Review
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══ REVIEW MODAL ══════════════════════════════════════════════════════ */}
      <Modal
        open={reviewModal.open}
        onClose={closeReviewModal}
        title="Leave a Review"
        subtitle={`For: ${reviewModal.rental?.item?.title || "Rental"}`}
      >
        <Alert {...reviewMessage} />
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Rating</p>
            <div className="flex items-center gap-3">
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))}
                className="w-28 px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-white focus:border-[#1B2A6B] outline-none font-bold text-sm"
              >
                {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v} Stars</option>)}
              </select>
              <Stars value={Number(reviewForm.rating)} />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Comment (optional)</p>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
              rows={4}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:border-[#1B2A6B] focus:bg-white outline-none font-medium text-sm resize-none transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button disabled={isSubmittingReview} onClick={submitReview}
              className="flex-1 py-3 bg-[#1B2A6B] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#14205a] disabled:opacity-50 text-xs transition-colors">
              {isSubmittingReview ? "Submitting…" : "Submit Review"}
            </button>
            <button disabled={isSubmittingReview} onClick={closeReviewModal}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 text-xs transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ OTP MODAL ═════════════════════════════════════════════════════════ */}
      <Modal
        open={otpModal.open}
        onClose={closeOtpModal}
        title={otpModal.type === "handover" ? "Verify Handover OTP" : "Verify Return OTP"}
        subtitle={`Tool: ${otpModal.rental?.item?.title || "Rental"}`}
      >
        <Alert {...otpMessage} />
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Enter OTP</p>
            <input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="• • • •"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[#1B2A6B] focus:bg-white outline-none font-black tracking-[0.3em] text-[#1B2A6B] text-lg text-center transition-colors"
            />
            <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
              Ask the owner for the OTP shown on their dashboard.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button disabled={otpSubmitting} onClick={submitOtp}
              className="flex-1 py-3 bg-[#1B2A6B] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#14205a] disabled:opacity-50 text-xs transition-colors">
              {otpSubmitting ? "Verifying…" : "Verify OTP"}
            </button>
            <button disabled={otpSubmitting} onClick={closeOtpModal}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 text-xs transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ CANCEL MODAL ══════════════════════════════════════════════════════ */}
      <Modal
        open={cancelModal.open}
        onClose={closeCancelModal}
        title="Cancel Rental"
        subtitle={`Tool: ${cancelModal.rental?.item?.title || "Rental"}`}
      >
        <Alert {...cancelMessage} />
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Reason for cancellation</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              placeholder="Why are you cancelling this rental?"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:border-blue-400 focus:bg-white outline-none font-medium text-sm resize-none transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button disabled={cancelSubmitting} onClick={submitCancellation}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blues-700 disabled:opacity-50 text-xs transition-colors">
              {cancelSubmitting ? "Cancelling…" : "Confirm Cancellation"}
            </button>
            <button disabled={cancelSubmitting} onClick={closeCancelModal}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 text-xs transition-colors">
              Keep Rental
            </button>
          </div>
        </div>
      </Modal>

      {/* ══ CONTRACT MODAL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {contractModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(17,24,58,0.55)" }}
            variants={modalOverlay} initial="hidden" animate="visible" exit="exit"
            onClick={(e) => e.target === e.currentTarget && setContractModal({ open: false, rental: null })}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
              variants={modalPanel} initial="hidden" animate="visible" exit="exit"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-black text-[#1B2A6B] uppercase tracking-tight">Rental Contract</h3>
                <button
                  onClick={() => setContractModal({ open: false, rental: null })}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {contractError && <Alert type="error" text={contractError} />}
              <ContractView
                rental={contractModal.rental}
                isRenter={isContractRenter}
                onAgree={handleAgreeContract}
                submitting={contractSubmitting}
                agreementError={contractError}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ PAYMENT MODAL ═════════════════════════════════════════════════════ */}
      <Modal
        open={paymentModal.open}
        onClose={closePaymentModal}
        title="Payment Information"
        subtitle={paymentModal.rental?.item?.title}
      >
        {paymentModal.loading ? (
          <div className="flex items-center justify-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#1B2A6B]"
            />
          </div>
        ) : paymentModal.error ? (
          <Alert type="error" text={paymentModal.error} />
        ) : (
          <div className="space-y-3">
            {paymentModal.methods.map((method, idx) => (
              <motion.div
                key={method._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4"
              >
                <p className="text-xs font-black text-[#1B2A6B] uppercase tracking-widest mb-1">{method.type}</p>
                {method.accountTitle && <p className="text-sm font-bold text-gray-800">{method.accountTitle}</p>}
                {method.accountNumber && <p className="text-sm text-gray-500 font-medium">{method.accountNumber}</p>}
              </motion.div>
            ))}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700 font-bold uppercase tracking-wide">
              Payments are handled directly between renter and owner. SkillLabz does not process payments.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}