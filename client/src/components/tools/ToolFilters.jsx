import React, { useState } from 'react';
import Button from '../common/Button';

export default function ToolFilters({ 
  filters, 
  onFilterChange, 
  onApply, 
  onClear, 
  onKeyDown,
  onLocationFetch 
}) {
  const [fetchingLoc, setFetchingLoc] = useState(false);

  const handleGeoClick = () => {
    setFetchingLoc(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setFetchingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Send live coordinates back to BrowseTools
        onLocationFetch({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          distance: filters.distance || 50 // Default to 50km
        });
        setFetchingLoc(false);
      },
      () => {
        alert("Permission denied. Please enable location to find nearby tools.");
        setFetchingLoc(false);
      }
    );
  };

  return (
    <div className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-900 mb-4 uppercase tracking-wider text-sm">Filters</h3>
        
        {/* --- GEOLOCATION SECTION --- */}
        <div className="mb-6 pb-6 border-b border-gray-100">
           <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Nearby Search</label>
           <button
             type="button"
             onClick={handleGeoClick}
             disabled={fetchingLoc}
             className={`w-full py-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${
               filters.lat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
             }`}
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
             </svg>
             {fetchingLoc ? 'Locating...' : filters.lat ? 'Live Location ON' : 'Use My Location'}
           </button>

           {/* 🛠️ RADIUS SLIDER (Crucial for Hafizabad -> Taxila) */}
           {filters.lat && (
             <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Search Radius</label>
                  <span className="text-xs font-black text-blue-600">{filters.distance} km</span>
                </div>
                <input 
                  type="range" 
                  name="distance"
                  min="5" 
                  max="500" // ✅ Max 500km so Taxila (138km away) will show up!
                  step="5"
                  value={filters.distance || 50}
                  onChange={onFilterChange}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
             </div>
           )}
        </div>

        {/* --- CATEGORY FILTER --- */}
        <div className="mb-4">
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={onFilterChange}
            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 transition-all"
          >
            {/* ✅ FIXED CATEGORIES TO MATCH BACKEND ENUMS */}
            <option value="">All Categories</option>
            <option value="camera">Photography & Camera</option>
            <option value="laptop">Laptops & Computers</option>
            <option value="tools">Hardware & Tools</option>
            <option value="musical_instrument">Musical Instruments</option>
            <option value="sports">Sports Equipment</option>
            <option value="other">Other / Miscellaneous</option>
          </select>
        </div>

        {/* --- MANUAL CITY FILTER (Hidden when GPS is active to avoid confusion) --- */}
        {!filters.lat && (
          <div className="mb-4">
            <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">City</label>
            <input
              type="text"
              name="city"
              placeholder="e.g., Lahore"
              value={filters.city}
              onChange={onFilterChange}
              onKeyDown={onKeyDown}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50"
            />
          </div>
        )}

        {/* --- PRICE RANGE --- */}
        <div className="mb-4">
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-tighter">Daily Price (Rs)</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={onFilterChange}
              onKeyDown={onKeyDown}
              className="w-1/2 rounded-xl border border-gray-200 p-2.5 text-sm font-bold outline-none bg-gray-50"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={onFilterChange}
              onKeyDown={onKeyDown}
              className="w-1/2 rounded-xl border border-gray-200 p-2.5 text-sm font-bold outline-none bg-gray-50"
            />
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-col gap-2 mt-6 border-t border-gray-100 pt-6">
          <Button 
            type="button" 
            variant="primary"
            onClick={onApply}
            className="w-full! py-3! rounded-xl! font-black uppercase tracking-tighter shadow-lg shadow-blue-100"
          >
            Apply Filters
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onClear}
            className="w-full! py-3! rounded-xl! text-gray-500! border-gray-200! font-black uppercase tracking-tighter hover:bg-gray-50!"
          >
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}