import React, { useState } from 'react';

// Added 'default' here to fix the SyntaxError
export default function LocationPicker({ onLocationSelect, currentCoordinates = [0, 0] }) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // [longitude, latitude] for GeoJSON
        onLocationSelect([pos.coords.longitude, pos.coords.latitude]);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setError("Location access denied.");
      },
      { enableHighAccuracy: true }
    );
  };

  const hasCoords = currentCoordinates[0] !== 0 || currentCoordinates[1] !== 0;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-900">Location Mapping*</label>
      <div className={`flex flex-col sm:flex-row items-center gap-4 p-5 bg-gray-50 border rounded-2xl transition-colors ${error ? 'border-red-200' : 'border-gray-200'}`}>
        <button
          type="button"
          onClick={handleGetLocation}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          {isLocating ? "Fetching..." : "Detect My Location"}
        </button>
        <div className="text-center sm:text-left">
          <p className="text-[11px] uppercase tracking-widest font-black text-gray-400 mb-0.5">Coordinates Status</p>
          <p className={`text-sm font-bold ${hasCoords ? 'text-blue-600' : 'text-gray-400'}`}>
            {hasCoords ? `${currentCoordinates[1].toFixed(5)}, ${currentCoordinates[0].toFixed(5)}` : "Not set yet"}
          </p>
        </div>
      </div>
    </div>
  );
}