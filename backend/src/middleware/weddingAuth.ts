import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { Wedding } from "../models/wedding.model";
import { ForbiddenError } from "../utils/errors";

export const requireWeddingAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const weddingId = req.params.weddingId;
    const slug = req.params.slug;

    const user = await User.findById(userId);
    if (!user) throw new ForbiddenError("User not found");

    // Admins have access to all weddings
    if (user.role === "admin") return next();

    // Find wedding by ID or slug
    const wedding = slug
      ? await Wedding.findOne({ slug })
      : await Wedding.findById(weddingId);

    if (!wedding) throw new ForbiddenError("Wedding not found");

    // Check if user is part of the couple or a guest
    const isCouple = wedding.couple.some((id) => id.toString() === userId);
    const isGuest = wedding.guests.some((id) => id.toString() === userId);

    if (!isCouple && !isGuest) {
      throw new ForbiddenError("You don't have access to this wedding");
    }

    next();
  } catch (error) {
    next(error);
  }
};
