import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../../services/user.service'; 

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ─── Constants ───────────────────────────────────────────────────────────────
const THEME = '#191970';
const PAYMENT_OPTIONS = [
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
];

// ─── Reusable Field Label ────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-2">
    {children}
  </label>
);

// ─── Custom Animated Dropdown ────────────────────────────────────────────────
function CustomSelect({ name, value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        whileTap={{ scale: 0.995 }}
        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border text-sm transition-all outline-none text-left ${
          value
            ? `border-[${THEME}]/35 bg-[${THEME}]/5 text-[${THEME}] font-bold`
            : 'border-gray-200 bg-[#FAFAFA] text-gray-700 font-bold'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : `cursor-pointer hover:border-[${THEME}]/30`}`}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={value ? THEME : '#9CA3AF'} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'top', zIndex: 9999 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
          >
            {options.map((opt, i) => (
              <motion.button
                key={opt.value}
                type="button"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-3 ${
                  value === opt.value
                    ? `bg-[${THEME}] text-white`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AnimatePresence>
                  {value === opt.value && (
                    <motion.svg
                      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  )}
                </AnimatePresence>
                <span className={value === opt.value ? '' : 'ml-[21px]'}>{opt.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  
  // Grab the logged-in user's data from Redux
  const { userData: user } = useSelector((state) => state.auth);

  // Verification UI State
  const [isSending, setIsSending] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState({ type: '', text: '' });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [editingMethodId, setEditingMethodId] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    title: '',
    type: 'easypaisa',
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    instructions: ''
  });

  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const res = await userService.getMyPaymentMethods();
      setPaymentMethods(res.paymentMethods || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleSavePaymentMethod = async () => {
    try {
      setIsAddingPayment(true);
      let res;
      if (editingMethodId) {
        res = await userService.updatePaymentMethod(editingMethodId, paymentForm);
      } else {
        res = await userService.addPaymentMethod(paymentForm);
      }
      setPaymentMethods(res.paymentMethods || []);
      resetPaymentForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingPayment(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      title: '',
      type: 'easypaisa',
      accountTitle: '',
      accountNumber: '',
      bankName: '',
      iban: '',
      instructions: ''
    });
    setEditingMethodId(null);
  };

  // Email Verification Handler
  const handleVerifyEmail = async () => {
    setIsSending(true);
    setVerifyMessage({ type: '', text: '' });
    try {
      await userService.sendVerificationEmail();
      setVerifyMessage({ 
        type: 'success', 
        text: 'Verification link sent! Please check your inbox.' 
      });
    } catch (error) {
      setVerifyMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send email. Try again later.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  // 1. Wait for user data to load
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECEFF1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#191970]"></div>
      </div>
    );
  }

  // 2. THE BOUNCER: If they haven't completed their profile, force them to do it
  if (!user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Safely extract location data
  const city = user?.location?.city || '';
  const area = user?.location?.addressText || '';
  const displayLocation = city && area ? `${area}, ${city}` : city || area || 'Location not set';

  // ID verification badge metadata
  const idBadge = (() => {
    const status = user?.identityVerificationStatus;
    switch (status) {
      case 'approved':
        return {
          text: 'ID Verified',
          classes: 'bg-[#00875A]/10 text-[#00875A] border-[#00875A]/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 11.586 7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'pending':
        return {
          text: 'ID Pending',
          classes: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7h2v5H9V7zm0 6h2v2H9v-2z" />
            </svg>
          )
        };
      case 'rejected':
        return {
          text: 'ID Rejected',
          classes: 'bg-red-50 text-red-600 border-red-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2.5-9.5a1 1 0 011.414-1.414L10 8.586l1.086-1.5a1 1 0 011.414 1.414L11.414 10l1.086 1.086a1 1 0 01-1.414 1.414L10 11.414l-1.086 1.086a1 1 0 01-1.414-1.414L8.586 10 7.5 8.914z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          text: 'ID Unverified',
          classes: 'bg-gray-100 text-gray-500 border-gray-200',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M10 2a6 6 0 100 12A6 6 0 0010 2zM2 18a8 8 0 0116 0H2z" />
            </svg>
          )
        };
    }
  })();

  return (
    <motion.div 
      className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 bg-[#ECEFF1] flex justify-center pb-24"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-3xl space-y-8">
        
        {/* Header Section */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
          
          {/* Profile Photo Area */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white bg-gray-50 flex items-center justify-center shadow-md">
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} alt={user.username || 'User'} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-4xl font-black text-gray-400 uppercase">
                  {user?.username?.charAt(0) || '?'}
                </span>
              )}
            </div>
          </div>

          {/* User Basic Info */}
          <div className="flex-1 text-center sm:text-left w-full">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] capitalize tracking-tight mb-2">
              {user?.username || 'Anonymous User'}
            </h1>
            <p className="text-blue-600 font-bold mb-4">{user?.email}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
              {user?.isEmailVerified ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-black uppercase tracking-widest rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                  Email Verified
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Unverified Email
                </div>
              )}

              {/* Identity verification badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${idBadge.classes}`}>
                {idBadge.icon}
                <span>{idBadge.text}</span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-center sm:justify-start">
              <button 
                onClick={() => navigate('/complete-profile')} 
                className="px-4 py-3 rounded-xl bg-blue-600 border border-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
              >
                Edit Details
              </button>
            </div>
          </div>
        </motion.div>

        {/* Detailed Info Section */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-tight">About Me</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Bio</p>
              <p className="text-[#1A1A2E] font-black font-medium leading-relaxed text-sm">
                {user?.bio || "No bio added yet. Tell the community about yourself!"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone</p>
                <p className="text-[#1A1A2E] font-bold text-sm">{user?.phone || "Not provided"}</p>
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Location</p>
                <p className="text-[#1A1A2E] font-bold text-sm capitalize">
                  {displayLocation}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Security & Email Section */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-blue-600 mb-6 uppercase tracking-tight">Account Security</h2>
          
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Registered Email</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[#1A1A2E] font-bold text-sm">{user?.email}</p>
              
              {/* Only show the verify button if they are NOT verified */}
              {!user?.isEmailVerified && (
                <button 
                  onClick={handleVerifyEmail} 
                  disabled={isSending}
                  className="w-full sm:w-auto px-6 py-3 bg-[#191970] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-lg shadow-[#191970]/20 disabled:opacity-50"
                >
                  {isSending ? "Sending..." : "Verify Email"}
                </button>
              )}
            </div>

            {/* Success/Error Feedback Message */}
            <AnimatePresence>
              {verifyMessage.text && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-4 text-xs font-black uppercase tracking-widest ${verifyMessage.type === 'success' ? 'text-[#00875A]' : 'text-red-600'}`}
                >
                  {verifyMessage.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* PAYMENT METHODS */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
            <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tight">
              Payment Methods
            </h2>
          </div>

          {/* Existing Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {paymentMethods.length === 0 ? (
              <div className="col-span-full text-xs font-bold text-gray-400 uppercase tracking-widest">
                No payment methods added yet.
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="border border-gray-100 bg-[#FAFAFA] rounded-[24px] p-6 hover:border-[#191970]/20 hover:bg-[#191970]/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-black text-[#1A1A2E] text-lg mb-1">
                      {method.title}
                    </h3>
                    <p className="text-[10px] font-black text-[#191970] uppercase tracking-widest mb-4">
                      {method.type.replace('_', ' ')}
                    </p>

                    <div className="space-y-2 mb-6">
                      {method.accountTitle && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Title</span>
                          <span className="text-sm font-bold text-[#1A1A2E]">{method.accountTitle}</span>
                        </div>
                      )}
                      {method.accountNumber && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Number</span>
                          <span className="text-sm font-bold text-[#1A1A2E]">{method.accountNumber}</span>
                        </div>
                      )}
                      {method.bankName && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bank Name</span>
                          <span className="text-sm font-bold text-[#1A1A2E]">{method.bankName}</span>
                        </div>
                      )}
                      {method.iban && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">IBAN</span>
                          <span className="text-sm font-bold text-[#1A1A2E]">{method.iban}</span>
                        </div>
                      )}
                      {method.instructions && (
                        <div className="flex flex-col mt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Instructions</span>
                          <span className="text-xs text-[#1A1A2E]/70 font-medium bg-white border border-gray-100 p-3 rounded-xl">{method.instructions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-gray-200/50 pt-4">
                    <button
                      onClick={() => {
                        setEditingMethodId(method._id);
                        setPaymentForm({
                          title: method.title || '',
                          type: method.type || 'easypaisa',
                          accountTitle: method.accountTitle || '',
                          accountNumber: method.accountNumber || '',
                          bankName: method.bankName || '',
                          iban: method.iban || '',
                          instructions: method.instructions || ''
                        });
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await userService.deletePaymentMethod(method._id);
                          setPaymentMethods(res.paymentMethods || []);
                          if (editingMethodId === method._id) resetPaymentForm();
                        } catch (err) { console.error(err); }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to Add/Edit */}
          <div className="border border-gray-100 bg-white rounded-[24px] p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-black text-[#1A1A2E] uppercase tracking-tight mb-6">
              {editingMethodId ? "Update Payment Method" : "Add New Method"}
            </h3>

            <div className="space-y-5">
              <div>
                <FieldLabel>Display Title</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. My Easypaisa"
                  value={paymentForm.title}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl bg-[#FAFAFA] border border-gray-200 p-4 text-sm font-bold text-gray-700 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/20 outline-none transition-all"
                />
              </div>

              <div>
                <FieldLabel>Payment Type</FieldLabel>
                <CustomSelect
                  name="type"
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, type: e.target.value }))}
                  options={PAYMENT_OPTIONS}
                  placeholder="Select a type"
                />
              </div>

              {paymentForm.type !== "cash" && (
                <>
                  <div>
                    <FieldLabel>Account Title</FieldLabel>
                    <input
                      type="text"
                      placeholder="Account holder name"
                      value={paymentForm.accountTitle}
                      onChange={(e) => setPaymentForm((prev) => ({ ...prev, accountTitle: e.target.value }))}
                      className="w-full rounded-xl bg-[#FAFAFA] border border-gray-200 p-4 text-sm font-bold text-gray-700 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/20 outline-none transition-all"
                    />
                  </div>

                  {(paymentForm.type === "easypaisa" || paymentForm.type === "jazzcash") && (
                    <div>
                      <FieldLabel>Mobile Number</FieldLabel>
                      <input
                        type="text"
                        placeholder="03XXXXXXXXX"
                        value={paymentForm.accountNumber}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full rounded-xl bg-[#FAFAFA] border border-gray-200 p-4 text-sm font-bold text-gray-700 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/20 outline-none transition-all"
                      />
                    </div>
                  )}

                  {paymentForm.type === "bank" && (
                    <>
                      <div>
                        <FieldLabel>Bank Name</FieldLabel>
                        <input
                          type="text"
                          placeholder="e.g. HBL"
                          value={paymentForm.bankName}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full rounded-xl bg-[#FAFAFA] border border-gray-200 p-4 text-sm font-bold text-gray-700 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/20 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <FieldLabel>IBAN</FieldLabel>
                        <input
                          type="text"
                          placeholder="PK00HABB0000000000000000"
                          value={paymentForm.iban}
                          onChange={(e) => setPaymentForm((prev) => ({ ...prev, iban: e.target.value }))}
                          className="w-full rounded-xl bg-[#FAFAFA] border border-gray-200 p-4 text-sm font-bold text-gray-700 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/20 outline-none transition-all"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <FieldLabel>Instructions</FieldLabel>
                <textarea
                  rows={3}
                  value={paymentForm.instructions}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Optional instructions..."
                  className="w-full rounded-xl bg-[#FAFAFA] border border-gray-200 p-4 text-sm font-bold text-gray-700 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {editingMethodId && (
                  <button
                    type="button"
                    onClick={resetPaymentForm}
                    className="w-full sm:w-1/3 py-4 rounded-[16px] bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSavePaymentMethod}
                  disabled={isAddingPayment}
                  className={`w-full py-4 rounded-[16px] bg-[#191970] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[#191970]/20 hover:bg-blue-900 transition-all disabled:opacity-50 ${editingMethodId ? 'sm:w-2/3' : ''}`}
                >
                  {isAddingPayment ? "Saving..." : editingMethodId ? "Update Method" : "Add Payment Method"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}