import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { BsBuildingsFill, BsCashCoin } from "react-icons/bs";
import { MdPhoneAndroid, MdCreditCard } from "react-icons/md";

import publicUserService from "../../services/publicUser.service";
import chatService from "../../services/chat.service";

import Stars from "../../components/reviews/Stars";
import ReviewsSection from "../../components/reviews/ReviewsSection";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.userData);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await publicUserService.getPublicProfile(id);
        setProfile(data);
      } catch (e) {
        const msg =
          e?.message ||
          e?.response?.data?.message ||
          (typeof e === "string" ? e : "") ||
          "Failed to load profile.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const user = profile?.user || null;
  const rating = profile?.rating || {};
  const recentReviews = profile?.recentReviews || [];

  const avatarUrl = user?.profileImage?.url;
  const displayName = user?.username || "User";
  const city = user?.location?.city || "";
  const area = user?.location?.addressText || "";
  const displayLocation = city && area ? `${area}, ${city}` : city || area || "Location not set";
  const paymentMethods = user?.paymentMethods || [];

  const ratingValue = useMemo(() => {
    const val = Number(rating?.averageRating);
    return Number.isFinite(val) ? val : 0;
  }, [rating]);

  const handleMessageUser = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (currentUser.id === user.id) {
      return;
    }
    try {
      const chatId = await chatService.createOrGetChat(currentUser.id, user.id);
      navigate(`/messages?chat=${chatId}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const trustBadge = useMemo(() => {
    if (user?.identityVerificationStatus === "approved") {
      return { text: "Verified User", type: "verified", visible: true };
    }
    if (user?.isEmailVerified) {
      return { text: "Email Verified", type: "email", visible: true };
    }
    return { visible: false };
  }, [user]);

  const paymentConfig = {
    bank:             { icon: BsBuildingsFill,  color: "#191970", label: "Bank transfer"    },
    easypaisa:        { icon: MdPhoneAndroid,   color: "#00875A", label: "Easypaisa"        },
    jazzcash:         { icon: MdCreditCard,     color: "#f06424", label: "JazzCash"         },
    cash_on_delivery: { icon: BsCashCoin,       color: "#191970", label: "Cash on delivery" },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECEFF1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#191970]"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ECEFF1] px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-black text-[#1A1A2E] uppercase tracking-tight mb-2">Oops!</h2>
          <p className="text-gray-500 font-medium mb-8">{error || "User profile not found."}</p>
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

  return (
    <motion.div 
      className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 bg-[#ECEFF1] flex justify-center pb-24"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <div className="w-full max-w-3xl space-y-8">

        {/* Combined Profile & Reviews Card */}
        <motion.div variants={fadeUp} className="bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-gray-100">
          
          {/* Top Section: Profile Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
            {/* Avatar */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden flex items-center justify-center shadow-sm border-4 border-white bg-gray-50 shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-4xl font-black text-gray-400 uppercase">{displayName.charAt(0) || "?"}</span>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center sm:text-left w-full">
              <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A2E] capitalize tracking-tight mb-2">
                {displayName}
              </h1>
              
              {trustBadge.visible && (
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 mt-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                    trustBadge.type === "verified"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-[#00875A]/10 text-[#00875A] border-[#00875A]/20"
                  }`}
                >
                  {trustBadge.type === "verified" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                  )}
                  {trustBadge.text}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-4 justify-center sm:justify-start">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#191970]/5 text-[#191970] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#191970]/10">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                  {displayLocation}
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-100">
                  <Stars value={ratingValue} />
                  <span className="ml-0.5">
                    {rating?.reviewCount ? `${ratingValue.toFixed(1)} (${rating.reviewCount})` : "No ratings"}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-2">Bio</p>
                <p className="text-[#1A1A2E]/80 font-medium leading-relaxed text-sm sm:text-base">
                  {user?.bio || "No bio added yet."}
                </p>
              </div>

              {paymentMethods.length > 0 && (
                <div className="mt-8">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-3">
                    Accepted Payment Methods
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {paymentMethods.map((pm) => {
                      const config = paymentConfig[pm.type] || {
                        icon: BsCashCoin,
                        color: "#191970",
                        label: pm.type.replaceAll("_", " ")
                      };
                      const Icon = config.icon;

                      return (
                        <div
                          key={pm._id || pm.id}
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FAFAFA] border border-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-colors hover:border-[#191970]/20 hover:bg-[#191970]/5"
                        >
                          <Icon size={14} color={config.color} />
                          {config.label.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-center sm:justify-start w-full">
                {currentUser?.id !== user.id && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMessageUser}
                    className="w-full sm:w-auto px-10 py-4 bg-[#191970] text-white rounded-[16px] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-[#191970]/20"
                  >
                    Message
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gray-100 my-10"></div>

          {/* Bottom Section: Reviews */}
          <div className="w-full">
            <ReviewsSection
              userId={id}
              initialReviews={recentReviews}
              initialTotal={rating?.reviewCount || 0}
            />
          </div>
          
        </motion.div>
      </div>
    </motion.div>
  );
}