import React, { useState, useEffect } from 'react';
import rentalService from '../../services/rental.service';

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tabs: 'pending', 'active', 'completed'
  // Note: We'll map "approved" to the "active" tab so users know they need to pick it up!
  const [activeTab, setActiveTab] = useState('active'); 

  useEffect(() => {
    const fetchMyRentals = async () => {
      try {
        const response = await rentalService.getMyRentals();
        setRentals(response.rentals);
      } catch (err) {
        setError(err.message || "Failed to load your rentals.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyRentals();
  }, []);

  // Filter logic based on the selected tab
  const filteredRentals = rentals.filter(rental => {
    if (activeTab === 'pending') return rental.rentalStatus === 'pending';
    if (activeTab === 'active') return ['approved', 'active'].includes(rental.rentalStatus);
    if (activeTab === 'completed') return ['completed', 'rejected', 'cancelled'].includes(rental.rentalStatus);
    return true;
  });

  // Calculate counts for the tabs
  const pendingCount = rentals.filter(r => r.rentalStatus === 'pending').length;
  const activeCount = rentals.filter(r => ['approved', 'active'].includes(r.rentalStatus)).length;
  const completedCount = rentals.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.rentalStatus)).length;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>;
      case 'approved':
        return <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Approved</span>;
      case 'pending':
        return <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'completed':
        return <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
      default:
        return <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Rentals</h1>
        <p className="text-gray-500 font-medium">Track your rental history and active bookings</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-bold">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Active ({activeCount})
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Pending ({pendingCount})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Rental Cards List */}
      <div className="space-y-6">
        {filteredRentals.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">No {activeTab} rentals found.</h3>
            <p className="text-gray-500 mt-2">When you request tools, they will appear here.</p>
          </div>
        ) : (
          filteredRentals.map((rental) => (
            <div key={rental._id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm relative transition-hover hover:shadow-md">
              
              {/* Status Badge (Top Right) */}
              <div className="absolute top-5 right-5">
                {getStatusBadge(rental.rentalStatus)}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                
                {/* 1. Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  <img 
                    src={rental.item?.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                    alt={rental.item?.title || 'Tool'} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 2. Content Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 md:pr-24">
                  
                  {/* Title & Dates */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{rental.item?.title || 'Unknown Tool'}</h2>
                    <p className="text-sm text-gray-500 mt-1 mb-4">{rental.item?.location?.city || 'Location unavailable'}</p>
                    
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Rental Period</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatDate(rental.startDate)} to {formatDate(rental.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-gray-900">Rs. {rental.totalPrice}</p>
                  </div>

                  {/* Return OTP (Visual only, based on Figma) */}
                  {rental.rentalStatus === 'active' && (
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Return OTP</p>
                      <p className="text-lg font-black text-orange-500 tracking-widest">9127</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                <button className="flex items-center gap-2 bg-[#f06424] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                
                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  Contact Owner
                </button>
                
                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  View Contract
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}