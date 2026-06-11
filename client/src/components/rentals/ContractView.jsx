import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ContractView({
  rental,
  isRenter,
  onAgree,
  submitting = false,
  agreementError = "",
}) {
  const [agreed, setAgreed] = useState(false);
  const contract = rental?.contract || {};

  const canAgree =
    isRenter && rental?.rentalStatus === "approved" && !contract?.agreedAt;

  useEffect(() => {
    setAgreed(false);
  }, [rental?._id]);

  const baseLines = useMemo(() => {
    return String(contract.baseTerms || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [contract.baseTerms]);

  const formattedStartDate = rental?.startDate
    ? new Date(rental.startDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })
    : "-";

  const formattedEndDate = rental?.endDate
    ? new Date(rental.endDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })
    : "-";

  const agreedDate = contract?.agreedAt
    ? new Date(contract.agreedAt).toLocaleString()
    : null;

  return (
    <div className="relative w-full">
      {/* Scoped CSS:
        Applying styles strictly to '.custom-contract-scrollbar' prevents it from 
        leaking to the outer modal, fixing the weird overlapping corner issue. 
      */}
      <style>{`
        .custom-contract-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-contract-scrollbar::-webkit-scrollbar-track {
          background: #191970;
          border-radius: 10px;
        }
        .custom-contract-scrollbar::-webkit-scrollbar-thumb {
          background: #ECEFF1;
          border-radius: 10px;
          border: 2px solid #191970;
        }
        /* Firefox support */
        .custom-contract-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #ECEFF1 #191970;
        }
      `}</style>

      {/* Internal Scrolling Container */}
      <div className="custom-contract-scrollbar overflow-y-auto max-h-[60vh] pr-4 sm:pr-6 pb-4 space-y-6">
        
        {/* 1. Rental Details */}
        <motion.section 
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="bg-[#FAFAFA] rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Rental Details</p>
          <h3 className="text-lg font-black text-[#1A1A2E] leading-tight">
            {rental?.item?.title || "Item unavailable"}
          </h3>
          <p className="text-sm font-bold text-[#191970] mt-2">
            {formattedStartDate} — {formattedEndDate}
          </p>
        </motion.section>

        {/* 2. Payment */}
        <motion.section 
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="bg-[#FAFAFA] rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Payment & Deposit</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Price per day</span>
              <span className="font-bold text-[#1A1A2E]">Rs. {rental?.pricePerDay || 0}</span>
            </div>
            {Number(rental?.skillSessionPrice) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Skill Session</span>
                <span className="font-bold text-[#191970]">+ Rs. {rental.skillSessionPrice}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Security Deposit</span>
              <span className="font-bold text-[#1A1A2E]">Rs. {rental?.depositAmount || 0}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]">Total Amount</span>
              <span className="text-xl font-black text-[#00875A]">Rs. {rental?.totalPrice || 0}</span>
            </div>
          </div>
        </motion.section>

        {/* 3. Responsibilities */}
        <motion.section 
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="bg-[#FAFAFA] rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Responsibilities & Rules</p>
          {baseLines.length > 0 ? (
            <ul className="space-y-2">
              {baseLines.map((line, index) => (
                <li key={index} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                  <span className="text-[#191970] font-black mt-0.5">•</span>
                  {line.replace(/^-+\s*/, "")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No standard terms found.</p>
          )}
        </motion.section>

        {/* 4. Additional Terms */}
        <motion.section 
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="bg-[#FAFAFA] rounded-2xl p-5 border border-gray-100"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Additional Terms from Owner</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {contract.additionalTerms || "No additional terms were added by owner."}
          </p>
        </motion.section>

        {/* 5. Agreement Footer */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          {contract?.agreedAt ? (
            <div className="bg-[#00875A]/10 border border-[#00875A]/20 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00875A] flex items-center justify-center text-white shrink-0">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-black text-[#00875A] uppercase tracking-tight">Contract Verified</p>
                  <p className="text-xs text-[#00875A]/70 font-bold mt-0.5">Agreed on {agreedDate}</p>
                </div>
              </div>
            </div>
          ) : canAgree ? (
            <div className="pt-2 space-y-6">
              {/* Custom Styled Checkbox */}
              <div 
                className={`p-5 rounded-[16px] border transition-all cursor-pointer flex items-start gap-4 ${
                  agreed ? 'bg-[#191970]/5 border-[#191970]/30' : 'bg-white border-gray-200'
                }`}
                onClick={() => setAgreed(!agreed)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                  agreed ? 'bg-[#191970] border-[#191970]' : 'bg-white border-gray-300'
                }`}>
                  {agreed && (
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-bold text-[#1A1A2E] leading-relaxed">
                  I confirm that I have read and agreed to all rental terms, responsibilities, deposit conditions, and return policies.
                </span>
              </div>

              {agreementError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl p-4 uppercase tracking-widest">
                  {agreementError}
                </div>
              )}

              <button
                type="button"
                disabled={!agreed || submitting}
                onClick={onAgree}
                className="w-full py-4 rounded-[16px] bg-[#191970] text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#191970]/20 hover:bg-blue-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? "Confirming..." : "Agree & Confirm Contract"}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-2xl p-5 text-center">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                 Contract is awaiting agreement or approval
               </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}