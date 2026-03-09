import express from "express";

import protect from "../middleware/protect.middleware.js";
import checkRentalConflict from "../middleware/checkRentalConflict.middleware.js";

import {
  createRental,
  getMyRentals,
  getOwnerRentals,
  approveRental,
  rejectRental,
  startRental,
  completeRental
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


// -------------------------
// OWNER ACTIONS
// -------------------------

RentalRouter.patch("/:id/approve", protect, approveRental);
RentalRouter.patch("/:id/reject", protect, rejectRental);


// -------------------------
// RENTAL LIFECYCLE
// -------------------------

RentalRouter.patch("/:id/start", protect, startRental);
RentalRouter.patch("/:id/complete", protect, completeRental);


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