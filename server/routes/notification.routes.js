import express from "express";
import protect from "../middleware/protect.middleware.js";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/notification.controller.js";

const NotificationRouter = express.Router();

NotificationRouter.get("/", protect, getMyNotifications);
NotificationRouter.patch("/read-all", protect, markAllNotificationsAsRead);
NotificationRouter.patch("/:id/read", protect, markNotificationAsRead);

export default NotificationRouter;
