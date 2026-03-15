import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toolService from '../../services/tool.service';
import rentalService from '../../services/rental.service';

import MonthlyEarningsChart from '../../components/dashboard/MonthlyEarningsChart';
import WeeklyRentalsChart from '../../components/dashboard/WeeklyRentalsChart';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tools'); 

  // --- DELETE MODAL STATE ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [itemsResponse, rentalsResponse] = await Promise.all([
          toolService.getMyTools(),
          rentalService.getOwnerRentals()
        ]);

        setItems(itemsResponse.items || []);
        setRentals(rentalsResponse.rentals || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- TOGGLE AVAILABILITY LOGIC ---
  const handleToggleAvailability = async (toolId) => {
    try {
      await toolService.toggleAvailability(toolId);
      
      setItems(prevItems => prevItems.map(item => 
        item._id === toolId ? { ...item, isAvailable: !item.isAvailable } : item
      ));
    } catch (err) {
      console.error("Failed to toggle availability:", err);
      alert(err.message || "Error updating tool status");
    }
  };

  // --- DELETE LOGIC ---
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await toolService.deleteTool(itemToDelete);
      setItems(prevItems => prevItems.filter(item => item._id !== itemToDelete));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete tool.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ --- RENTAL ACTIONS (APPROVE/REJECT/START/COMPLETE) ---
  const handleRentalAction = async (actionType, rentalId) => {
    try {
      let updatedRental;
      if (actionType === 'approve') updatedRental = await rentalService.approveRental(rentalId);
      else if (actionType === 'reject') updatedRental = await rentalService.rejectRental(rentalId);
      else if (actionType === 'start') updatedRental = await rentalService.startRental(rentalId);
      else if (actionType === 'complete') updatedRental = await rentalService.completeRental(rentalId);

      // Instantly update the UI status without a page refresh
      setRentals(prevRentals => 
        prevRentals.map(r => r._id === rentalId ? { ...r, rentalStatus: updatedRental.rental.rentalStatus } : r)
      );
    } catch (err) {
      console.error(`Failed to ${actionType} rental:`, err);
      alert(err.message || `Failed to ${actionType} rental. Ensure dates don't conflict.`);
    }
  };

  // --- STATS ---
  const totalTools = items.length;
  let activeRentalsCount = 0;
  let pendingRequestsCount = 0;
  let totalEarnings = 0;

  rentals.forEach(rental => {
    if (rental.rentalStatus === 'active') activeRentalsCount++;
    if (rental.rentalStatus === 'pending') pendingRequestsCount++;
    if (rental.rentalStatus === 'completed') {
      const start = new Date(rental.startDate);
      const end = new Date(rental.endDate);
      const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
      totalEarnings += (days * rental.pricePerDay);
    }
  });

  // --- FILTER RENTALS FOR TABS ---
  const pendingRequests = rentals.filter(r => r.rentalStatus === 'pending');
  const activeAndPastRentals = rentals.filter(r => r.rentalStatus !== 'pending');

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Tracking {user?.username}'s growth</p>
        </div>
        <button 
          onClick={() => navigate('/list-tool')} 
          className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-sm font-black shadow-xl shadow-blue-100 transition-all rounded-2xl flex items-center gap-2 uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          List New Tool
        </button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Inventory', val: totalTools, color: 'text-gray-900' },
          { label: 'Active Rent', val: activeRentalsCount, color: 'text-blue-600' },
          { label: 'Earnings', val: `Rs. ${totalEarnings}`, color: 'text-green-600' },
          { label: 'Pending Req', val: pendingRequestsCount, color: 'text-orange-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <MonthlyEarningsChart rentals={rentals} />
        <WeeklyRentalsChart rentals={rentals} />
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-100 pb-4 overflow-x-auto">
        {['tools', 'requests', 'rentals'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 bg-white border border-gray-100'}`}
          >
            {tab === 'requests' ? `Requests (${pendingRequests.length})` : tab}
          </button>
        ))}
      </div>

      {/* 4. Content Area */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-gray-100 border-t-blue-600 rounded-full"></div></div>
        ) : activeTab === 'tools' ? (
          
          /* --- TAB: TOOLS (INVENTORY) --- */
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">No tools listed yet.</div>
            ) : (
              items.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-50 rounded-3xl bg-white hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 shrink-0">
                      <img src={item.images[0]?.url || 'https://via.placeholder.com/150'} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{item.title}</h3>
                      <p className="text-sm font-bold text-blue-600">Rs. {item.pricePerDay}/day</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-6 sm:mt-0">
                    <button 
                      onClick={() => handleToggleAvailability(item._id)}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${item.isAvailable ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${item.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}>
                        {item.isAvailable && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-3.5 h-3.5 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        )}
                      </div>
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/edit-tool/${item._id}`)} className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>
                      <button onClick={() => { setItemToDelete(item._id); setDeleteModalOpen(true); }} className="p-3 bg-red-50 text-red-400 hover:text-red-600 rounded-2xl transition-all"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9l-.346 9m-4.788 0L9 9m9.768-1.5a3.375 3.375 0 01-3.366 3.366H6.602a3.375 3.375 0 01-3.366-3.366m15.756 0 1.05 11.13a2.25 2.25 0 01-2.247 2.25H6.602a2.25 2.25 0 01-2.247-2.25L5.385 7.5m13.453 0L17.768 4.5m-3.366 0H9.602L7.227 7.5" /></svg></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        ) : activeTab === 'requests' ? (

          /* ✅ --- TAB: REQUESTS (PENDING ONLY) --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 font-bold uppercase tracking-widest">No pending requests.</div>
            ) : (
              pendingRequests.map(req => (
                <div key={req._id} className="border border-gray-100 rounded-3xl p-6 bg-white shadow-sm flex flex-col justify-between">
                  <div className="flex gap-4 mb-6">
                    <img src={req.item?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                    <div>
                      <h3 className="font-black text-gray-900 uppercase tracking-tight">{req.item?.title}</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">Requested by: <span className="text-blue-600">{req.renter?.username}</span></p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{formatDate(req.startDate)} - {formatDate(req.endDate)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-6 px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Payout</span>
                    <span className="text-lg font-black text-green-600">Rs. {req.totalPrice}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleRentalAction('approve', req._id)} className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors">Approve</button>
                    <button onClick={() => handleRentalAction('reject', req._id)} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-colors">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>

        ) : (

          /* ✅ --- TAB: RENTALS (ACTIVE, COMPLETED, REJECTED) --- */
          <div className="space-y-4">
            {activeAndPastRentals.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">No rental history.</div>
            ) : (
              activeAndPastRentals.map(rental => (
                <div key={rental._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-gray-50 rounded-3xl bg-white hover:border-gray-100 transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <img src={rental.item?.images?.[0]?.url || 'https://via.placeholder.com/150'} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                    <div>
                      <h3 className="font-black text-gray-900 uppercase tracking-tight">{rental.item?.title}</h3>
                      <p className="text-xs font-bold text-gray-500 mt-1">{formatDate(rental.startDate)} to {formatDate(rental.endDate)} • Rs. {rental.totalPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Status Badge */}
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      rental.rentalStatus === 'active' ? 'bg-green-100 text-green-700' :
                      rental.rentalStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                      rental.rentalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {rental.rentalStatus}
                    </span>

                    {/* Action Buttons for Lifecycle */}
                    {rental.rentalStatus === 'approved' && (
                      <button onClick={() => handleRentalAction('start', rental._id)} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700">Handed Over</button>
                    )}
                    {rental.rentalStatus === 'active' && (
                      <button onClick={() => handleRentalAction('complete', rental._id)} className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800">Returned</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* --- DELETE MODAL --- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-black text-center text-gray-900 mb-2 uppercase tracking-tight">Delete Tool?</h3>
            <p className="text-center text-gray-400 mb-8 font-medium">This is permanent. Your listing will be gone.</p>
            {deleteError && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-black text-center uppercase">{deleteError}</div>}
            <div className="flex flex-col gap-3">
              <button onClick={confirmDelete} disabled={isDeleting} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700">{isDeleting ? 'Processing...' : 'Delete Permanently'}</button>
              <button onClick={() => { setDeleteModalOpen(false); setDeleteError(null); }} disabled={isDeleting} className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest">Keep It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}