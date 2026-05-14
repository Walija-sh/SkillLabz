import Notification from "../models/Notification.js";

const FALLBACK_ACTION_LINK = "/my-rentals";

const isValidActionLink = (actionLink) =>
  typeof actionLink === "string" &&
  actionLink.trim().length > 0 &&
  actionLink.startsWith("/");

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedRentalId,
  relatedItemId,
  actionLink,
  eventKey
}) => {
  if (!userId || !type || !title || !message) {
    return null;
  }

  const payload = {
    userId,
    type,
    title,
    message,
    relatedRentalId,
    relatedItemId,
    actionLink: isValidActionLink(actionLink)
      ? actionLink.trim()
      : FALLBACK_ACTION_LINK
  };

  if (eventKey) {
    payload.eventKey = String(eventKey).trim();
  }

  if (!payload.eventKey) {
    return Notification.create(payload);
  }

  // Upsert by deterministic event key to prevent duplicate notifications.
  return Notification.findOneAndUpdate(
    { eventKey: payload.eventKey },
    { $setOnInsert: payload },
    { new: true, upsert: true }
  );
};
