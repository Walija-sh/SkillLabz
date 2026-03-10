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

  // ✅ --- TOGGLE AVAILABILITY LOGIC ---
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
          { label: 'Rating', val: '5.0', color: 'text-yellow-500' }
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
      <div className="flex gap-4 mb-8">
        {['tools', 'requests', 'rentals'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Content Area */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-gray-100 border-t-blue-600 rounded-full"></div></div>
        ) : activeTab === 'tools' ? (
          <div className="space-y-4">
            {items.map((item) => (
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
                  {/* ✅ --- MINIMALIST DARK TOGGLE (PER YOUR IMAGE) --- */}
                  <button 
                    onClick={() => handleToggleAvailability(item._id)}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none shadow-inner ${
                      item.isAvailable ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                      item.isAvailable ? 'translate-x-6' : 'translate-x-0'
                    }`}>
                      {item.isAvailable && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-3.5 h-3.5 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/edit-tool/${item._id}`)} className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                    </button>
                    <button onClick={() => { setItemToDelete(item._id); setDeleteModalOpen(true); }} className="p-3 bg-red-50 text-red-400 hover:text-red-600 rounded-2xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9l-.346 9m-4.788 0L9 9m9.768-1.5a3.375 3.375 0 01-3.366 3.366H6.602a3.375 3.375 0 01-3.366-3.366m15.756 0 1.05 11.13a2.25 2.25 0 01-2.247 2.25H6.602a2.25 2.25 0 01-2.247-2.25L5.385 7.5m13.453 0L17.768 4.5m-3.366 0H9.602L7.227 7.5" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">No history found.</div>
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