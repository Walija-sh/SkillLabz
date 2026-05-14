import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        "rental_request_new",
        "rental_approved",
        "rental_rejected",
        "item_handed_over",
        "item_returned",
        "rental_completed",
        "rental_cancelled",
        "rental_start_reminder_24h",
        "rental_return_deadline_reminder",
        "rental_late_return_alert",
        "rental_no_show",
        "rental_early_termination"
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    relatedRentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental"
    },
    relatedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionLink: {
      type: String,
      default: "/my-rentals",
      trim: true
    },
    eventKey: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ eventKey: 1 }, { unique: true, sparse: true });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default Notification;
