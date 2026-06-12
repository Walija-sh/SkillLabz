import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import rentalService from "../../services/rental.service";
import { useSelector } from "react-redux";
import ContractView from "../../components/rentals/ContractView";
import { motion } from "framer-motion";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function RentalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.userData?._id);
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreeError, setAgreeError] = useState("");
  const [agreeLoading, setAgreeLoading] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await rentalService.getRentalById(id);
        setRental(response.rental);
      } catch (err) {
        setError(err?.message || "Failed to load rental details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [id]);

  const handleAgree = async () => {
    setAgreeError("");
    setAgreeLoading(true);
    try {
      const response = await rentalService.agreeContract(id);
      setRental(response.rental);
    } catch (err) {
      setAgreeError(err?.message || "Failed to confirm contract.");
    } finally {
      setAgreeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECEFF1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#191970]"></div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ECEFF1] px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-2">Oops!</h2>
          <p className="text-gray-500 font-medium mb-8">{error || "Rental not found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-[#191970] text-white rounded-[16px] text-xs font-black uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-xl shadow-[#191970]/20"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const ownerId = rental?.owner?._id || rental?.owner;
  const renterId = rental?.renter?._id || rental?.renter;
  const isRenter = String(renterId) === String(userId);

  return (
    <motion.div 
      className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 bg-[#ECEFF1] flex justify-center pb-24"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-4xl space-y-8">

        {/* Header Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 sm:items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-blue-600 tracking-tight mb-2">Rental <span className="text-black">Details</span></h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm font-medium text-gray-500">
              <p>
                Item:{" "}
                {rental?.item?._id ? (
                  <Link to={`/items/${rental.item._id}`} className="text-[#191970] font-bold hover:underline">
                    {rental.item?.title || "View item"}
                  </Link>
                ) : (
                  <span className="text-gray-400">Item unavailable</span>
                )}
              </p>
              <span className="hidden sm:inline text-gray-300">•</span>
              <p>
                Owner:{" "}
                {ownerId ? (
                  <Link to={`/users/${ownerId}`} className="text-[#191970] font-bold hover:underline">
                    {rental?.owner?.username || rental?.owner?.fullName || "Owner"}
                  </Link>
                ) : (
                  <span className="text-gray-400">Deleted user</span>
                )}
              </p>
              <span className="hidden sm:inline text-gray-300">•</span>
              <p>
                Renter:{" "}
                {renterId ? (
                  <Link to={`/users/${renterId}`} className="text-[#191970] font-bold hover:underline">
                    {rental?.renter?.username || rental?.renter?.fullName || "Renter"}
                  </Link>
                ) : (
                  <span className="text-gray-400">Deleted user</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contract Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-8">Contract</h2>
          
          <ContractView
            rental={rental}
            isRenter={isRenter}
            onAgree={handleAgree}
            submitting={agreeLoading}
            agreementError={agreeError}
          />
        </motion.div>

      </div>
    </motion.div>
  );
}