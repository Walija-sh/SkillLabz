import Rental from "../models/Rental.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const checkRentalConflict = catchAsync(async (req, res, next) => {
  const { itemId, startDate, endDate } = req.body;

  if (!itemId || !startDate || !endDate) {
    return next(new AppError("Item, start date and end date are required", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Atomic check for overlapping rentals
  const conflict = await Rental.findOne({
    item: itemId,
    rentalStatus: { $in: ["approved", "active"] },
    startDate: { $lte: end },
    endDate: { $gte: start }
  });

  if (conflict) {
    return next(new AppError("Item is already booked for the selected dates", 400));
  }

  next();
});

export default checkRentalConflict;