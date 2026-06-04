import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import toolService from '../../services/tool.service';
import ToolCard from '../../components/tools/ToolCard';
import ToolFilters from '../../components/tools/ToolFilters';

const INITIAL_FILTERS = {
  keyword: '', category: '', city: '', minPrice: '', maxPrice: '',
  page: 1, limit: 20, lat: null, lng: null, distance: 10,
};

const TEXT_FIELDS = new Set(['keyword', 'city', 'minPrice', 'maxPrice']);

export default function BrowseTools() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef(null);
  const debounceRef = useRef(null);

  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.status);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch whenever appliedFilters change
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const activeFilters = Object.fromEntries(
          Object.entries(appliedFilters).filter(([_, v]) => v !== null && v !== '')
        );
        if (activeFilters.city) {
          activeFilters.city = activeFilters.city
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }
        const response = await (activeFilters.lat && activeFilters.lng
          ? toolService.getNearbyTools(activeFilters)
          : toolService.getAllTools(activeFilters));

        setItems(response.items || []);
        setPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.total || 0,
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [appliedFilters]);

  const handleCardClick = (toolId) => {
    if (!isLoggedIn) navigate('/register', { replace: true });
    else navigate(`/tools/${toolId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updater = (prev) => ({ ...prev, [name]: value, page: 1 });
    setFilters(updater);
    if (TEXT_FIELDS.has(name)) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setAppliedFilters(updater), 500);
    } else {
      setAppliedFilters(updater);
    }
  };

  const handleLocationUpdate = (coords) => {
    const newFilters = { ...filters, ...coords, page: 1 };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  const handleApplyFilters = useCallback(() => {
    clearTimeout(debounceRef.current);
    setAppliedFilters({ ...filters, page: 1 });
    setFiltersOpen(false);
  }, [filters]);

  const handleClearFilters = () => {
    clearTimeout(debounceRef.current);
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      setAppliedFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleApplyFilters(); };

  const activeFilterCount = [
    filters.category, filters.city, filters.minPrice, filters.maxPrice, filters.lat,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#ECEFF1]">

      {/* ── Hero Header ── */}
      <div className="bg-[#ECEFF1] border-b border-gray-100 pt-8 pb-7 px-4 text-center sm:pt-12 sm:pb-10">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-2 sm:mb-3 leading-tight">
          Browse <span className="text-[#191970]">Quality Tools</span> &amp; <span className="text-[#191970]">Equipment</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Rent professional-grade gear from trusted owners near you
        </p>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* ── Search + Filters bar ── */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">

          {/* Search — flex-1 so it takes all available space on any screen */}
          <div className="relative flex-1 min-w-0">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none shrink-0"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              name="keyword"
              placeholder="Search gear, brands, or tools..."
              value={filters.keyword}
              onChange={handleFilterChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 bg-white focus:border-[#191970]/40 focus:ring-2 focus:ring-[#191970]/10 outline-none transition-all text-sm font-medium text-gray-700 placeholder-gray-400 shadow-sm"
            />
          </div>

          {/* Filters button — compact on mobile */}
          <div className="relative shrink-0" ref={filtersRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen(prev => !prev)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-sm font-bold transition-all shadow-sm whitespace-nowrap ${
                filtersOpen || activeFilterCount > 0
                  ? 'bg-[#191970] border-[#191970] text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              <span className="hidden xs:inline sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-[#191970] rounded-full text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'transform 0.2s', transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown — full width on mobile, fixed 320px on desktop */}
            <AnimatePresence>
              {filtersOpen && (
                <div
                  className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                  style={{ width: 'min(320px, calc(100vw - 24px))' }}
                >
                  <ToolFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApply={handleApplyFilters}
                    onClear={handleClearFilters}
                    onKeyDown={handleKeyDown}
                    onLocationFetch={handleLocationUpdate}
                    isDropdown
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Item count — on its own row, left-aligned, small */}
        {!loading && (
          <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-4 sm:mb-5">
            {pagination.totalItems} item{pagination.totalItems !== 1 ? 's' : ''} found
          </p>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 sm:p-4 rounded-2xl mb-4 sm:mb-6 border border-red-100 font-bold text-sm">
            {error}
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white rounded-xl sm:rounded-2xl border border-gray-100"
                style={{ aspectRatio: '3/4' }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 sm:p-24 text-center">
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs sm:text-sm">
              No gear listed here yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
            {items.map(item => (
              <div
                key={item._id}
                onClick={() => handleCardClick(item._id)}
                className="cursor-pointer"
              >
                <ToolCard item={item} />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 sm:mt-12">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-3 sm:px-4 py-2 text-sm font-black text-gray-700">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}