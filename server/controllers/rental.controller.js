/**
 * RENTAL CONTROLLER
 * Handles all lifecycle events for tool rentals:
 * Creating requests, approving/rejecting, and completing hand-offs.
 * Last updated to include Skill Session logic.
 */


// UPDATED: 2026-03-15
import Rental from "../models/Rental.js";
import Item from "../models/Item.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import crypto from "crypto";
import { buildConflictQuery } from "../utils/rentalAvailability.js";
import { createNotification } from "../utils/notification.js";

const OTP_TTL_MINUTES = 10;
const LAST_MINUTE_CANCELLATION_HOURS = 6;
const CONTRACT_VERSION = 1;

const generateNumericOtp = (digits = 4) => {
  const len = Math.max(4, Math.min(6, Number(digits) || 4));
  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");
const getRentalActionLink = (rental) => `/my-rentals?rental=${rental._id}`;
const sanitizeAdditionalTerms = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const formatDateForContract = (date) =>
  new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const buildBaseTerms = ({ rental, item, renter, owner }) => {
  const renterName = renter?.username || renter?.fullName || "Renter";
  const ownerName = owner?.username || owner?.fullName || "Owner";
  const itemName = item?.title || "Item";
  return [
    "SkillLabz Rental Contract",
    "",
    "Rental Details",
    `- Item: ${itemName}`,
    `- Renter: ${renterName}`,
    `- Owner: ${ownerName}`,
    `- Requested dates: ${formatDateForContract(rental.startDate)} to ${formatDateForContract(rental.endDate)}`,
    "",
    "Payment Terms",
    `- Price per day: Rs. ${rental.pricePerDay || 0}`,
    `- Total amount: Rs. ${rental.totalPrice || 0}`,
    `- Deposit amount: Rs. ${rental.depositAmount || 0}`,
    "",
    "Platform Rules",
    "- OTP-based handover confirmation is mandatory before rental use.",
    "- Late return penalties may apply according to platform policy.",
    "- Renter is responsible for damage, loss, or negligent misuse.",
    "- Cancellation policy and cancellation logs apply to both parties.",
    "- Disputes are handled via SkillLabz support and platform evidence."
  ].join("\n");
};

const performStartRental = async (rental) => {
  const item = await Item.findById(rental.item);
  if (item) {
    item.isAvailable = false;
    await item.save();
  }
  // OTP-verified handover is the source of truth for actual rental start.
  rental.actualStartTime = rental.actualStartTime || new Date();
  rental.actualEndTime = undefined;
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
  // OTP-verified return finalizes actual rental end.
  rental.actualEndTime = new Date();
  rental.rentalIssues = rental.rentalIssues || {};
  rental.rentalIssues.lateReturn = rental.actualEndTime > new Date(rental.endDate);
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
    rentalStatus: { $in: ["pending", "requested"] }
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
    renterNote,
    rentalStatus: "requested",
    rentalIssues: {
      lateReturn: false,
      noShow: false,
      earlyTermination: false
    }
  });

  await createNotification({
    userId: rental.owner,
    type: "rental_request_new",
    title: "New rental request",
    message: "A renter submitted a new request for your item.",
    relatedRentalId: rental._id,
    relatedItemId: rental.item,
    actionLink: getRentalActionLink(rental),
    eventKey: `${rental._id}:rental_request_new:owner`
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
    .populate("owner", "username fullName")
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

export const getRentalById = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id)
    .populate("item", "title images")
    .populate("renter", "username fullName")
    .populate("owner", "username fullName");

  if (!rental) return next(new AppError("Rental not found", 404));

  const isOwner = String(rental.owner?._id || rental.owner) === req.user._id.toString();
  const isRenter = String(rental.renter?._id || rental.renter) === req.user._id.toString();
  if (!isOwner && !isRenter) return next(new AppError("Not authorized", 403));

  res.status(200).json({ status: "success", rental });
});

// -------------------------
// APPROVE RENTAL
// -------------------------

