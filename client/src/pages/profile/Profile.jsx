import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom'; 
import Button from '../../components/common/Button';
import userService from '../../services/user.service'; // Brought in the service!

export default function Profile() {
  const navigate = useNavigate();
  
  // Grab the logged-in user's data from Redux
  const { userData: user } = useSelector((state) => state.auth);

  // Verification UI State
  const [isSending, setIsSending] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState({ type: '', text: '' });

  // 1. Wait for user data to load
  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  // 2. THE BOUNCER: If they haven't completed their profile, force them to do it
  if (!user.profileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Safely extract location data based on your backend structure
  const city = user?.location?.city || '';
  const area = user?.location?.addressText || '';
  const displayLocation = city && area ? `${area}, ${city}` : 'Location not set';

  // ID verification badge metadata (UI-only)
  const idBadge = (() => {
    const status = user?.identityVerificationStatus;
    switch (status) {
      case 'approved':
        return {
          text: 'ID Verified',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 11.586 7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'pending':
        return {
          text: 'ID Verification Pending',
          classes: 'bg-amber-50 text-amber-700 border-amber-100',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7h2v5H9V7zm0 6h2v2H9v-2z" />
            </svg>
          )
        };
      case 'rejected':
        return {
          text: 'ID Verification Rejected',
          classes: 'bg-red-50 text-red-700 border-red-100',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2.5-9.5a1 1 0 011.414-1.414L10 8.586l1.086-1.5a1 1 0 011.414 1.414L11.414 10l1.086 1.086a1 1 0 01-1.414 1.414L10 11.414l-1.086 1.086a1 1 0 01-1.414-1.414L8.586 10 7.5 8.914z" clipRule="evenodd" />
            </svg>
          )
        };
      default:
        return {
          text: 'ID Not Verified',
          classes: 'bg-gray-100 text-gray-600 border-gray-100',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 2a6 6 0 100 12A6 6 0 0010 2zM2 18a8 8 0 0116 0H2z" />
            </svg>
          )
        };
    }
  })();

  // Email Verification Handler
  const handleVerifyEmail = async () => {
    setIsSending(true);
    setVerifyMessage({ type: '', text: '' });

    try {
      await userService.sendVerificationEmail();
      setVerifyMessage({ 
        type: 'success', 
        text: 'Verification link sent! Please check your inbox.' 
      });
    } catch (error) {
      setVerifyMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send email. Try again later.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 bg-gray-50/50 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          
          {/* Profile Photo Area */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 flex items-center justify-center shadow-sm">
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} alt={user.username || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-gray-400 uppercase">
                  {user?.username?.charAt(0) || '?'}
                </span>
              )}
            </div>
            {/* Edit Photo Button */}
            <button 
              onClick={() => navigate('/complete-profile')}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Change Photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
              </svg>
            </button>
          </div>

          {/* User Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-black text-gray-900 capitalize">
              {user?.username || 'Anonymous User'}
            </h1>
            <p className="text-gray-500 font-medium mt-1">{user?.email}</p>
            
            <div className="mt-4 flex flex-col items-center sm:items-start gap-2">
              {user?.isEmailVerified ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" /></svg>
                  Email Verified
                </div>
              ) : (
                <div className="text-yellow-600 bg-yellow-50 border-yellow-100 px-2 py-0.5 rounded">Unverified Email</div>
              )}

              {/* Identity verification badge (stacked under email badge) */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full border ${idBadge.classes}`}>
                {idBadge.icon}
                <span>{idBadge.text}</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <Button 
            onClick={() => navigate('/complete-profile')} 
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-gray-700 hover:bg-gray-200 shadow-none border border-gray-200"
          >
            Edit Details
          </Button>
        </div>

        {/* Detailed Info Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">About Me</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Bio</p>
              <p className="text-gray-800 font-medium leading-relaxed">
                {user?.bio || "No bio added yet. Tell the community about yourself!"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Phone</p>
                <p className="text-gray-800 font-medium">{user?.phone || "Not provided"}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Location</p>
                <p className="text-gray-800 font-medium capitalize">
                  {displayLocation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security & Email Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Account Security</h2>
          
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Registered Email</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-800 font-medium">{user?.email}</p>
              
              {/* Only show the verify button if they are NOT verified */}
              {!user?.isEmailVerified && (
                <Button 
                  onClick={handleVerifyEmail} 
                  isLoading={isSending}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none text-sm"
                >
                  Verify Email
                </Button>
              )}
            </div>

            {/* Success/Error Feedback Message */}
            {verifyMessage.text && (
              <p className={`mt-3 text-sm font-bold ${verifyMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {verifyMessage.text}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}