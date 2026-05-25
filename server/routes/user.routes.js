import express from "express";
import { getPublicUserProfile,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,getMyPaymentMethods } from "../controllers/user.controller.js";
import protect from "../middleware/protect.middleware.js";
const UserRouter = express.Router();

UserRouter.post("/payment-methods", protect, addPaymentMethod);

UserRouter.patch(
  "/payment-methods/:paymentMethodId",
  protect,
  updatePaymentMethod
);

UserRouter.delete(
  "/payment-methods/:paymentMethodId",
  protect,
  deletePaymentMethod
);
UserRouter.get(
  "/me/payment-methods",
  protect,
  getMyPaymentMethods
);

UserRouter.get("/:id", getPublicUserProfile);

export default UserRouter;

