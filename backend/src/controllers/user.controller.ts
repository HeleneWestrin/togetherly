import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/responseHandlers";
import { ValidationError } from "../utils/errors";

/**
 * Creates a new user account
 * Validates required fields and delegates to UserService for account creation
 *
 * @param req - Express request object containing email and password in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 */
export class UserController {
  static async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw new ValidationError("Email is required");
      }
      if (!password) {
        throw new ValidationError("Password is required");
      }
      if (password.length < 10) {
        throw new ValidationError(
          "Password must be at least 10 characters long"
        );
      }

      const result = await UserService.createUser(email, password);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  static async loginUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await UserService.loginUser(email, password);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users = await UserService.getActiveUsers();
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }

  static async completeOnboarding(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).userId;
      const { firstName, lastName, phoneNumber, address } = req.body;

      await UserService.completeOnboarding(userId, {
        profile: {
          firstName,
          lastName,
          phoneNumber,
          address,
        },
      });

      sendSuccess(res, { message: "Onboarding completed successfully" });
    } catch (error) {
      next(error);
    }
  }
}

// Export all methods from the class
export const { createUser, loginUser, getUsers, completeOnboarding } =
  UserController;
