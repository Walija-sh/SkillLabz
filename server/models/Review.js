import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    // user who wrote the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must have a reviewer"]
    },
    // user being reviewed (public profile owner)
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must have a reviewed user"]
    },
    // rental linked to the review (when rental system exists)
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: [true, "Review must be linked to a rental"]
    },
    rating: {
      type: Number,
      required: [true, "Review must have a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"]
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
      default: ""
    }
  },
  { timestamps: true }
);

// Prevent duplicates for the same rental relationship
ReviewSchema.index({ rental: 1, reviewer: 1, reviewedUser: 1 }, { unique: true });
ReviewSchema.index({ reviewedUser: 1, createdAt: -1 });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;

