import mongoose from "mongoose";
import AppError from "../utils/appError.js";

const RentalSchema = new mongoose.Schema(
{
  // -------------------------
  // ITEM REFERENCE
  // -------------------------
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: [true, "Rental must belong to an item"]
  },

  // -------------------------
  // USERS
  // -------------------------
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Rental must have a renter"]
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Rental must have an owner"]
  },

  // -------------------------
  // RENTAL DATES
  // -------------------------
  startDate: {
    type: Date,
    required: [true, "Rental start date is required"]
  },

  endDate: {
    type: Date,
    required: [true, "Rental end date is required"]
  },

  rentalDays: {
    type: Number
  },

  // -------------------------
  // PRICE SNAPSHOT
  // (locked at booking time)
  // -------------------------
  pricePerDay: {
    type: Number,
    required: [true, "Rental must include item price per day"],
    min: [0, "Price cannot be negative"]
  },

  depositAmount: {
    type: Number,
    default: 0,
    min: [0, "Deposit cannot be negative"]
  },

  totalPrice: {
    type: Number
  },

  // -------------------------
  // RENTAL STATUS
  // -------------------------
  rentalStatus: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "active",
      "completed",
      "cancelled"
    ],
    default: "pending"
  },

  // -------------------------
  // OPTIONAL NOTES
  // -------------------------
  renterNote: {
    type: String,
    maxlength: [300, "Note cannot exceed 300 characters"]
  },

  ownerNote: {
    type: String,
    maxlength: [300, "Note cannot exceed 300 characters"]
  }

},
{ timestamps: true }
);

RentalSchema.index({ item: 1, startDate: 1, endDate: 1 });
RentalSchema.index({ renter: 1, rentalStatus: 1 });
RentalSchema.index({ owner: 1, rentalStatus: 1 });

// hooks
// validate date
RentalSchema.pre("validate", function () {

  if (this.startDate >= this.endDate) {
    return new AppError("End date must be after start date",400);
  }
});

// cal rental duration and total price
RentalSchema.pre("save", function () {
  if (!this.startDate || !this.endDate) return;

  const diffTime = this.endDate - this.startDate;
  this.rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (this.pricePerDay && this.rentalDays) {
    this.totalPrice = this.pricePerDay * this.rentalDays;
  }
});
// check if rental can be approved
RentalSchema.methods.canBeApproved = function () {
  return this.rentalStatus === "pending";
};
// check if can start
RentalSchema.methods.canStart = function () {
  return this.rentalStatus === "approved";
};
// can complete
RentalSchema.methods.canComplete = function () {
  return this.rentalStatus === "active";
};

// can cancel
RentalSchema.methods.canCancel = function () {
  return ["pending", "approved"].includes(this.rentalStatus);
};

const Rental = mongoose.models.Rental || mongoose.model("Rental", RentalSchema);

export default Rental;


// toring pricePerDay and depositAmount inside Rental is not duplication, it is historical price locking.

// If item price changes later:

// Item pricePerDay: 2000 → 2500

// Old rentals should still show 2000, otherwise invoices become wrong. Real marketplaces always snapshot pricing inside the transaction record.