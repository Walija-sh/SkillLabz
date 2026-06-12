import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'camera', label: 'Photography & Camera' },
  { value: 'laptop', label: 'Laptops & Computers' },
  { value: 'tools', label: 'Hardware & Tools' },
  { value: 'musical_instrument', label: 'Musical Instruments' },
  { value: 'sports', label: 'Sports Equipment' },
  { value: 'other', label: 'Other / Miscellaneous' },
];

const RADIUS_STEP = 5;
const RADIUS_MIN = 5;
const RADIUS_MAX = 500;

/* ─── small reusable label ─── */
const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-2">
    {children}
  </p>
);

/* ─── divider ─── */
const Divider = () => <div className="border-t border-gray-100 my-4" />;

export default function ToolFilters({
  filters,
  onFilterChange,
  onApply,       // kept for compat but no longer called inside
  onClear,
  onKeyDown,
  onLocationFetch,
  isDropdown = false,
}) {
  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  // close category dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleGeoClick = () => {
    setFetchingLoc(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setFetchingLoc(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationFetch({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          distance: filters.distance || 10,
        });
        setFetchingLoc(false);
      },
      () => {
        alert('Permission denied. Please enable location to find nearby tools.');
        setFetchingLoc(false);
      }
    );
  };

  const currentDistance = filters.distance || 10;

  const adjustRadius = (delta) => {
    const next = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, currentDistance + delta));
    // fire as a synthetic-style event so BrowseTools handleFilterChange works
    onFilterChange({ target: { name: 'distance', value: next } });
  };

  const selectedCategory = CATEGORIES.find(c => c.value === filters.category) || CATEGORIES[0];

  /* ── panel animation variants ── */
  const panelVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
    exit:   { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.25, ease: 'easeOut' } }),
  };

  const content = (
    <div className="space-y-0">

      {/* ── NEARBY SEARCH ── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <SectionLabel>Nearby Search</SectionLabel>

        <motion.button
          type="button"
          onClick={handleGeoClick}
          disabled={fetchingLoc}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full py-3 rounded-2xl text-sm font-bold border transition-colors flex items-center justify-center gap-2.5 ${
            filters.lat
              ? 'bg-[#191970] border-[#191970] text-white shadow-lg shadow-indigo-900/20'
              : 'bg-white border-gray-200 text-gray-600 hover:border-[#191970]/30 hover:text-[#191970]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {fetchingLoc ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
              />
              Locating...
            </span>
          ) : filters.lat ? 'Live Location ON' : 'Use My Location'}
        </motion.button>

        {/* radius counter */}
        <AnimatePresence>
          {filters.lat && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">
                  Search Radius
                </span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => adjustRadius(-RADIUS_STEP)}
                  disabled={currentDistance <= RADIUS_MIN}
                  whileTap={{ scale: 0.88 }}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-black text-lg flex items-center justify-center disabled:opacity-30 hover:bg-gray-100 transition-colors select-none"
                >
                  −
                </motion.button>

                <div className="flex-1 flex flex-col items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={currentDistance}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="text-2xl font-black text-[#191970] leading-none"
                    >
                      {currentDistance}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] text-gray-400 font-bold mt-0.5">km</span>
                </div>

                <motion.button
                  type="button"
                  onClick={() => adjustRadius(+RADIUS_STEP)}
                  disabled={currentDistance >= RADIUS_MAX}
                  whileTap={{ scale: 0.88 }}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-black text-lg flex items-center justify-center disabled:opacity-30 hover:bg-gray-100 transition-colors select-none"
                >
                  +
                </motion.button>
              </div>
              {/* progress bar */}
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#191970] rounded-full"
                  initial={false}
                  animate={{ width: `${((currentDistance - RADIUS_MIN) / (RADIUS_MAX - RADIUS_MIN)) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Divider />

      {/* ── CATEGORY ── */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="relative" ref={catRef}>
        <SectionLabel>Category</SectionLabel>

        <motion.button
          type="button"
          onClick={() => setCatOpen(v => !v)}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-bold transition-all ${
            filters.category
              ? 'border-[#191970]/40 bg-indigo-50 text-[#191970]'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <span>{selectedCategory.label}</span>
          <motion.svg
            animate={{ rotate: catOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {catOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'top' }}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
            >
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    onFilterChange({ target: { name: 'category', value: cat.value } });
                    setCatOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-3 ${
                    filters.category === cat.value
                      ? 'bg-[#191970] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filters.category === cat.value && (
                    <motion.svg
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                  )}
                  <span className={filters.category === cat.value ? '' : 'ml-[22px]'}>
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Divider />

      {/* ── CITY ── */}
      <AnimatePresence>
        {!filters.lat && (
          <motion.div
            custom={2} variants={sectionVariants} initial="hidden" animate="visible"
            exit={{ opacity: 0, height: 0 }}
          >
            <SectionLabel>City</SectionLabel>
            <input
              type="text"
              name="city"
              placeholder="e.g., Lahore"
              value={filters.city}
              onChange={onFilterChange}
              onKeyDown={onKeyDown}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/10 transition-all"
            />
            <Divider />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRICE RANGE ── */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <SectionLabel>Daily Price (Rs)</SectionLabel>
        <div className="flex gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={filters.minPrice}
            onChange={onFilterChange}
            onKeyDown={onKeyDown}
            className="w-1/2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/10 transition-all"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={onFilterChange}
            onKeyDown={onKeyDown}
            className="w-1/2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 placeholder-gray-300 outline-none focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/10 transition-all"
          />
        </div>
      </motion.div>

      <Divider />

      {/* ── CLEAR ALL ── */}
      <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible">
        <motion.button
          type="button"
          onClick={onClear}
          whileTap={{ scale: 0.97 }}
          whileHover={{ backgroundColor: '#f9fafb' }}
          className="w-full py-2.5 rounded-2xl border border-gray-200 bg-white text-xs font-black uppercase tracking-widest text-gray-400 transition-colors"
        >
          Clear All
        </motion.button>
      </motion.div>

    </div>
  );

  /* ── Dropdown mode: wrapped in animated panel ── */
  if (isDropdown) {
    return (
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="p-5"
      >
        {content}
      </motion.div>
    );
  }

  /* ── Standalone sidebar mode ── */
  return (
    <div className="w-full lg:w-64 shrink-0">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">Filters</h3>
        </div>
        {content}
      </div>
    </div>
  );
}