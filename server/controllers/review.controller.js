import mongoose from "mongoose";
import Review from "../models/Review.js";
import Rental from "../models/Rental.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const clampRating = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
};

const userHasPath = (path) => Boolean(User?.schema?.path?.(path));

const recomputeAndPersistUserRatingIfSupported = async (reviewedUserId) => {
  // Only update if your User schema supports it (keeps existing code safe)
  const hasAverage = userHasPath("averageRating");
  const hasCount = userHasPath("reviewCount");
  const hasTotal = userHasPath("ratingTotal");
  if (!hasAverage && !hasCount && !hasTotal) return;

  const [agg] = await Review.aggregate([
    { $match: { reviewedUser: new mongoose.Types.ObjectId(reviewedUserId) } },
    {
      $group: {
        _id: "$reviewedUser",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
        total: { $sum: "$rating" }
      }
    }
  ]);

  const updates = {};
  if (hasAverage) updates.averageRating = agg ? agg.avgRating : 0;
  if (hasCount) updates.reviewCount = agg ? agg.count : 0;
  if (hasTotal) updates.ratingTotal = agg ? agg.total : 0;

  if (Object.keys(updates).length === 0) return;
  await User.findByIdAndUpdate(reviewedUserId, updates, { new: false });
};

// POST /api/reviews
export const createReview = catchAsync(async (req, res, next) => {
  // Input kept flexible; accept multiple common keys without enforcing a strict payload shape
  const rentalId = req.body.rentalId || req.body.rental || req.body.rental_id;
  const reviewedUserId = req.body.reviewedUserId || req.body.reviewedUser || req.body.userId || req.body.user;
  const rating = clampRating(req.body.rating);
  const comment = req.body.comment ?? req.body.text ?? "";

  if (!rentalId) return next(new AppError("rentalId is required", 400));
  if (!reviewedUserId) return next(new AppError("reviewedUserId is required", 400));
  if (rating === null) return next(new AppError("rating must be a number", 400));
  if (rating < 1 || rating > 5) return next(new AppError("rating must be between 1 and 5", 400));

  if (!mongoose.Types.ObjectId.isValid(rentalId) || !mongoose.Types.ObjectId.isValid(reviewedUserId)) {
    return next(new AppError("Invalid rentalId or reviewedUserId", 400));
  }

  // Ensure referenced docs exist
  const rental = await Rental.findById(rentalId);
  if (!rental) return next(new AppError("Rental not found", 404));

  const reviewedUser = await User.findById(reviewedUserId).select("_id");
  if (!reviewedUser) return next(new AppError("User not found", 404));

  // Ensure reviewer is part of the rental and is reviewing the other party
  const reviewerId = req.user?._id?.toString();
  const renterId = rental.renter?.toString?.();
  const ownerId = rental.owner?.toString?.();

  const isParticipant = reviewerId && (reviewerId === renterId || reviewerId === ownerId);
  if (!isParticipant) return next(new AppError("You are not allowed to review this rental", 403));

  const otherPartyId = reviewerId === renterId ? ownerId : renterId;
  if (!otherPartyId) return next(new AppError("Rental participants not found", 400));

  if (reviewedUserId.toString() !== otherPartyId.toString()) {
    return next(new AppError("You can only review the other party in this rental", 400));
  }

  // If your rental system supports completion status, enforce it safely
  if (rental.rentalStatus && rental.rentalStatus !== "completed") {
    return next(new AppError("You can only review after the rental is completed", 400));
  }

  // Prevent duplicates where possible
  const existing = await Review.findOne({
    rental: rental._id,
    reviewer: req.user._id,
    reviewedUser: reviewedUserId
  });
  if (existing) return next(new AppError("You already reviewed this rental", 409));

  const review = await Review.create({
    rental: rental._id,
    reviewer: req.user._id,
    reviewedUser: reviewedUserId,
    rating,
    comment
  });

  await recomputeAndPersistUserRatingIfSupported(reviewedUserId);

  res.status(201).json({
    status: "success",
    review
  });
});

// GET /api/reviews/:userId?page=&limit=
export const getReviewsForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 10), 50);
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(userId)) return next(new AppError("Invalid userId", 400));

  const userExists = await User.exists({ _id: userId });
  if (!userExists) return next(new AppError("User not found", 404));

  const [total, reviews] = await Promise.all([
    Review.countDocuments({ reviewedUser: userId }),
    Review.find({ reviewedUser: userId })
      .populate("reviewer", "username profileImage")
      .populate("rental", "item startDate endDate rentalStatus")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
  ]);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    reviews
  });
});

