import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toolService from '../../services/tool.service';
import rentalService from '../../services/rental.service'; 
import Button from '../../components/common/Button';

// ── animation variants ──────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

export default function RequestRental() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [calendarWindow, setCalendarWindow] = useState(null);

  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renterNote, setRenterNote] = useState('');
  const [addSkillSession, setAddSkillSession] = useState(false);

  // Calendar month navigation state
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  const [visibleMonthIndex, setVisibleMonthIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1); // 1 = next (down), -1 = prev (up)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const [itemResponse, availabilityResponse] = await Promise.all([
          toolService.getToolById(id),
          rentalService.getItemAvailability(id)
        ]);
        setItem(itemResponse.item);
        setAvailability(availabilityResponse.bookedRanges || []);
        setCalendarWindow(availabilityResponse.calendarWindow || null);
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
    rentalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  const validDays = rentalDays > 0 ? rentalDays : 0;
  
  const basePrice = item ? item.pricePerDay * validDays : 0;
  const deposit = item ? item.depositAmount : 0;
  const extraCost = (addSkillSession && item?.offerSkillSession) ? item.skillSessionPrice : 0;

  const totalPrice = basePrice + extraCost;

  const toStartOfDay = (value) => {
    const d = new Date(value);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const toEndOfDay = (value) => {
    const d = new Date(value);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  };

  const toDateKey = (value) => {
    const d = toStartOfDay(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const calendarDayStatus = React.useMemo(() => {
    const dayStatus = new Map();

    const applyRange = (start, end, type) => {
      const cursor = toStartOfDay(start);
      const last = toEndOfDay(end);
      let guard = 0;
      while (cursor <= last && guard < 370) {
        if (cursor >= today && cursor <= endOfYear) {
          const key = toDateKey(cursor);
          const existing = dayStatus.get(key);
          if (existing !== "booked") {
            dayStatus.set(key, type);
          }
        }
        cursor.setDate(cursor.getDate() + 1);
        guard += 1;
      }
    };

    availability.forEach((slot) => {
      const slotType = slot.availabilityType;
      if (!slotType) return;
      const start = slot.effectiveStartTime || slot.actualStartTime || slot.startDate;
      const end = slot.effectiveEndTime || slot.actualEndTime || slot.endDate;
      if (!start || !end) return;
      applyRange(start, end, slotType);
    });

    return dayStatus;
  }, [availability]);

  const calendarMonths = React.useMemo(() => {
    const months = [];
    for (let month = today.getMonth(); month <= 11; month += 1) {
      const firstDay = new Date(today.getFullYear(), month, 1);
      const totalDays = new Date(today.getFullYear(), month + 1, 0).getDate();
      const leadingBlanks = firstDay.getDay();
      const days = [];

      for (let i = 0; i < leadingBlanks; i += 1) {
        days.push(null);
      }

      for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(today.getFullYear(), month, day);
        const key = toDateKey(date);
        days.push({
          key,
          day,
          isPast: date < today,
          status: calendarDayStatus.get(key) || null
        });
      }

      months.push({
        key: `${today.getFullYear()}-${month}`,
        label: firstDay.toLocaleString(undefined, { month: 'long', year: 'numeric' }),
        days
      });
    }

    return months;
  }, [calendarDayStatus, today, endOfYear]);

  const totalMonths = calendarMonths.length;

  const hasSelectionConflict = React.useMemo(() => {
    if (!startDate || !endDate) return false;
    const selectedStart = toStartOfDay(startDate);
    const selectedEnd = toEndOfDay(endDate);

    return availability.some((slot) => {
      if (slot.availabilityType !== "booked") return false;
      const slotStart = toStartOfDay(slot.effectiveStartTime || slot.actualStartTime || slot.startDate);
      const slotEnd = toEndOfDay(slot.effectiveEndTime || slot.actualEndTime || slot.endDate);
      return selectedStart <= slotEnd && selectedEnd >= slotStart;
    });
  }, [availability, startDate, endDate]);

  // ── Calendar date click handler (cinema-style selection) ─────────
  const handleDayClick = (dayKey, isPast, status) => {
    if (isPast) return;

    // If no start date yet, or both dates are already set → set as new start
    if (!startDate || (startDate && endDate)) {
      setStartDate(dayKey);
      setEndDate('');
      return;
    }

    // Start date is set, end date is not yet set
    if (startDate && !endDate) {
      if (dayKey < startDate) {
        // Clicked before start → swap: new click becomes start
        setStartDate(dayKey);
        setEndDate('');
      } else if (dayKey === startDate) {
        // Clicked same day → deselect
        setStartDate('');
        setEndDate('');
      } else {
        // Valid end date
        setEndDate(dayKey);
      }
    }
  };

  // Determine if a day is within the selected range
  const getDaySelectionState = (dayKey) => {
    if (!startDate) return null;
    if (dayKey === startDate && !endDate) return 'start-only';
    if (dayKey === startDate) return 'start';
    if (dayKey === endDate) return 'end';
    if (startDate && endDate && dayKey > startDate && dayKey < endDate) return 'in-range';
    return null;
  };

  const formatDisplayDate = (dateKey) => {
    if (!dateKey) return '—';
    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleResetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (validDays <= 0) {
      setError("End date cannot be before start date.");
      return;
    }

    if (hasSelectionConflict) {
      setError("Selected dates overlap with an already approved/active booking.");
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
      <div className="flex justify-center items-center min-h-[60vh] bg-[#ECEFF1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#191970]"></div>
      </div>
    );
  }

  if (!item) return <div className="text-center py-20 font-bold text-gray-500 bg-[#ECEFF1] min-h-screen">Item not found.</div>;

  const currentMonth = calendarMonths[visibleMonthIndex];

  return (
    <motion.div 
      className="w-full min-h-screen bg-[#ECEFF1] pb-24"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-black text-[#1A1A2E] tracking-tight mb-8 uppercase">
          <span className="text-[#191970]">Request</span> to rent
        </motion.h1>

        {error && (
          <motion.div variants={fadeUp} className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-[20px] font-bold text-sm">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT COLUMN: Inputs */}
          <motion.div variants={stagger} className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. Item Summary Card */}
            <motion.div variants={fadeUp} className="bg-white rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#ECEFF1] rounded-2xl overflow-hidden shrink-0">
                <img 
                  src={item.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A1A2E] leading-tight mb-1">{item.title}</h2>
                <p className="text-xs font-bold text-[#191970] uppercase tracking-tighter">Owner: {item.owner?.username}</p>
                <p className="text-xs font-bold text-[#191970] uppercase tracking-tighter mt-1">Category: {item.category?.name || item.category || 'Tool'}</p>
              </div>
            </motion.div>

            {/* 2. Date Picker Card — UPDATED */}
            <motion.div variants={fadeUp} className="bg-white rounded-[24px] p-6 sm:p-8">

              {/* Section heading */}
              <h3 className="font-black text-[#191970] mb-1 flex items-center gap-2 uppercase text-l tracking-widest">
                Available Timeline
              </h3>
              <p className="text-[12px] text-gray-900 font-bold uppercase tracking-widest mb-6">
                Select your rental start & end dates below
              </p>

              {/* Calendar card */}
              <div className="rounded-xl border border-gray-100 p-4 bg-white">

                {/* How-to note */}
                <p className="text-[12px] text-[#191970] font-bold bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4 leading-relaxed">
                  Tap a date to set your <span className="underline">start date</span>, then tap another date to set your <span className="underline">end date</span>. Tap a selected date again to reset.
                </p>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-[12px] font-black uppercase tracking-widest text-gray-900">
                  <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-red-100 border border-red-500"></div>Booked</span>
                  <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-yellow-100 border border-yellow-500"></div>Pending</span>
                  <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-gray-50 border border-gray-500"></div>Available</span>
                  <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-[#191970]"></div>Selected</span>
                </div>

                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => { setSlideDirection(-1); setVisibleMonthIndex((prev) => Math.max(0, prev - 1)); }}
                    disabled={visibleMonthIndex === 0}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xl transition-all ${
                      visibleMonthIndex === 0
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[#191970] text-white hover:bg-blue-700'
                    }`}
                  >
                    ↑
                  </button>

                  <p className="text-l font-black text-[#1A1A2E]">{currentMonth?.label}</p>

                  <button
                    type="button"
                    onClick={() => { setSlideDirection(1); setVisibleMonthIndex((prev) => Math.min(totalMonths - 1, prev + 1)); }}
                    disabled={visibleMonthIndex === totalMonths - 1}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xl transition-all ${
                      visibleMonthIndex === totalMonths - 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[#191970] text-white hover:bg-blue-700'
                    }`}
                  >
                    ↓
                  </button>
                </div>

                {/* Calendar grid */}
                <div className="overflow-hidden">
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    {currentMonth && (
                      <motion.div
                        key={currentMonth.key}
                        custom={slideDirection}
                        initial={{ opacity: 0, y: slideDirection * 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: slideDirection * -24 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="grid grid-cols-7 gap-1.5 text-[13px]"
                      >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={`header-${d}-${i}`} className="text-center text-[#191970] font-black h-7 flex items-center justify-center">{d}</div>
                    ))}
                    {currentMonth.days.map((day, idx) => {
                      if (!day) return <div key={`blank-${idx}`} className="h-7" />;

                      const selState = getDaySelectionState(day.key);
                      const isSelected = !!selState;
                      const isInRange = selState === 'in-range';
                      const isEndpoint = selState === 'start' || selState === 'end' || selState === 'start-only';
                      const isBooked = day.status === 'booked';
                      const isPending = day.status === 'pending';

                      let cellClasses = 'h-7 rounded border flex items-center justify-center font-bold transition-all ';

                      if (isEndpoint) {
                        cellClasses += 'bg-[#191970] text-white border-[#191970] ';
                      } else if (isInRange) {
                        cellClasses += 'bg-[#191970]/15 text-[#191970] border-[#191970]/20 ';
                      } else if (isBooked) {
                        cellClasses += 'bg-red-100 text-red-700 border-red-200 ';
                      } else if (isPending) {
                        cellClasses += 'bg-yellow-100 text-yellow-700 border-yellow-200 ';
                      } else {
                        cellClasses += 'bg-gray-50 text-gray-700 border-gray-100 ';
                      }

                      if (day.isPast) cellClasses += 'opacity-40 ';
                      if (!day.isPast && !isBooked) cellClasses += 'cursor-pointer hover:ring-2 hover:ring-[#191970]/40 ';
                      if (isBooked) cellClasses += 'cursor-not-allowed ';

                      return (
                        <div
                          key={`${currentMonth.key}-${day.key}`}
                          className={cellClasses}
                          onClick={() => !isBooked && handleDayClick(day.key, day.isPast, day.status)}
                          title={isBooked ? 'This date is already booked' : isPending ? 'This date has a pending request' : ''}
                        >
                          {day.day}
                        </div>
                      );
                    })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Selected date summary + reset */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAFAFA] rounded-xl border border-gray-300 px-4 py-3">
                  <p className="text-[12px] font-black text-gray-900 uppercase tracking-widest mb-1">Start Date</p>
                  <p className={`text-sm font-black ${startDate ? 'text-[#191970]' : 'text-gray-900'}`}>
                    {formatDisplayDate(startDate)}
                  </p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl border border-gray-300 px-4 py-3">
                  <p className="text-[12px] font-black text-gray-900 uppercase tracking-widest mb-1">End Date</p>
                  <p className={`text-sm font-black ${endDate ? 'text-[#191970]' : 'text-gray-900'}`}>
                    {formatDisplayDate(endDate)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDates}
                disabled={!startDate && !endDate}
                className={`mt-4 px-5 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                  startDate || endDate
                    ? 'bg-[#191970] text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Reset Selection
              </button>

              {hasSelectionConflict && (
                <p className="text-xs text-red-600 font-bold mt-4">Your selected range conflicts with a booked window.</p>
              )}
            </motion.div>

            {/* 3. Skill Session Card */}
            {item.offerSkillSession && (
              <motion.div 
                variants={fadeUp}
                className={`bg-white rounded-[24px] p-6 sm:p-8 flex items-center justify-between cursor-pointer transition-all duration-300 ${
                  addSkillSession ? 'ring-2 ring-[#191970] bg-[#191970]/5' : 'border border-gray-100'
                }`}
                onClick={() => setAddSkillSession(!addSkillSession)}
              >
                <div className="pr-4">
                  <h3 className="font-black text-[#191970] text-l uppercase tracking-widest flex items-center gap-2">
                    Add skill session
                  </h3>
                  <p className="text-sm text-gray-900 mt-2 font-medium leading-relaxed max-w-sm">
                    {item.skillSessionDescription || `Learn how to use this tool properly from ${item.owner?.username}.`}
                  </p>
                  <p className="text-[17px] font-black text-[#191970] mt-3 uppercase tracking-widest">+ PKR {item.skillSessionPrice}</p>
                </div>
                
                <div className={`w-14 h-7 rounded-full transition-colors relative flex-shrink-0 ${addSkillSession ? 'bg-[#191970]' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${addSkillSession ? 'translate-x-8' : 'translate-x-1'}`}></div>
                </div>
              </motion.div>
            )}

          </motion.div>

          {/* RIGHT COLUMN: Sidebar */}
          <motion.div variants={fadeUp} className="lg:col-span-1 flex flex-col gap-6 lg:self-stretch lg:sticky lg:top-6">
            <div className="bg-white rounded-[32px] p-8 flex flex-col min-h-[400px]">
              <h3 className="text-l font-black text-[#191970] mb-8 uppercase tracking-widest">Booking summary</h3>

              <div className="space-y-6 text-sm mb-8 flex-1">
                <div className="flex justify-between text-gray-900 font-bold">
                  <span>PKR {item.pricePerDay} x {validDays} days</span>
                  <span className="text-gray-900">PKR {basePrice}</span>
                </div>
                
                {/* Security deposit */}
                <div className="flex justify-between text-gray-900 font-bold items-start">
                  <div className="flex flex-col">
                    <span>Security deposit</span>
                    <span className="text-[9px] bg-blue-200 px-1.5 py-0.5 rounded text-[#191970] uppercase tracking-widest mt-1 w-max">
                      Conditional
                    </span>
                  </div>

                  {deposit > 0 ? (
                    <span className="text-gray-900 font-bold">PKR {deposit}</span>
                  ) : (
                    <span className="text-[#00875A] font-black uppercase text-[13px]">
                      Not required
                    </span>
                  )}
                </div>

                {addSkillSession && item.offerSkillSession && (
                  <div className="flex justify-between text-gray-900 font-bold uppercase tracking-tighter">
                    <span>Skill session</span>
                    <span>PKR {extraCost}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-black text-gray-900 uppercase text-[13px] tracking-widest mb-1.5">Total to pay</span>
                  <span className="text-3xl font-black text-[#191970] leading-none tracking-tight">PKR {totalPrice}</span>
                </div>

                <div className="bg-blue-50 text-[#191970] p-4 rounded-xl text-[12px] font-bold border border-blue-100 mb-6 leading-relaxed">
                  Payments are handled directly between renter and owner using the owner's preferred payment method (Easypaisa, JazzCash, bank transfer, etc.).
                  <br /><br />
                  SkillLabz does not process or hold payments. Please verify payment details carefully before sending money.
                </div>

                <motion.button 
                  whileHover={validDays > 0 && !hasSelectionConflict && !submitting ? { opacity: 0.9 } : {}}
                  whileTap={validDays > 0 && !hasSelectionConflict && !submitting ? { scale: 0.98 } : {}}
                  type="submit" 
                  disabled={validDays <= 0 || hasSelectionConflict || submitting}
                  className={`w-full py-4 rounded-[16px] text-xs uppercase tracking-widest font-black transition-all ${
                    validDays <= 0 || hasSelectionConflict 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#191970] text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Request to book'}
                </motion.button>

                <p className="text-center text-[10px] text-gray-600 font-black uppercase tracking-widest mt-5">
                  No charge until owner approves
                </p>
              </div>
            </div>

            {/* Message Card — moved to right column */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 flex flex-col flex-1">
              <h3 className="font-black text-[#191970] mb-4 uppercase text-l tracking-widest">Message to owner (optional)</h3>
              <textarea 
                placeholder="Tell the owner about your project..."
                value={renterNote}
                onChange={(e) => setRenterNote(e.target.value)}
                className="w-full flex-1 min-h-[80px] rounded-xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-[#191970]/40 focus:border-[#191970] bg-[#FAFAFA] text-m font-medium resize-none transition-all"
              ></textarea>
            </div>
          </motion.div>

        </form>
      </div>
    </motion.div>
  );
}