import { Router } from "express";
import { WeddingController } from "../controllers/wedding.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireWeddingAccess } from "../middleware/weddingAuth";

export const taskRouter = Router();

taskRouter.post(
  "/:weddingId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.createTask
);

// Complete or uncomplete a task
taskRouter.patch(
  "/:taskId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateTask
);

taskRouter.delete(
  "/:taskId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.deleteTask
);

taskRouter.put(
  "/:taskId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateTaskDetails
);
