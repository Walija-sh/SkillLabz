import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import toolService from '../../services/tool.service';

// ─── Constants ────────────────────────────────────────────────────
const THEME = '#191970';

const CATEGORIES = [
  { value: 'camera',             label: 'Photography & Camera' },
  { value: 'laptop',             label: 'Laptops & Computers'  },
  { value: 'tools',              label: 'Hardware & Tools'      },
  { value: 'musical_instrument', label: 'Musical Instruments'   },
  { value: 'sports',             label: 'Sports Equipment'      },
  { value: 'other',              label: 'Other / Miscellaneous' },
];

const CONDITIONS = [
  { value: 'new',      label: 'Brand New' },
  { value: 'like_new', label: 'Like New'  },
  { value: 'good',     label: 'Good'      },
  { value: 'fair',     label: 'Fair'      },
];

// ─── Shared animation variants ────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Field label ──────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label className="block text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1.5">
    {children}{required && <span className="text-[#191970] ml-0.5">*</span>}
  </label>
);

// ─── Section divider ──────────────────────────────────────────────
const SectionDivider = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${THEME}18` }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-black uppercase tracking-widest text-gray-900">{title}</p>
      {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// ─── Custom animated dropdown ─────────────────────────────────────
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
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all outline-none text-left ${
          value
            ? 'border-[#191970]/35 bg-[#191970]/5 text-[#191970] font-bold'
            : 'border-gray-200 bg-gray-50 text-gray-400 font-medium'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#191970]/30'}`}
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
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-3 ${
                  value === opt.value
                    ? 'bg-[#191970] text-white'
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

// ─── Animated Checkbox ────────────────────────────────────────────
function AnimatedCheckbox({ checked, onChange, label, sublabel, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-full flex items-start gap-3.5 p-4 rounded-xl border transition-all text-left ${
        checked
          ? 'border-[#191970]/30 bg-[#191970]/5'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Box */}
      <div className="relative w-5 h-5 shrink-0 mt-0.5">
        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
          checked ? 'bg-[#191970] border-[#191970]' : 'bg-white border-gray-300'
        }`}>
          <AnimatePresence>
            {checked && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Text */}
      <div>
        <p className={`text-sm font-bold transition-colors ${checked ? 'text-[#191970]' : 'text-gray-700'}`}>
          {label}
        </p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}

// ─── Text input with optional prefix ─────────────────────────────
function TextInput({ prefix, ...props }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-300 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl bg-gray-50 border border-gray-200 py-3 text-sm font-medium text-gray-800 placeholder-gray-300
          focus:bg-white focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/8 outline-none transition-all
          disabled:opacity-60 disabled:cursor-not-allowed
          ${prefix ? 'pl-9 pr-4' : 'px-4'}`}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function ListTool() {
  const navigate = useNavigate();
  const { userData: user } = useSelector(s => s.auth);
  const [useDeposit, setUseDeposit] = useState(false);

  const [formData, setFormData] = useState({
    title: '', category: '', description: '', pricePerDay: '',
    depositAmount: '', condition: '', offerSkillSession: false,
    skillSessionPrice: '', skillSessionDescription: '', images: null,
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [uiState, setUiState] = useState({ isLoading: false, error: null, success: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 3) {
      setUiState(prev => ({ ...prev, error: 'You can only upload a maximum of 3 images.' }));
      e.target.value = null;
      setFormData(prev => ({ ...prev, images: null }));
      setImagePreviews([]);
      return;
    }
    setUiState(prev => ({ ...prev, error: null }));
    setFormData(prev => ({ ...prev, images: files }));
    setImagePreviews(files ? Array.from(files).map(f => URL.createObjectURL(f)) : []);
  };

  useEffect(() => {
    return () => { imagePreviews.forEach(url => URL.revokeObjectURL(url)); };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState({ isLoading: true, error: null, success: null });

    if (!user?.profileCompleted || !user?.location?.coordinates) {
      setUiState({ isLoading: false, error: 'Profile incomplete! Please update your address and location before listing.', success: null });
      return;
    }

    try {
      const price = Number(formData.pricePerDay);
      const deposit = useDeposit ? Number(formData.depositAmount) : 0;
      if (useDeposit && deposit < 0) { setUiState({ isLoading: false, error: 'Enter a valid deposit amount' }); return; }
      if (price < 0) { setUiState({ isLoading: false, error: 'Invalid price per day' }); return; }

      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('category', formData.category);
      fd.append('description', formData.description);
      fd.append('pricePerDay', price);
      fd.append('depositAmount', useDeposit ? Number(formData.depositAmount || 0) : 0);
      fd.append('condition', formData.condition);
      fd.append('offerSkillSession', String(formData.offerSkillSession));
      if (formData.offerSkillSession) {
        fd.append('skillSessionPrice', Number(formData.skillSessionPrice) || 0);
        fd.append('skillSessionDescription', formData.skillSessionDescription);
      }
      if (formData.images) {
        Array.from(formData.images).forEach(file => fd.append('images', file));
      }

      await toolService.createTool(fd);
      setUiState({ isLoading: false, error: null, success: 'Tool listed successfully! Redirecting...' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setUiState({ isLoading: false, error: err?.message || 'Failed to list tool. Please try again.', success: null });
    }
  };

  // ── JSX ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#ECEFF1] px-4 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        {/* Page header */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="mb-8"
        >
          <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">List Your <span className="text-[#191970]"> Tools</span></h1>
          <p className="mt-1 text-sm text-gray-900 font-medium">
            Fill in the details to start earning from your equipment
          </p>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {uiState.error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded-2xl bg-red-50 px-5 py-3.5 text-sm text-red-700 border border-red-100 font-bold flex items-center gap-3"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {uiState.error}
            </motion.div>
          )}
          {uiState.success && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded-2xl bg-green-50 px-5 py-3.5 text-sm text-green-700 border border-green-100 font-bold flex items-center gap-3"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {uiState.success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Card 1: Tool Information ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
          >
            <SectionDivider
              icon={
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={THEME} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              }
              title="Tool Information"
              subtitle="Basic details about your equipment"
            />

            <div className="space-y-5">
              {/* Tool name */}
              <div>
                <FieldLabel required>Tool Name</FieldLabel>
                <TextInput
                  name="title" type="text" placeholder=" Enter tool name"
                  value={formData.title} onChange={handleChange}
                  disabled={uiState.isLoading} required
                />
              </div>

              {/* Category */}
              <div>
                <FieldLabel required>Category</FieldLabel>
                <CustomSelect
                  name="category" value={formData.category}
                  onChange={handleChange} options={CATEGORIES}
                  placeholder="Select a category" disabled={uiState.isLoading}
                />
              </div>

              {/* Description */}
              <div>
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  name="description" rows={4}
                  placeholder="Describe your tool, its condition, and any accessories included..."
                  value={formData.description} onChange={handleChange}
                  disabled={uiState.isLoading} required
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-300
                    focus:bg-white focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/8 outline-none transition-all resize-none
                    disabled:opacity-60"
                />
              </div>

              {/* Condition */}
              <div>
                <FieldLabel required>Condition</FieldLabel>
                <CustomSelect
                  name="condition" value={formData.condition}
                  onChange={handleChange} options={CONDITIONS}
                  placeholder="Select condition" disabled={uiState.isLoading}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Card 2: Pricing ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
          >
            <SectionDivider
              icon={
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={THEME} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              }
              title="Pricing"
              subtitle="Set your daily rate and security deposit"
            />

            <div className="space-y-5">
              {/* Price per day */}
              <div>
                <FieldLabel required>Price / Day</FieldLabel>
                <TextInput
                  prefix="Rs"
                  name="pricePerDay" type="number" placeholder="2500"
                  value={formData.pricePerDay} onChange={handleChange}
                  disabled={uiState.isLoading} required
                />
              </div>

              {/* Security deposit checkbox */}
              <AnimatedCheckbox
                checked={useDeposit}
                onChange={setUseDeposit}
                disabled={uiState.isLoading}
                label="Require security deposit"
                sublabel="Renter pays a refundable deposit before the rental begins"
              />

              {/* Deposit amount — animated reveal */}
              <AnimatePresence>
                {useDeposit && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1">
                      <FieldLabel>Deposit Amount</FieldLabel>
                      <TextInput
                        prefix="Rs"
                        name="depositAmount" type="number" placeholder="5000"
                        value={formData.depositAmount} onChange={handleChange}
                        disabled={uiState.isLoading} min="1" step="1"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Card 3: Photos ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
          >
            <SectionDivider
              icon={
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={THEME} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              }
              title="Photos"
              subtitle="Upload up to 3 clear photos of your equipment"
            />

            <div
              className={`border-2 border-dashed rounded-2xl cursor-pointer relative flex items-center justify-center transition-all
                ${imagePreviews.length > 0
                  ? 'border-[#191970]/25 bg-[#191970]/3 p-4 min-h-[140px]'
                  : 'border-gray-200 hover:border-[#191970]/35 hover:bg-[#191970]/3 p-8 min-h-[160px]'
                }`}
            >
              <input
                type="file" multiple accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                onChange={handleFileChange} disabled={uiState.isLoading} required
              />
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 w-full z-10 pointer-events-none">
                  {imagePreviews.map((src, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                      className="aspect-video rounded-xl overflow-hidden border border-white shadow-md"
                    >
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center z-10 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${THEME}18` }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke={THEME} className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Click to upload photos</p>
                  <p className="text-xs text-gray-400">PNG, JPG · Max 3 images · Up to 10 MB each</p>
                </div>
              )}
            </div>

            {imagePreviews.length > 0 && (
              <p className="text-[11px] text-gray-400 mt-2 text-center font-medium">
                {imagePreviews.length} of 3 selected · Click to change
              </p>
            )}
          </motion.div>

          {/* ── Card 4: Skill Session ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 flex items-center gap-4" style={{ background: THEME }}>
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-white">Offer Skill Session</p>
                <p className="text-[11px] text-white/55 mt-0.5">Teach the renter how to use this tool</p>
              </div>
              {/* Animated checkbox on dark bg */}
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, offerSkillSession: !p.offerSkillSession }))}
                className="flex items-center gap-2.5 group shrink-0"
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  formData.offerSkillSession ? 'bg-white border-white' : 'bg-transparent border-white/40'
                }`}>
                  <AnimatePresence>
                    {formData.offerSkillSession && (
                      <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke={THEME} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-xs font-bold text-white/70 hidden sm:block">
                  {formData.offerSkillSession ? 'Enabled' : 'Enable'}
                </span>
              </button>
            </div>

            {/* Expandable fields */}
            <AnimatePresence>
              {formData.offerSkillSession && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 sm:px-8 py-6 space-y-5 border-t border-gray-100">
                    <div>
                      <FieldLabel required>Skill Session Price</FieldLabel>
                      <TextInput
                        prefix="Rs"
                        name="skillSessionPrice" type="number" placeholder="2500"
                        value={formData.skillSessionPrice} onChange={handleChange}
                        required={formData.offerSkillSession}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Session Description</FieldLabel>
                      <textarea
                        name="skillSessionDescription" rows={3}
                        placeholder="e.g., I will teach you the basics of camera settings, composition, and safe operation..."
                        value={formData.skillSessionDescription} onChange={handleChange}
                        required={formData.offerSkillSession} maxLength={500}
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-300
                          focus:bg-white focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/8 outline-none transition-all resize-none"
                      />
                      <div className="flex justify-between mt-1.5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Max 500 characters</p>
                        <p className="text-[10px] font-bold" style={{ color: formData.skillSessionDescription.length > 450 ? '#dc2626' : '#9CA3AF' }}>
                          {formData.skillSessionDescription.length}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Action Buttons ── */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={5}
            className="flex flex-col sm:flex-row gap-3 pt-2 pb-6"
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={uiState.isLoading}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-black uppercase tracking-widest text-gray-500
                hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={uiState.isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-1/2 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-white
                transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
              style={{ background: THEME, boxShadow: `0 8px 24px ${THEME}35` }}
            >
              {uiState.isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Listing...
                </>
              ) : 'List My Tool'}
            </motion.button>
          </motion.div>

        </form>
      </div>
    </div>
  );
}