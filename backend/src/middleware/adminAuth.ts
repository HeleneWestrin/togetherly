import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { ForbiddenError } from "../utils/errors";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      throw new ForbiddenError("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};
