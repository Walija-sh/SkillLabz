import mongoose from "mongoose";
import User from "../models/User.js";
import Review from "../models/Review.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const toPlain = (doc) => {
  if (!doc) return null;
  if (typeof doc.toObject === "function") return doc.toObject({ virtuals: true });
  return doc;
};

const sanitizePublicUser = (userDoc) => {
  const user = toPlain(userDoc) || {};

  // Remove obvious sensitive fields. Anything else is returned as-is to avoid hard-coding schema.
  const sensitiveKeys = [
    "password",
    "email",
    "phone",
    "emailVerificationToken",
    "emailVerificationExpire",
    "passwordResetToken",
    "passwordResetExpire"
  ];

  for (const key of sensitiveKeys) {
    if (key in user) delete user[key];
  }

  // Always expose id in a consistent way
  user.id = user._id;
  delete user.__v;

  return user;
};

// GET /api/users/:id
export const getPublicUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid user id", 400));

  const user = await User.findById(id);
  if (!user) return next(new AppError("User not found", 404));

  const ratingAgg = await Review.aggregate([
    { $match: { reviewedUser: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: "$reviewedUser",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const ratingInfo = ratingAgg?.[0]
    ? {
        averageRating: ratingAgg[0].avgRating,
        reviewCount: ratingAgg[0].reviewCount
      }
    : { averageRating: null, reviewCount: 0 };

  const recentReviews = await Review.find({ reviewedUser: id })
    .populate("reviewer", "username profileImage")
    .sort("-createdAt")
    .limit(5);

  res.status(200).json({
    status: "success",
    user: sanitizePublicUser(user),
    rating: ratingInfo,
    recentReviews
  });
});