export const approveRental = catchAsync(async (req, res, next) => {
  const additionalTermsRaw = req.body?.additionalTerms ?? "";
  const rental = await Rental.findById(req.params.id);

  if (!rental) return next(new AppError("Rental not found", 404));
  if (rental.owner.toString() !== req.user._id.toString())
    return next(new AppError("Not authorized", 403));
  if (!rental.canBeApproved())
    return next(new AppError("Rental cannot be approved", 400));

  // Re-check conflicts at approval time to avoid stale availability.
  const conflict = await Rental.findOne(
    buildConflictQuery({
      itemId: rental.item,
      start: new Date(rental.startDate),
      end: new Date(rental.endDate),
      excludeRentalId: rental._id
    })
  );

  if (conflict) {
    return next(new AppError("Item already booked for these dates", 400));
  }

  const additionalTerms = sanitizeAdditionalTerms(additionalTermsRaw);
  if (additionalTermsRaw && !additionalTerms) {
    return next(new AppError("Additional terms cannot be empty", 400));
  }
  if (additionalTerms.length > 500) {
    return next(new AppError("Additional terms must be 500 characters or less", 400));
  }

  const [item, renter, owner] = await Promise.all([
    Item.findById(rental.item).select("title"),
    User.findById(rental.renter).select("username fullName"),
    User.findById(rental.owner).select("username fullName")
  ]);

  rental.rentalStatus = "approved";
  rental.contract = {
    baseTerms: buildBaseTerms({ rental, item, renter, owner }),
    additionalTerms: additionalTerms || undefined,
    agreedAt: undefined,
    version: CONTRACT_VERSION
  };
  await rental.save();

  await createNotification({
    userId: rental.renter,
    type: "rental_approved",
    title: "Rental approved",
    message: "Your rental request has been approved by the owner.",
    relatedRentalId: rental._id,
    relatedItemId: rental.item,
    actionLink: getRentalActionLink(rental),
    eventKey: `${rental._id}:rental_approved:renter`
  });

  res.status(200).json({
    status: "success",
    rental
  });
});

export const agreeRentalContract = catchAsync(async (req, res, next) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return next(new AppError("Rental not found", 404));
  if (rental.renter.toString() !== req.user._id.toString()) {
    return next(new AppError("Only renter can agree to this contract", 403));
  }
  if (rental.rentalStatus !== "approved") {
    return next(new AppError("Contract can only be agreed after approval", 400));
  }
  if (!rental.contract?.baseTerms) {
    return next(new AppError("Contract is not generated yet", 400));
  }
  if (rental.contract?.agreedAt) {
    return res.status(200).json({ status: "success", rental });
  }

  rental.contract.agreedAt = new Date();
  await rental.save();

  res.status(200).json({ status: "success", rental });
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

  await createNotification({
    userId: rental.renter,
    type: "rental_rejected",
    title: "Rental rejected",
    message: "Your rental request was rejected by the owner.",
    relatedRentalId: rental._id,
    relatedItemId: rental.item,
    actionLink: getRentalActionLink(rental),
    eventKey: `${rental._id}:rental_rejected:renter`
  });

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

  await Promise.all([
    createNotification({
      userId: rental.owner,
      type: "item_handed_over",
      title: "Item handed over",
      message: "OTP verification completed and the rental has started.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:item_handed_over:owner`
    }),
    createNotification({
      userId: rental.renter,
      type: "item_handed_over",
      title: "Item handed over",
      message: "OTP verification completed and the rental has started.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:item_handed_over:renter`
    })
  ]);

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

  await Promise.all([
    createNotification({
      userId: rental.owner,
      type: "rental_completed",
      title: "Rental completed",
      message: "The rental was marked completed successfully.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:rental_completed:owner`
    }),
    createNotification({
      userId: rental.renter,
      type: "rental_completed",
      title: "Rental completed",
      message: "The rental was marked completed successfully.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:rental_completed:renter`
    })
  ]);

  res.status(200).json({
    status: "success",
    rental
  });
});

