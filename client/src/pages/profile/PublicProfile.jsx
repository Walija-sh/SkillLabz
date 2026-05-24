import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import publicUserService from "../../services/publicUser.service";
import chatService from "../../services/chat.service";

import Stars from "../../components/reviews/Stars";
import ReviewsSection from "../../components/reviews/ReviewsSection";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(
  (state) => state.auth.userData
);

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

  const ratingValue = useMemo(() => {
    const val = Number(rating?.averageRating);
    return Number.isFinite(val) ? val : 0;
  }, [rating]);
  const handleMessageUser = async () => {

  // User not logged in
  if (!currentUser) {
    navigate("/login");
    return;
  }

  // Prevent self-chat
  if (currentUser.id === user.id) {
    return;
  }

  try {

    const chatId =
      await chatService.createOrGetChat(
        currentUser.id,
        user.id
      );

    navigate(`/messages?chat=${chatId}`);

  } catch (error) {

    console.error("Failed to create chat:", error);
  }
};

const trustBadge = useMemo(() => {
  if (user?.identityVerificationStatus === "approved") {
    return {
      text: "Verified User",
      type: "verified",
      visible: true
    };
  }

  if (user?.isEmailVerified) {
    return {
      text: "Email Verified",
      type: "email",
      visible: true
    };
  }

  return { visible: false };
}, [user]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-gray-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Profile not available</h2>
        <p className="text-gray-500 font-medium mb-8">{error || "User not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 bg-gray-50/50 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <Link to="/browse-tools" className="text-sm font-black text-gray-900 hover:text-blue-600 uppercase tracking-widest">
            Browse Tools
          </Link>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center shadow-sm relative `}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover object-top" />
            ) : (
              <span className="text-4xl font-black text-gray-400 uppercase">{displayName.charAt(0) || "?"}</span>
            )}
            

          </div>


          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-black text-gray-900 capitalize">{displayName}</h1>
{trustBadge.visible && (
  <div
    className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-xs font-black uppercase tracking-wider rounded-full"
    style={
      trustBadge.type === "verified"
        ? {
            background: "linear-gradient(135deg, #f5d97a 0%, #e8b84b 40%, #f7e199 70%, #c9920a 100%)",
            color: "#7a4f00",
            border: "1px solid #d4a017",
            boxShadow: "0 1px 4px rgba(197,145,10,0.25), inset 0 1px 0 rgba(255,255,240,0.5)",
          }
        : {
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
          }
    }
  >
    {trustBadge.type === "verified" ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" style={{ filter: "drop-shadow(0 1px 1px rgba(120,70,0,0.2))" }}>
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3 justify-center sm:justify-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-700 text-xs font-black uppercase tracking-wider rounded-lg border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.02.01.006.004zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
                {displayLocation}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-black uppercase tracking-wider rounded-lg border border-yellow-100">
                <Stars value={ratingValue} />
                <span className="ml-1">
                  {rating?.reviewCount ? `${ratingValue.toFixed(1)} (${rating.reviewCount})` : "No ratings"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Bio</p>
              <p className="text-gray-800 font-medium leading-relaxed">
                {user?.bio || "No bio added yet."}
              </p>

            </div>
            <div className="mt-6 flex justify-center sm:justify-start">

  {currentUser?.id !== user.id && (

    <button
      onClick={handleMessageUser}
      className="
        px-6 py-3
        bg-blue-600 text-white
        rounded-2xl
        font-black uppercase tracking-wider
        hover:bg-blue-700
        transition-colors
      "
    >
      Message
    </button>

  )}

</div>
          </div>
        </div>

        {/* Reviews */}
        <ReviewsSection
          userId={id}
          initialReviews={recentReviews}
          initialTotal={rating?.reviewCount || 0}
        />
      </div>
    </div>
  );
}

