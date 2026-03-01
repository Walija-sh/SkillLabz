// utils/formatUserResponse.js

const formatUserResponse = (user, token = null) => {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    bio: user.bio,
    profileImage: user.profileImage,
    profileCompleted: user.profileCompleted,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    identityVerificationStatus: user.identityVerificationStatus,
    isBadgeVerified: user.isBadgeVerified,
    membershipType: user.membershipType,
    role: user.role,
    location: user.location,
    ...(token && { token })
  };
};

export default formatUserResponse;