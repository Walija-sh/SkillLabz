import Notification from "../models/Notification.js";
import Rental from "../models/Rental.js";
import catchAsync from "../utils/catchAsync.js";
import { createNotification } from "../utils/notification.js";
import AppError from "../utils/appError.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RETURN_DEADLINE_WINDOW_MS = 6 * 60 * 60 * 1000;

const buildRentalActionLink = (rental) => {
  const ownerId = rental?.owner?._id?.toString?.() || rental?.owner?.toString?.();
  const renterId = rental?.renter?._id?.toString?.() || rental?.renter?.toString?.();
  return `/my-rentals?rental=${rental?._id}&owner=${ownerId}&renter=${renterId}`;
};

const upsertTimeBasedNotificationsForUser = async (userId) => {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + ONE_DAY_MS);
  const inDeadlineWindow = new Date(now.getTime() + RETURN_DEADLINE_WINDOW_MS);

  const rentals = await Rental.find({
    $or: [{ renter: userId }, { owner: userId }],
    rentalStatus: { $in: ["approved", "active", "cancelled"] }
  }).select(
    "_id item renter owner rentalStatus startDate endDate cancelledBy cancellationReason rentalIssues"
  );

  const tasks = [];

  rentals.forEach((rental) => {
    const actionLink = buildRentalActionLink(rental);
    const itemId = rental.item?.toString?.() || rental.item;
    const rentalId = rental._id.toString();
    const isOwner = rental.owner?.toString?.() === String(userId);
    const role = isOwner ? "owner" : "renter";

    if (
      rental.rentalStatus === "approved" &&
      rental.startDate &&
      new Date(rental.startDate) > now &&
      new Date(rental.startDate) <= in24Hours
    ) {
      tasks.push(
        createNotification({
          userId,
          type: "rental_start_reminder_24h",
          title: "Rental starts soon",
          message: "Your approved rental starts within 24 hours.",
          relatedRentalId: rental._id,
          relatedItemId: itemId,
          actionLink,
          eventKey: `${rentalId}:rental_start_reminder_24h:${role}`
        })
      );
    }

    if (
      rental.rentalStatus === "active" &&
      rental.endDate &&
      new Date(rental.endDate) > now &&
      new Date(rental.endDate) <= inDeadlineWindow
    ) {
      tasks.push(
        createNotification({
          userId,
          type: "rental_return_deadline_reminder",
          title: "Return deadline approaching",
          message: "This rental return deadline is approaching soon.",
          relatedRentalId: rental._id,
          relatedItemId: itemId,
          actionLink,
          eventKey: `${rentalId}:rental_return_deadline_reminder:${role}`
        })
      );
    }

    if (
      rental.rentalStatus === "active" &&
      rental.endDate &&
      new Date(rental.endDate) < now
    ) {
      tasks.push(
        createNotification({
          userId,
          type: "rental_late_return_alert",
          title: "Late return alert",
          message: "This rental has passed the return deadline.",
          relatedRentalId: rental._id,
          relatedItemId: itemId,
          actionLink,
          eventKey: `${rentalId}:rental_late_return_alert:${role}`
        })
      );
    }

    if (rental.rentalStatus === "cancelled" && rental.rentalIssues?.noShow) {
      tasks.push(
        createNotification({
          userId,
          type: "rental_no_show",
          title: "No-show reported",
          message: `Rental was cancelled as a no-show by ${rental.cancelledBy || "a participant"}.`,
          relatedRentalId: rental._id,
          relatedItemId: itemId,
          actionLink,
          eventKey: `${rentalId}:rental_no_show:${role}`
        })
      );
    }

    if (rental.rentalStatus === "cancelled" && rental.rentalIssues?.earlyTermination) {
      tasks.push(
        createNotification({
          userId,
          type: "rental_early_termination",
          title: "Rental ended early",
          message: `Rental was terminated early by ${rental.cancelledBy || "a participant"}.${
            rental.cancellationReason ? ` Reason: ${rental.cancellationReason}` : ""
          }`,
          relatedRentalId: rental._id,
          relatedItemId: itemId,
          actionLink,
          eventKey: `${rentalId}:rental_early_termination:${role}`
        })
      );
    }
  });

  if (tasks.length) {
    await Promise.all(tasks);
  }
};

export const getMyNotifications = catchAsync(async (req, res) => {
  await upsertTimeBasedNotificationsForUser(req.user._id);

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20),
    Notification.countDocuments({ userId: req.user._id, isRead: false })
  ]);

  res.status(200).json({
    status: "success",
    results: notifications.length,
    unreadCount,
    notifications
  });
});

export const markNotificationAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  res.status(200).json({
    status: "success",
    notification
  });
});

export const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  const updated = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    status: "success",
    modifiedCount: updated.modifiedCount
  });
});
