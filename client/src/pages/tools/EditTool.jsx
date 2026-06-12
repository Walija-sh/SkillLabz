import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toolService from '../../services/tool.service';

// ─── Constants & Theme Tokens ─────────────────────────────────────────────────
const NAVY   = '#191970';
const BG     = '#ECEFF1';

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

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const alertVariant = {
  hidden:  { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.25 } },
  exit:    { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } },
};

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls = `
  w-full rounded-xl border-2 border-gray-100
  bg-[#FAFAFA] px-4 py-3.5 text-sm font-semibold text-[#1A1A2E]
  outline-none transition-all
  focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/15
  placeholder:text-gray-400 placeholder:font-medium
`;

// ─── Field Label ──────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: NAVY }}>
    {children}
  </p>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ children, index }) => (
  <motion.div
    variants={fadeUp} initial="hidden" animate="visible" custom={index}
    className="bg-white border border-gray-200 rounded-[32px] p-8 sm:p-10 shadow-sm"
  >
    {children}
  </motion.div>
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
        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-sm transition-all outline-none text-left ${
          open ? 'border-[#191970] ring-2 ring-[#191970]/15 bg-white' :
          value
            ? 'border-gray-100 bg-[#FAFAFA] text-[#1A1A2E] font-bold'
            : 'border-gray-100 bg-[#FAFAFA] text-gray-400 font-medium'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#191970]/30'}`}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={value || open ? NAVY : '#9CA3AF'} strokeWidth="2.5"
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditTool() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const fileInputRef = useRef(null);

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [useDeposit, setUseDeposit] = useState(false);

  const [formData, setFormData] = useState({
    title: '', category: '', condition: '', description: '',
    pricePerDay: '', depositAmount: '', city: '',
  });

  const [existingImages,    setExistingImages]    = useState([]);
  const [newImageFiles,     setNewImageFiles]     = useState([]);
  const [newImagePreviews,  setNewImagePreviews]  = useState([]);

  const MAX_IMAGES          = 5;
  const totalCurrentImages  = existingImages.length + newImageFiles.length;

  // ── Fetch ──
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const response = await toolService.getToolById(id);
        const item = response.item;
        setFormData({
          title:         item.title || '',
          category:      item.category || '',
          condition:     item.condition || '',
          description:   item.description || '',
          pricePerDay:   item.pricePerDay || '',
          depositAmount: item.depositAmount ?? 0,
          city:          item.location?.city || '',
        });
        setUseDeposit((item.depositAmount ?? 0) > 0);
        setExistingImages(item.images || []);
      } catch (err) {
        setError(err.message || 'Failed to load tool details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Image handlers ──
  const handleImageSelect = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setError(null);
    if (existingImages.length + newImageFiles.length + files.length > MAX_IMAGES) {
      setError(`Max ${MAX_IMAGES} images. Space left: ${MAX_IMAGES - totalCurrentImages}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setNewImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeExistingImage = (i) =>
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));

  const removeNewImage = (i) => {
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (totalCurrentImages === 0) { setError('Please include at least one product image.'); return; }
    setSaving(true);
    try {
      const updateData = new FormData();
      updateData.append('title',         formData.title);
      updateData.append('category',      formData.category);
      updateData.append('condition',     formData.condition);
      updateData.append('description',   formData.description);
      updateData.append('pricePerDay',   Number(formData.pricePerDay || 0));
      updateData.append('depositAmount', useDeposit ? Number(formData.depositAmount || 0) : 0);
      updateData.append('keptImages',    JSON.stringify(existingImages.map((img) => img.public_id)));
      newImageFiles.forEach((file) => updateData.append('images', file));
      await toolService.updateTool(id, updateData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update the tool. Please try again.');
      setSaving(false);
    }
  };

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
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: BG }}>
      <div className="max-w-3xl mx-auto">

        {/* ── Page header ── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="mb-10 text-center sm:text-left"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-black uppercase tracking-widest mb-5 transition-opacity hover:opacity-60"
            style={{ color: NAVY }}
          >
            Back to Dashboard
          </button>
          <h1 className="text-3xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: NAVY }}>
            Edit <span className="text-gray-900">Listing</span>
          </h1>
          <p className="text-base font-medium text-gray-400 mt-2">
            Update the details for your tool.
          </p>
        </motion.div>

        {/* ── Error alert ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              variants={alertVariant} initial="hidden" animate="visible" exit="exit"
              className="mb-6 p-4 rounded-2xl border text-sm font-bold bg-red-50 text-red-600 border-red-200 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Tool Information ── */}
          <SectionCard index={1}>
            <div className="mb-8 pb-4 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest mb-1" style={{ color: NAVY }}>Tool Information</h2>
              <p className="text-sm text-gray-400 font-medium">Basic details about your equipment</p>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <FieldLabel>Title *</FieldLabel>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputCls} />
              </div>

              {/* Category + Condition Custom Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Category *</FieldLabel>
                  <CustomSelect
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={CATEGORIES}
                    placeholder="Select category"
                    disabled={loading || saving}
                  />
                </div>
                <div>
                  <FieldLabel>Condition *</FieldLabel>
                  <CustomSelect
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    options={CONDITIONS}
                    placeholder="Select condition"
                    disabled={loading || saving}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description *</FieldLabel>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* City (locked) */}
              <div>
                <FieldLabel>
                  City <span className="normal-case font-medium text-gray-400 tracking-normal">(cannot be changed)</span>
                </FieldLabel>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  disabled
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-100 px-4 py-3.5 text-sm font-bold text-gray-400 cursor-not-allowed outline-none"
                />
              </div>
            </div>
          </SectionCard>

          {/* ── Pricing ── */}
          <SectionCard index={2}>
            <div className="mb-8 pb-4 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest mb-1" style={{ color: NAVY }}>Pricing</h2>
              <p className="text-sm text-gray-400 font-medium">Set your daily rate and security deposit</p>
            </div>

            <div className="space-y-5">
              <div>
                <FieldLabel>Price Per Day (Rs) *</FieldLabel>
                <input
                  type="number"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 500"
                  className={inputCls}
                />
              </div>

              {/* Deposit toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setUseDeposit(!useDeposit)}
                  className="flex items-center gap-4 w-full p-5 rounded-2xl border-2 transition-colors text-left"
                  style={{
                    borderColor: useDeposit ? NAVY + '40' : '#e5e7eb',
                    backgroundColor: useDeposit ? NAVY + '06' : 'transparent',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md border-2 transition-colors"
                    style={{
                      borderColor: useDeposit ? NAVY : '#d1d5db',
                      backgroundColor: useDeposit ? NAVY : 'transparent',
                    }}
                  />
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest" style={{ color: NAVY }}>Enable refundable security deposit</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">Renter pays a refundable deposit before the rental begins</p>
                  </div>
                </button>

                <AnimatePresence>
                  {useDeposit && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 overflow-hidden"
                    >
                      <FieldLabel>Deposit Amount (Rs)</FieldLabel>
                      <input
                        type="number"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={(e) => setFormData((prev) => ({ ...prev, depositAmount: e.target.value }))}
                        min="0"
                        placeholder="e.g. 2000"
                        className={inputCls}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SectionCard>

          {/* ── Images ── */}
          <SectionCard index={3}>
            <div className="mb-8 pb-4 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest mb-1" style={{ color: NAVY }}>Product Images</h2>
              <p className="text-sm text-gray-400 font-medium">
                Max {MAX_IMAGES} images · {totalCurrentImages} currently added
              </p>
            </div>

            {/* Image grid */}
            <div className="flex flex-wrap gap-4 mb-5">
              {/* Existing images */}
              {existingImages.map((img, i) => (
                <motion.div
                  key={img.public_id || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-gray-200 group"
                >
                  <img src={img.url} alt={`Tool ${i}`} className="w-full h-full object-cover" />
                  <div
                    onClick={() => removeExistingImage(i)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'rgba(25,25,112,0.75)' }}
                  >
                    <span className="text-white text-xs font-black uppercase tracking-widest">Remove</span>
                  </div>
                </motion.div>
              ))}

              {/* New previews */}
              {newImagePreviews.map((preview, i) => (
                <motion.div
                  key={`new-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-dashed group"
                  style={{ borderColor: NAVY + '50' }}
                >
                  <img src={preview} alt={`New ${i}`} className="w-full h-full object-cover opacity-90" />
                  <div
                    onClick={() => removeNewImage(i)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ backgroundColor: 'rgba(25,25,112,0.75)' }}
                  >
                    <span className="text-white text-xs font-black uppercase tracking-widest">Remove</span>
                  </div>
                </motion.div>
              ))}

              {/* Add slot */}
              {totalCurrentImages < MAX_IMAGES && (
                <label
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{ borderColor: NAVY + '30', backgroundColor: NAVY + '05' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = NAVY}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = NAVY + '30'}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: NAVY }}>Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Hover over an image to remove it · {MAX_IMAGES - totalCurrentImages} slot{MAX_IMAGES - totalCurrentImages !== 1 ? 's' : ''} remaining
            </p>
          </SectionCard>

          {/* ── Submit ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-[16px] text-sm font-black uppercase tracking-widest text-white shadow-xl transition-colors disabled:opacity-60"
              style={{ backgroundColor: NAVY, boxShadow: `0 8px 24px ${NAVY}35` }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = '#141660')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NAVY}
            >
              {saving ? 'Saving…' : 'Save Updates'}
            </motion.button>
          </motion.div>

        </form>
      </div>
    </div>
  );
}