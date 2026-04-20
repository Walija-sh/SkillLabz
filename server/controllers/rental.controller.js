/**
 * RENTAL CONTROLLER
 * Handles all lifecycle events for tool rentals:
 * Creating requests, approving/rejecting, and completing hand-offs.
 * Last updated to include Skill Session logic.
 */


// UPDATED: 2026-03-15
import Rental from "../models/Rental.js";
import Item from "../models/Item.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";

const OTP_TTL_MINUTES = 10;

const generateNumericOtp = (digits = 4) => {
  const len = Math.max(4, Math.min(6, Number(digits) || 4));
  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

const performStartRental = async (rental) => {
  const item = await Item.findById(rental.item);
  if (item) {
    item.isAvailable = false;
    await item.save();
  }
  rental.rentalStatus = "active";
  await rental.save();
  return rental;
};

const performCompleteRental = async (rental) => {
  const item = await Item.findById(rental.item);
  if (item) {
    item.isAvailable = true;
    await item.save();
  }
  rental.rentalStatus = "completed";
  await rental.save();
  return rental;
};

// -------------------------
// CREATE RENTAL REQUEST
// -------------------------

export const createRental = catchAsync(async (req, res, next) => {
  // ✅ ADDED: includesSkillSession coming from your Rental Page form
  const { itemId, startDate, endDate, renterNote, includesSkillSession } = req.body;

  const item = await Item.findById(itemId);

  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  if (!item.isAvailable) {
    return next(new AppError("Item is currently unavailable", 400));
  }

  if (item.owner.toString() === req.user._id.toString()) {
    return next(new AppError("You cannot rent your own item", 400));
  }

  const existingRequest = await Rental.findOne({
    item: itemId,
    renter: req.user._id,
    rentalStatus: "pending"
  });

  if (existingRequest) {
    return next(
      new AppError("You already have a pending request for this item", 400)
    );
  }

  // ✅ Updated to snapshot Skill Session data
  const rental = await Rental.create({
    item: item._id,
    renter: req.user._id,
    owner: item.owner,
    startDate,
    endDate,
    pricePerDay: item.pricePerDay,
    depositAmount: item.depositAmount,
    // Snapshot the user's choice and the price at this exact moment
    includesSkillSession: includesSkillSession || false,
    skillSessionPrice: item.skillSessionPrice || 0, 
    renterNote
  });

  res.status(201).json({
    status: "success",
    rental
  });
});

// -------------------------
// GET MY RENTALS (RENTER)
// -------------------------

export const getMyRentals = catchAsync(async (req, res, next) => {
  const rentals = await Rental.find({ renter: req.user._id })
    .populate("item", "title images pricePerDay")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: rentals.length,
    rentals
  });
});

// -------------------------
// GET OWNER RENTAL REQUESTS
// -------------------------

export const getOwnerRentals = catchAsync(async (req, res, next) => {
  const rentals = await Rental.find({ owner: req.user._id })
    .populate("item", "title images")
    .populate("renter", "username profileImage")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: rentals.length,
    rentals
  });
});

// -------------------------
// APPROVE RENTAL
// -------------------------

export const approveRental = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return next(new AppError("Rental not found", 404));
  if (rental.owner.toString() !== req.user._id.toString())
    return next(new AppError("Not authorized", 403));
  if (!rental.canBeApproved())
    return next(new AppError("Rental cannot be approved", 400));

  const conflict = await Rental.findOne({
    item: rental.item,
    rentalStatus: { $in: ["approved", "active"] },
    _id: { $ne: rental._id },
    startDate: { $lte: rental.endDate },
    endDate: { $gte: rental.startDate }
  });

  if (conflict) {
    return next(new AppError("Item already booked for these dates", 400));
  }

  rental.rentalStatus = "approved";
  await rental.save();

  res.status(200).json({
    status: "success",
    rental
  });
});

// -------------------------
// REJECT RENTAL
// -------------------------

export const rejectRental = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) {
    return next(new AppError("Rental not found", 404));
  }

  if (rental.owner.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  rental.rentalStatus = "rejected";
  await rental.save();

  res.status(200).json({
    status: "success",
    rental
  });
});

// -------------------------
// START RENTAL
// -------------------------

export const startRental = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) {
    return next(new AppError("Rental not found", 404));
  }

  if (!rental.canStart()) {
    return next(new AppError("Rental cannot start", 400));
  }
  await performStartRental(rental);

  res.status(200).json({
    status: "success",
    rental
  });
});

