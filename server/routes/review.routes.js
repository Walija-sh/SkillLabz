import express from "express";
import protect from "../middleware/protect.middleware.js";
import { createReview, getReviewsForUser } from "../controllers/review.controller.js";

const ReviewRouter = express.Router();

ReviewRouter.post("/", protect, createReview);
ReviewRouter.get("/:userId", getReviewsForUser);

export default ReviewRouter;

