import express from "express";
import {
  submitVerificationRequest,
  getPendingRequests,
  approveVerification,
  rejectVerification
} from "../controllers/verification.controller.js";

import protect from '../middleware/protect.middleware.js';
import upload from '../middleware/upload.middleware.js';
import restrictTo from "../middleware/restrict.middleware.js";

const VerificationRouter = express.Router();

// ---------------- USER ----------------
VerificationRouter.post(
  "/request",
  protect,
  upload.fields([
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 }
  ]),
  submitVerificationRequest
);


// ---------------- ADMIN ----------------
VerificationRouter.get(
  "/pending",
  protect,
  restrictTo("admin"),
  getPendingRequests
);

VerificationRouter.patch(
  "/:id/approve",
  protect,
  restrictTo("admin"),
  approveVerification
);

VerificationRouter.patch(
  "/:id/reject",
  protect,
  restrictTo("admin"),
  rejectVerification
);

export default VerificationRouter;