// -------------------------
// COMPLETE RENTAL
// -------------------------

export const completeRental = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) {
    return next(new AppError("Rental not found", 404));
  }

  if (!rental.canComplete()) {
    return next(new AppError("Rental cannot be completed", 400));
  }
  await performCompleteRental(rental);

  res.status(200).json({
    status: "success",
    rental
  });
});

// -------------------------
// HANDOVER OTP (OWNER GENERATES)
// -------------------------
export const generateHandoverOtp = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id).select("+handoverOTP +handoverOTPExpiry");
  if (!rental) return next(new AppError("Rental not found", 404));

  if (rental.owner?.toString?.() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  if (rental.rentalStatus !== "approved") {
    return next(new AppError("Handover OTP can only be generated for approved rentals", 400));
  }

  const otp = generateNumericOtp(4);
  rental.handoverOTP = hashOtp(otp);
  rental.handoverOTPExpiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await rental.save();

  res.status(200).json({
    status: "success",
    otp,
    expiresAt: rental.handoverOTPExpiry
  });
});

// -------------------------
// HANDOVER OTP (RENTER VERIFIES -> START)
// -------------------------
export const verifyHandoverOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) return next(new AppError("OTP is required", 400));

  const rental = await Rental.findById(req.params.id).select("+handoverOTP +handoverOTPExpiry");
  if (!rental) return next(new AppError("Rental not found", 404));

  if (rental.renter?.toString?.() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  if (rental.rentalStatus !== "approved") {
    return next(new AppError("Rental is not in approved state", 400));
  }

  if (!rental.handoverOTP || !rental.handoverOTPExpiry) {
    return next(new AppError("Handover OTP not generated", 400));
  }

  if (new Date(rental.handoverOTPExpiry).getTime() < Date.now()) {
    rental.handoverOTP = undefined;
    rental.handoverOTPExpiry = undefined;
    await rental.save();
    return next(new AppError("OTP expired. Ask owner to generate a new one.", 400));
  }

  if (hashOtp(otp) !== rental.handoverOTP) {
    return next(new AppError("Invalid OTP", 400));
  }

  // clear OTP before applying action (prevents reuse)
  rental.handoverOTP = undefined;
  rental.handoverOTPExpiry = undefined;
  await rental.save();

  // trigger existing start logic (internally reused)
  await performStartRental(rental);

  res.status(200).json({
    status: "success",
    rental
  });
});

// -------------------------
// RETURN OTP (OWNER GENERATES)
// -------------------------
export const generateReturnOtp = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id).select("+returnOTP +returnOTPExpiry");
  if (!rental) return next(new AppError("Rental not found", 404));

  if (rental.owner?.toString?.() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  if (rental.rentalStatus !== "active") {
    return next(new AppError("Return OTP can only be generated for active rentals", 400));
  }

  const otp = generateNumericOtp(4);
  rental.returnOTP = hashOtp(otp);
  rental.returnOTPExpiry = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await rental.save();

  res.status(200).json({
    status: "success",
    otp,
    expiresAt: rental.returnOTPExpiry
  });
});

// -------------------------
// RETURN OTP (RENTER VERIFIES -> COMPLETE)
// -------------------------
export const verifyReturnOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) return next(new AppError("OTP is required", 400));

  const rental = await Rental.findById(req.params.id).select("+returnOTP +returnOTPExpiry");
  if (!rental) return next(new AppError("Rental not found", 404));

  if (rental.renter?.toString?.() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  if (rental.rentalStatus !== "active") {
    return next(new AppError("Rental is not in active state", 400));
  }

  if (!rental.returnOTP || !rental.returnOTPExpiry) {
    return next(new AppError("Return OTP not generated", 400));
  }

  if (new Date(rental.returnOTPExpiry).getTime() < Date.now()) {
    rental.returnOTP = undefined;
    rental.returnOTPExpiry = undefined;
    await rental.save();
    return next(new AppError("OTP expired. Ask owner to generate a new one.", 400));
  }

  if (hashOtp(otp) !== rental.returnOTP) {
    return next(new AppError("Invalid OTP", 400));
  }

  // clear OTP before applying action (prevents reuse)
  rental.returnOTP = undefined;
  rental.returnOTPExpiry = undefined;
  await rental.save();

  await performCompleteRental(rental);

  res.status(200).json({
    status: "success",
    rental
  });
});