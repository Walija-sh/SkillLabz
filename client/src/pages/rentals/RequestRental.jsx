import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toolService from '../../services/tool.service';
import rentalService from '../../services/rental.service'; 
import Button from '../../components/common/Button';

export default function RequestRental() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renterNote, setRenterNote] = useState('');
  const [addSkillSession, setAddSkillSession] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await toolService.getToolById(id);
        setItem(response.item);
      } catch (err) {
        setError(err.message || "Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // --- MATH CALCULATIONS ---
  let rentalDays = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const validDays = rentalDays > 0 ? rentalDays : 0;
  
  const basePrice = item ? item.pricePerDay * validDays : 0;
  const deposit = item ? item.depositAmount : 0;
  const extraCost = (addSkillSession && item?.offerSkillSession) ? item.skillSessionPrice : 0;

  // ✅ FIXED: Total price now only includes rental fees and optional skill session
  const totalPrice = basePrice + extraCost;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (validDays <= 0) {
      setError("End date must be at least one day after the start date.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        itemId: id,
        startDate,
        endDate,
        renterNote,
        includesSkillSession: addSkillSession 
      };

      await rentalService.createRentalRequest(payload);
      
      navigate('/my-rentals'); 
      
    } catch (err) {
      setError(err.message || "Failed to request booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!item) return <div className="text-center py-20 font-bold text-gray-500">Item not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8 uppercase">Request to rent</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Item Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
              <img 
                src={item.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded mb-1 inline-block">
                {item.category}
              </span>
              <h2 className="text-xl font-black text-gray-900 leading-tight">{item.title}</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">Owner: {item.owner?.username}</p>
            </div>
          </div>

          {/* 2. Date Picker Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Select rental dates
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">Start Date</label>
                <input 
                  type="date" 
                  required
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3.5 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest">End Date</label>
                <input 
                  type="date" 
                  required
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3.5 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-sm font-bold text-gray-700 cursor-pointer transition-all"
                />
              </div>
            </div>
          </div>

          {/* 3. Skill Session Card */}
          {item.offerSkillSession && (
            <div 
              className={`bg-white rounded-2xl border p-6 shadow-sm flex items-center justify-between cursor-pointer transition-all duration-300 ${
                addSkillSession ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
              }`}
              onClick={() => setAddSkillSession(!addSkillSession)}
            >
              <div className="pr-4">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">Add skill session</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed max-w-sm">
                  {item.skillSessionDescription || `Learn how to use this tool properly from ${item.owner?.username}.`}
                </p>
                <p className="text-xs font-black text-orange-600 mt-2 uppercase tracking-widest">+ PKR {item.skillSessionPrice}</p>
              </div>
              
              <div className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${addSkillSession ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${addSkillSession ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </div>
            </div>
          )}

          {/* 4. Message Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-black text-gray-900 mb-4 uppercase text-xs tracking-widest">Message to owner (optional)</h3>
            <textarea 
              rows="4"
              placeholder="Tell the owner about your project..."
              value={renterNote}
              onChange={(e) => setRenterNote(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 text-sm font-medium resize-none transition-all"
            ></textarea>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm sticky top-6">
            <h3 className="text-xs font-black text-gray-900 mb-6 uppercase tracking-widest border-b border-gray-50 pb-4">Booking summary</h3>

            <div className="space-y-5 text-xs mb-6 border-b border-gray-100 pb-6">
              <div className="flex justify-between text-gray-500 font-bold">
                <span>PKR {item.pricePerDay} x {validDays} days</span>
                <span className="text-gray-900">PKR {basePrice}</span>
              </div>
              
              {/* ✅ UPDATED: Security deposit UI reflects its conditional nature */}
              <div className="flex justify-between text-gray-400 font-bold">
                <span className="flex items-center gap-1.5">
                  Security deposit 
                  <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-tighter">Conditional</span>
                </span>
                <span>PKR {deposit}</span>
              </div>

              {addSkillSession && item.offerSkillSession && (
                <div className="flex justify-between text-orange-600 font-black uppercase tracking-tighter">
                  <span>Skill session</span>
                  <span>PKR {extraCost}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 px-1">
              <span className="font-black text-gray-900 uppercase text-xs tracking-wider">Total to pay</span>
              <span className="text-2xl font-black text-gray-900">PKR {totalPrice}</span>
            </div>

            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-[10px] font-bold border border-orange-100 flex gap-3 mb-6 leading-tight uppercase tracking-tight">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 shrink-0 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Payment will be made offline (Easypaisa, JazzCash, or bank transfer) after owner approval
            </div>

            <Button 
              type="submit" 
              variant="primary"
              disabled={validDays <= 0 || submitting}
              isLoading={submitting}
              className={`!w-full !py-4 !rounded-xl text-xs uppercase tracking-widest font-black transition-all ${
                validDays <= 0 ? '!bg-gray-200 !text-gray-400 !cursor-not-allowed shadow-none' : '!bg-blue-600 hover:!bg-blue-700 shadow-xl shadow-blue-100'
              }`}
            >
              Request to book
            </Button>

            <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-widest mt-5">
              No charge until owner approves
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}