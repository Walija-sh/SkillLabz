import VerificationRequest from "../models/VerificationRequest.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import mongoose from "mongoose";

const submitVerificationRequest = catchAsync(async (req, res, next) => {

  const user = req.user;

  // ❌ already verified
  if (user.identityVerificationStatus === "approved") {
    return next(new AppError("User already verified", 400));
  }

  // ❌ prevent duplicate pending request
  const existingRequest = await VerificationRequest.findOne({
    user: user._id,
    status: "pending"
  });

  if (existingRequest) {
    return next(new AppError("Verification already under review", 400));
  }

  const { fullName, cnicNumber, dateOfBirth } = req.body;

  if (!req.files?.cnicFront || !req.files?.cnicBack || !req.files?.selfie) {
    return next(new AppError("All verification images required", 400));
  }

  const request = await VerificationRequest.create({
    user: user._id,

    cnicFront: {
      public_id: req.files.cnicFront[0].filename,
      url: req.files.cnicFront[0].path
    },

    cnicBack: {
      public_id: req.files.cnicBack[0].filename,
      url: req.files.cnicBack[0].path
    },

    selfie: {
      public_id: req.files.selfie[0].filename,
      url: req.files.selfie[0].path
    },

    fullName,
    cnicNumber,
    dateOfBirth
  });

  user.identityVerificationStatus = "pending";
  await user.save();

  res.status(201).json({
    status: "success",
    message: "Verification submitted successfully",
    data: request
  });

});

const getPendingRequests = catchAsync(async (req, res, next) => {

  const requests = await VerificationRequest
    .find({ status: "pending" })
    .populate("user", "username email profileImage");

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: requests
  });

});

const approveVerification = catchAsync(async (req, res, next) => {

  const session = await mongoose.startSession();

  session.startTransaction();

  try {

    const request = await VerificationRequest
      .findById(req.params.id)
      .session(session);

    if (!request)
      throw new AppError("Request not found", 404);

    if (request.status !== "pending")
      throw new AppError("Request already reviewed", 400);

    const user = await User
      .findById(request.user)
      .session(session);

    // ✅ update request
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = Date.now();

    await request.save({ session });

    // ✅ update user
    user.identityVerificationStatus = "approved";
    user.isBadgeVerified = true;
    user.badgeType = "trusted";

    await user.save({ session });

    // ✅ commit both
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "User verified successfully"
    });

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    next(err);
  }
});

const rejectVerification = catchAsync(async (req, res, next) => {

  const session = await mongoose.startSession();

  session.startTransaction();

  try {

    const { reason } = req.body;

    const request = await VerificationRequest
      .findById(req.params.id)
      .session(session);

    if (!request)
      throw new AppError("Request not found", 404);

    if (request.status !== "pending")
      throw new AppError("Request already reviewed", 400);

    const user = await User
      .findById(request.user)
      .session(session);

    request.status = "rejected";
    request.adminNotes = reason;
    request.reviewedBy = req.user._id;
    request.reviewedAt = Date.now();

    await request.save({ session });

    user.identityVerificationStatus = "rejected";
    user.isBadgeVerified = false;
    user.badgeType = null;

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Verification rejected"
    });

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    next(err);
  }
});

export {approveVerification,rejectVerification,getPendingRequests,submitVerificationRequest}