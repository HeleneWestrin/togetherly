import { Router } from "express";
import { WeddingController } from "../controllers/wedding.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireWeddingAccess } from "../middleware/weddingAuth";

export const taskRouter = Router();

taskRouter.patch(
  "/:taskId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateTask
);
