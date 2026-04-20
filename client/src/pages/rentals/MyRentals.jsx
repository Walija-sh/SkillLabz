import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import rentalService from '../../services/rental.service';
import reviewService from "../../services/review.service";
import Stars from "../../components/reviews/Stars";

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, rental: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: "", text: "" });
  const [otpModal, setOtpModal] = useState({ open: false, rental: null, type: null }); // type: handover|return
  const [otpValue, setOtpValue] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpMessage, setOtpMessage] = useState({ type: "", text: "" });
  
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

  const openReviewModal = (rental) => {
    setReviewMessage({ type: "", text: "" });
    setReviewForm({ rating: 5, comment: "" });
    setReviewModal({ open: true, rental });
  };

  const closeReviewModal = () => {
    setReviewModal({ open: false, rental: null });
    setReviewMessage({ type: "", text: "" });
    setIsSubmittingReview(false);
  };

  const submitReview = async () => {
    const rental = reviewModal.rental;
    if (!rental?._id) return;

    // For "My Rentals" (renter perspective) you review the owner
    const reviewedUserId = rental.owner;
    if (!reviewedUserId) {
      setReviewMessage({ type: "error", text: "Owner not found for this rental." });
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage({ type: "", text: "" });
    try {
      await reviewService.createReview({
        rentalId: rental._id,
        reviewedUserId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      });
      setReviewMessage({ type: "success", text: "Review submitted successfully." });
      // keep modal open briefly so user sees confirmation
      setTimeout(() => closeReviewModal(), 700);
    } catch (err) {
      setReviewMessage({ type: "error", text: err?.message || "Failed to submit review." });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openOtpModal = (type, rental) => {
    setOtpModal({ open: true, rental, type });
    setOtpValue("");
    setOtpSubmitting(false);
    setOtpMessage({ type: "", text: "" });
  };

  const closeOtpModal = () => {
    setOtpModal({ open: false, rental: null, type: null });
    setOtpValue("");
    setOtpSubmitting(false);
    setOtpMessage({ type: "", text: "" });
  };

  const submitOtp = async () => {
    const rental = otpModal.rental;
    if (!rental?._id) return;
    if (!otpValue) {
      setOtpMessage({ type: "error", text: "OTP is required." });
      return;
    }

    setOtpSubmitting(true);
    setOtpMessage({ type: "", text: "" });
    try {
      const updated =
        otpModal.type === "handover"
          ? await rentalService.verifyHandoverOtp(rental._id, otpValue)
          : await rentalService.verifyReturnOtp(rental._id, otpValue);

      // Update local list status immediately
      setRentals((prev) =>
        prev.map((r) => (r._id === rental._id ? { ...r, rentalStatus: updated.rental.rentalStatus } : r))
      );

      setOtpMessage({ type: "success", text: "Verified successfully." });
      setTimeout(() => closeOtpModal(), 700);
    } catch (err) {
      setOtpMessage({ type: "error", text: err?.message || "Failed to verify OTP." });
    } finally {
      setOtpSubmitting(false);
    }
  };

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

                  {/* OTP verification happens via action buttons below */}
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

                {/* OTP actions */}
                {rental.rentalStatus === "approved" && (
                  <button
                    onClick={() => openOtpModal("handover", rental)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-colors uppercase tracking-widest"
                  >
                    Enter Handover OTP
                  </button>
                )}

                {rental.rentalStatus === "active" && (
                  <button
                    onClick={() => openOtpModal("return", rental)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-colors uppercase tracking-widest"
                  >
                    Enter Return OTP
                  </button>
                )}

                {/* Reviews (only after completion) */}
                {rental.rentalStatus === "completed" && (
                  <>
                    <Link
                      to={rental.owner ? `/users/${rental.owner}` : "#"}
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    >
                      View Owner Profile
                    </Link>
                    <button
                      onClick={() => openReviewModal(rental)}
                      className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-colors uppercase tracking-widest"
                    >
                      Leave Review
                    </button>
                  </>
                )}
                
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

      {/* Review modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Leave a Review</h3>
                <p className="text-gray-500 font-medium mt-1">
                  For: <span className="font-bold text-gray-900">{reviewModal.rental?.item?.title || "Rental"}</span>
                </p>
              </div>
              <button onClick={closeReviewModal} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reviewMessage.text && (
              <div
                className={`mb-5 p-4 rounded-2xl border font-bold ${
                  reviewMessage.type === "success"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {reviewMessage.text}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Rating</p>
                <div className="flex items-center gap-3">
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))}
                    className="w-32 px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-blue-600 outline-none font-bold"
                  >
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <Stars value={Number(reviewForm.rating)} />
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Comment (optional)</p>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  rows={4}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-blue-600 outline-none font-medium resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  disabled={isSubmittingReview}
                  onClick={submitReview}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  disabled={isSubmittingReview}
                  onClick={closeReviewModal}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP modal */}
      {otpModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {otpModal.type === "handover" ? "Verify Handover OTP" : "Verify Return OTP"}
                </h3>
                <p className="text-gray-500 font-medium mt-1">
                  Tool: <span className="font-bold text-gray-900">{otpModal.rental?.item?.title || "Rental"}</span>
                </p>
              </div>
              <button onClick={closeOtpModal} className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {otpMessage.text && (
              <div
                className={`mb-5 p-4 rounded-2xl border font-bold ${
                  otpMessage.type === "success"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {otpMessage.text}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">OTP</p>
                <input
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white focus:border-blue-600 outline-none font-black tracking-widest text-gray-900"
                />
                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                  Ask the owner for the OTP shown on their dashboard.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  disabled={otpSubmitting}
                  onClick={submitOtp}
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
                >
                  {otpSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  disabled={otpSubmitting}
                  onClick={closeOtpModal}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}