// -------------------------
// CANCEL RENTAL
// -------------------------
export const cancelRental = catchAsync(async (req, res, next) => {
  const { cancellationReason } = req.body;
  const rental = await Rental.findById(req.params.id);

  if (!rental) return next(new AppError("Rental not found", 404));
  if (rental.rentalStatus === "completed") {
    return next(new AppError("Completed rentals cannot be cancelled", 400));
  }
  if (rental.rentalStatus === "cancelled") {
    return next(new AppError("Rental is already cancelled", 400));
  }
  if (!cancellationReason || !String(cancellationReason).trim()) {
    return next(new AppError("Cancellation reason is required", 400));
  }

  const isRenter = rental.renter.toString() === req.user._id.toString();
  const isOwner = rental.owner.toString() === req.user._id.toString();
  if (!isRenter && !isOwner) return next(new AppError("Not authorized", 403));

  const cancelledBy = isOwner ? "owner" : "renter";
  const now = new Date();
  const isEarlyTermination = Boolean(rental.actualStartTime);
  const isLastMinute = now.getTime() >= new Date(rental.startDate).getTime() - LAST_MINUTE_CANCELLATION_HOURS * 60 * 60 * 1000;
  const isNoShow = !rental.actualStartTime && rental.rentalStatus === "approved" && now > new Date(rental.startDate);

  rental.cancelledBy = cancelledBy;
  rental.cancellationReason = String(cancellationReason).trim();
  rental.cancelledAt = now;
  rental.rentalStatus = "cancelled";
  rental.rentalIssues = rental.rentalIssues || {};
  rental.rentalIssues.earlyTermination = isEarlyTermination;
  rental.rentalIssues.noShow = isNoShow;
  rental.cancellationLogs = rental.cancellationLogs || [];
  rental.cancellationLogs.push({
    cancelledBy,
    reason: rental.cancellationReason,
    cancelledAt: now,
    wasEarlyTermination: isEarlyTermination,
    isLastMinute
  });

  // If cancellation happens after handover, this is an early termination.
  if (isEarlyTermination) {
    rental.actualEndTime = now;
  }

  await rental.save();

  const item = await Item.findById(rental.item);
  if (item && (rental.rentalStatus === "cancelled" || isEarlyTermination)) {
    item.isAvailable = true;
    await item.save();
  }

  await Promise.all([
    createNotification({
      userId: rental.owner,
      type: "rental_cancelled",
      title: "Rental cancelled",
      message: `Rental was cancelled by ${cancelledBy}. Reason: ${rental.cancellationReason}`,
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:rental_cancelled:owner`
    }),
    createNotification({
      userId: rental.renter,
      type: "rental_cancelled",
      title: "Rental cancelled",
      message: `Rental was cancelled by ${cancelledBy}. Reason: ${rental.cancellationReason}`,
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:rental_cancelled:renter`
    })
  ]);

  res.status(200).json({
    status: "success",
    rental,
    cancellation: {
      isEarlyTermination,
      isLastMinute,
      isNoShow
    }
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
  if (!rental.contract?.agreedAt) {
    return next(new AppError("Renter must agree to the contract before handover OTP verification", 400));
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

  await Promise.all([
    createNotification({
      userId: rental.owner,
      type: "item_handed_over",
      title: "Item handed over",
      message: "OTP verification completed and the rental has started.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:item_handed_over:owner`
    }),
    createNotification({
      userId: rental.renter,
      type: "item_handed_over",
      title: "Item handed over",
      message: "OTP verification completed and the rental has started.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:item_handed_over:renter`
    })
  ]);

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

  await Promise.all([
    createNotification({
      userId: rental.owner,
      type: "item_returned",
      title: "Item returned",
      message: "OTP verification completed and item return was confirmed.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:item_returned:owner`
    }),
    createNotification({
      userId: rental.renter,
      type: "item_returned",
      title: "Item returned",
      message: "OTP verification completed and item return was confirmed.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:item_returned:renter`
    }),
    createNotification({
      userId: rental.owner,
      type: "rental_completed",
      title: "Rental completed",
      message: "The rental has completed after verified return.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:rental_completed:owner`
    }),
    createNotification({
      userId: rental.renter,
      type: "rental_completed",
      title: "Rental completed",
      message: "The rental has completed after verified return.",
      relatedRentalId: rental._id,
      relatedItemId: rental.item,
      actionLink: getRentalActionLink(rental),
      eventKey: `${rental._id}:rental_completed:renter`
    })
  ]);

  res.status(200).json({
    status: "success",
    rental
  });
});