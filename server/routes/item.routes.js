import express from "express";
import protect from "../middleware/protect.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
  createItem,
  getAllItems,
  getSingleItem,
  getItemAvailability,
  updateItem,
  deleteItem,
  getMyItems,
  getNearbyItems,
  toggleAvailability
} from "../controllers/item.controller.js";

const ItemRouter = express.Router();

// -------------------------
// PUBLIC ROUTES
// -------------------------

ItemRouter.get("/", getAllItems); // filters, pagination
ItemRouter.get("/near", getNearbyItems); // geo search
ItemRouter.get("/my-items", protect, getMyItems);
ItemRouter.get("/:id/availability", getItemAvailability);
ItemRouter.get("/:id", getSingleItem);

ItemRouter.post(
  "/",
  protect,
  upload.array("images", 3), // max 5 images
  createItem
);

ItemRouter.patch(
  "/:id",
  protect,
  upload.array("images", 5),
  updateItem
);

ItemRouter.patch("/:id/toggle-availability", protect, toggleAvailability);

ItemRouter.delete("/:id", protect, deleteItem);

export default ItemRouter;