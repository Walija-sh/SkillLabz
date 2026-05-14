const ACTIVE_BOOKING_STATUSES = ["approved", "active"];
const HOLD_STATUSES = ["pending", "requested"];

export const toDate = (value) => (value ? new Date(value) : null);

export const pickRentalWindow = (rental) => {
  if (rental.rentalStatus === "active" && rental.actualStartTime) {
    return {
      start: toDate(rental.actualStartTime),
      end: toDate(rental.actualEndTime) || toDate(rental.endDate)
    };
  }

  return {
    start: toDate(rental.startDate),
    end: toDate(rental.endDate)
  };
};

export const windowsOverlap = (aStart, aEnd, bStart, bEnd) => {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && aEnd >= bStart;
};

export const hasRentalConflictInMemory = (candidateStart, candidateEnd, rentals = []) =>
  rentals.some((rental) => {
    const { start, end } = pickRentalWindow(rental);
    return windowsOverlap(start, end, candidateStart, candidateEnd);
  });

export const buildConflictQuery = ({ itemId, start, end, excludeRentalId }) => {
  const query = {
    item: itemId,
    rentalStatus: { $in: ACTIVE_BOOKING_STATUSES },
    $or: [
      {
        startDate: { $lte: end },
        endDate: { $gte: start }
      },
      {
        actualStartTime: { $lte: end },
        $or: [{ actualEndTime: { $exists: false } }, { actualEndTime: null }, { actualEndTime: { $gte: start } }]
      }
    ]
  };

  if (excludeRentalId) {
    query._id = { $ne: excludeRentalId };
  }

  return query;
};

export const getAvailabilityStatus = (status) => {
  if (ACTIVE_BOOKING_STATUSES.includes(status)) return "booked";
  if (HOLD_STATUSES.includes(status)) return "pending";
  return null;
};

export { ACTIVE_BOOKING_STATUSES, HOLD_STATUSES };
