import express from "express";
import { getPublicUserProfile } from "../controllers/user.controller.js";

const UserRouter = express.Router();

UserRouter.get("/:id", getPublicUserProfile);

export default UserRouter;

