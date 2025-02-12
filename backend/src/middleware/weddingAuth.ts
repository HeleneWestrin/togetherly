import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { createForbiddenError, createNotFoundError } from "../utils/errors";
import { Wedding } from "../models/wedding.model";
import { Task } from "../models/task.model";

export const requireWeddingAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      throw createNotFoundError("User not found");
    }

    // Check for admin first
    if (user.isAdmin) {
      (req as any).userWeddingAccess = "admin";
      return next();
    }

    let wedding;
    // Handle routes with slug
    if (req.params.slug) {
      wedding = await Wedding.findOne({ slug: req.params.slug });
    }
    // Handle routes with taskId
    else if (req.params.taskId) {
      const task = await Task.findById(req.params.taskId);
      if (!task) {
        throw createNotFoundError("Task not found");
      }
      wedding = await Wedding.findById(task.weddingId);
    }
    // Handle routes with weddingId
    else if (req.params.weddingId) {
      wedding = await Wedding.findById(req.params.weddingId);
    }

    if (!wedding) {
      throw createNotFoundError("Wedding not found");
    }

    const targetWeddingId = (wedding._id as string).toString();

    if (wedding.couple.some((coupleId) => coupleId.toString() === userId)) {
      (req as any).userWeddingAccess = "couple";
      return next();
    }

    const userWeddingRole = user.weddings?.find((wr) => {
      return wr.weddingId?.toString() === targetWeddingId;
    });

    if (!userWeddingRole) {
      throw createForbiddenError("No access to this wedding");
    }

    // Store the user's access level for use in the route handlers
    (req as any).userWeddingAccess = userWeddingRole.accessLevel;

    // For certain operations, we might want to restrict access
    if (req.method === "POST" || req.method === "DELETE") {
      if (userWeddingRole.accessLevel === "guest") {
        throw createForbiddenError(
          "Insufficient permissions for this operation"
        );
      }
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    next(error);
  }
};
