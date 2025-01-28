import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess, sendError } from "../utils/responseHandlers";
import { ValidationError } from "../utils/errors";

/**
 * Creates a new user account
 * Validates required fields and delegates to UserService for account creation
 *
 * @param req - Express request object containing email and password in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new ValidationError("Email is required");
    }
    if (!password) {
      throw new ValidationError("Password is required");
    }
    if (password.length < 10) {
      throw new ValidationError("Password must be at least 10 characters long");
    }

    // Delegate user creation to service layer
    const result = await UserService.createUser(email, password);
    // Send successful response with 201 Created status
    sendSuccess(res, result, 201);
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Authenticates a user and generates a JWT token
 *
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 * @param next - Express next function for error handling
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    // Attempt to login user and generate token
    const result = await UserService.loginUser(email, password);
    // Send successful response with user data and token
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a list of all active users
 * Requires admin privileges (checked in route middleware)
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Fetch all active users from the database
    const users = await UserService.getActiveUsers();
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

export class UserController {
  static async completeOnboarding(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).userId;
      const { firstName, lastName } = req.body;

      const user = await UserService.completeOnboarding(userId, {
        firstName,
        lastName,
      });

      sendSuccess(res, { message: "Onboarding completed successfully" });
    } catch (error) {
      next(error);
    }
  }
}

// Export the method directly
export const completeOnboarding = UserController.completeOnboarding;
