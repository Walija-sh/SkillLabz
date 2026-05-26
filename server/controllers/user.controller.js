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
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;

  // -------------------------
  // REMOVE SENSITIVE FIELDS ONLY
  // -------------------------
  delete user.password;
  delete user.email;
  delete user.phone;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  delete user.passwordResetToken;
  delete user.passwordResetExpire;

  // -------------------------
  // KEEP SAME STRUCTURE, ONLY SANITIZE paymentMethods
  // -------------------------
  if (Array.isArray(user.paymentMethods)) {
    user.paymentMethods = user.paymentMethods.map((pm) => ({
      _id: pm._id,
      title: pm.title,
      type: pm.type,

      // SAFE PUBLIC FIELDS ONLY
      bankName: pm.bankName || "",
      iban: pm.iban ? `****${pm.iban.slice(-4)}` : "",
      instructions: pm.instructions || "",
      isActive: pm.isActive
    }));
  }

  // -------------------------
  // KEEP SAME SHAPE (DO NOT BREAK FRONTEND)
  // -------------------------
  user.id = user._id;

  return user;
};

// GET /api/users/:id
export const getPublicUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError("Invalid user id", 400));

  const user = await User.findById(id).lean();
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

// POST /api/users/payment-methods
export const addPaymentMethod = catchAsync(async (req, res, next) => {
 
  const {
    title,
    type,
    accountTitle,
    accountNumber,
    bankName,
    iban,
    instructions
  } = req.body;

  if (!title || !type) {
    return next(
      new AppError("Title and type are required", 400)
    );
  }

  // -------------------------
  // TYPE VALIDATION
  // -------------------------

  if (type === "bank") {
    if (!bankName || !iban) {
      return next(
        new AppError(
          "Bank name and IBAN are required",
          400
        )
      );
    }
  }

  if (
    type === "easypaisa" ||
    type === "jazzcash"
  ) {
    if (!accountTitle || !accountNumber) {
      return next(
        new AppError(
          "Account title and number are required",
          400
        )
      );
    }
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // -------------------------
  // LIMIT
  // -------------------------

  if (user.paymentMethods.length >= 10) {
    return next(
      new AppError(
        "Maximum 10 payment methods allowed",
        400
      )
    );
  }

  // -------------------------
  // DUPLICATE CHECK
  // -------------------------

  const alreadyExists = user.paymentMethods.some(
    (method) =>
      method.type === type &&
      method.accountNumber === accountNumber
  );

  if (alreadyExists) {
    return next(
      new AppError(
        "Payment method already exists",
        400
      )
    );
  }

  user.paymentMethods.push({
    title,
    type,
    accountTitle,
    accountNumber,
    bankName,
    iban,
    instructions
  });

  
  
  await user.save();


  res.status(200).json({
    status: "success",
    message: "Payment method added successfully",
    paymentMethods: user.paymentMethods
  });
});

// PATCH /api/users/payment-methods/:paymentMethodId
export const updatePaymentMethod = catchAsync(async (req, res, next) => {
  const { paymentMethodId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const paymentMethod = user.paymentMethods.id(paymentMethodId);

  if (!paymentMethod) {
    return next(new AppError("Payment method not found", 404));
  }

  // -------------------------
  // ALLOWED FIELDS ONLY
  // -------------------------
  const allowedFields = [
    "title",
    "type",
    "accountTitle",
    "accountNumber",
    "bankName",
    "iban",
    "instructions",
    "isActive"
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      paymentMethod[field] = req.body[field];
    }
  });

  // -------------------------
  // VALIDATION
  // -------------------------

  if (!paymentMethod.title || !paymentMethod.type) {
    return next(
      new AppError("Title and type are required", 400)
    );
  }

  if (paymentMethod.type === "bank") {
    if (!paymentMethod.bankName || !paymentMethod.iban) {
      return next(
        new AppError(
          "Bank name and IBAN are required",
          400
        )
      );
    }
  }

  if (
    paymentMethod.type === "easypaisa" ||
    paymentMethod.type === "jazzcash"
  ) {
    if (
      !paymentMethod.accountTitle ||
      !paymentMethod.accountNumber
    ) {
      return next(
        new AppError(
          "Account title and account number are required",
          400
        )
      );
    }
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Payment method updated successfully",
    paymentMethods: user.paymentMethods
  });
});
// DELETE /api/users/payment-methods/:paymentMethodId
export const deletePaymentMethod = catchAsync(async (req, res, next) => {
  const { paymentMethodId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.paymentMethods = user.paymentMethods.filter(
    (method) => method._id.toString() !== paymentMethodId
  );

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Payment method deleted successfully",
    paymentMethods: user.paymentMethods
  });
});
// GET /api/users/me/payment-methods
export const getMyPaymentMethods = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    paymentMethods: user.paymentMethods
  });
});