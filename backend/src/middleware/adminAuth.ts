import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { createForbiddenError } from "../utils/errors";

/**
 * Middleware to ensure the authenticated user has admin privileges
 * Must be used after the authenticateUser middleware which adds userId to the request
 *
 * @param req - Express request object (must have userId from auth middleware)
 * @param res - Express response object
 * @param next - Express next function for continuing or error handling
 * @throws ForbiddenError if user is not found or is not an admin
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get userId that was attached by the authentication middleware
    const userId = req.user.id;

    // Find the user in the database
    const user = await User.findById(userId);

    // Check if user exists and has admin role
    if (!user || !user.isAdmin) {
      throw createForbiddenError("Admin access required");
    }

    // If user is admin, continue to next middleware/route handler
    next();
  } catch (error) {
    // Pass any errors to Express error handling middleware
    next(error);
  }
};
