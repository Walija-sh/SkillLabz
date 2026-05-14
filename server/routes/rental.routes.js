import express from "express";

import protect from "../middleware/protect.middleware.js";
import checkRentalConflict from "../middleware/checkRentalConflict.middleware.js";

import {
  createRental,
  getMyRentals,
  getOwnerRentals,
  getRentalById,
  approveRental,
  rejectRental,
  startRental,
  completeRental,
  cancelRental,
  generateHandoverOtp,
  verifyHandoverOtp,
  generateReturnOtp,
  verifyReturnOtp,
  agreeRentalContract
} from "../controllers/rental.controller.js";

const RentalRouter = express.Router();


// -------------------------
// CREATE RENTAL REQUEST
// -------------------------

RentalRouter.post(
  "/",
  protect,
  checkRentalConflict,
  createRental
);


// -------------------------
// DASHBOARDS
// -------------------------

RentalRouter.get("/my-rentals", protect, getMyRentals);
RentalRouter.get("/owner", protect, getOwnerRentals);
RentalRouter.get("/:id", protect, getRentalById);


// -------------------------
// OWNER ACTIONS
// -------------------------

RentalRouter.patch("/:id/approve", protect, approveRental);
RentalRouter.patch("/:id/reject", protect, rejectRental);
RentalRouter.patch("/:id/agree-contract", protect, agreeRentalContract);


// -------------------------
// RENTAL LIFECYCLE
// -------------------------

RentalRouter.patch("/:id/start", protect, startRental);
RentalRouter.patch("/:id/complete", protect, completeRental);
RentalRouter.patch("/:id/cancel", protect, cancelRental);

// -------------------------
// OTP VERIFICATION (EXTENSION)
// -------------------------
RentalRouter.patch("/:id/generate-handover-otp", protect, generateHandoverOtp);
RentalRouter.patch("/:id/verify-handover-otp", protect, verifyHandoverOtp);
RentalRouter.patch("/:id/generate-return-otp", protect, generateReturnOtp);
RentalRouter.patch("/:id/verify-return-otp", protect, verifyReturnOtp);


export default RentalRouter;


// User A → lists item
// User B → requests rental
// Owner → approves/rejects
// Rental → starts
// Rental → completes
// flow
// create request
//      ↓
// conflict check
//      ↓
// pending rental
//      ↓
// owner approves
//      ↓
// conflict check again
//      ↓
// approved
//      ↓
// start rental
//      ↓
// item unavailable
//      ↓
// complete rental
//      ↓
// item available again