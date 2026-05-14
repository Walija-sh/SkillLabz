import Rental from "../models/Rental.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { buildConflictQuery } from "../utils/rentalAvailability.js";

const checkRentalConflict = catchAsync(async (req, res, next) => {
  const { itemId, startDate, endDate } = req.body;

  if (!itemId || !startDate || !endDate) {
    return next(new AppError("Item, start date and end date are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return next(new AppError("Invalid rental date range", 400));
  }
  if (start > end) {
    return next(new AppError("End date cannot be before start date", 400));
  }

  // Only approved/active rentals block a new request; pending requests are allowed.
  const conflict = await Rental.findOne(buildConflictQuery({ itemId, start, end }));

  if (conflict) {
    return next(new AppError("Item is already booked for the selected dates", 400));
  }

  next();
});

export default checkRentalConflict;