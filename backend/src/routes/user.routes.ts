import { Router, Request, RequestHandler } from "express";
import {
  createUser,
  loginUser,
  getUsers,
} from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireAdmin } from "../middleware/adminAuth";
import { userSchemas } from "../validators/schemas";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { User } from "../models/user.model";
import { UserController } from "../controllers/user.controller";

// Initialize Express Router for user-related routes
export const userRouter = Router();

/**
 * Schema for validating user creation requests
 * Uses Zod for runtime type checking and validation
 * Requires:
 * - email (validated format)
 * - password (meets security requirements)
 * - profile information (name, contact details, etc.)
 */
const createUserSchema = z.object({
  email: userSchemas.email,
  password: userSchemas.password,
  profile: userSchemas.profile.optional(),
});

// Route Definitions:

/**
 * POST /create
 * Creates a new user account
 * Validates request body against createUserSchema before processing
 */
userRouter.post("/create", validateRequest(createUserSchema), createUser);

/**
 * POST /login
 * Authenticates user credentials and returns a JWT token
 */
userRouter.post("/login", loginUser);

/**
 * GET /
 * Admin-only route - requires both authentication and admin role
 * Returns list of all users in the system
 */
userRouter.get("/", authenticateUser, requireAdmin, getUsers);

/**
 * GET /
 * Google login route
 * Handles Google token verification and user creation/login
 */
userRouter.post("/auth/google/token", (async (
  req: Request & { body: { token: string } },
  res,
  next
) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    try {
      const payload = await AuthService.verifyGoogleToken(token);

      if (!payload?.email) {
        return res.status(400).json({ message: "Email not provided" });
      }

      // Find or create user
      let user = await User.findOne({ email: payload.email });
      const isNewUser = !user;
      if (!user) {
        user = await User.create({
          email: payload.email,
          password: "",
          profile: {
            firstName: payload.given_name || "",
            lastName: payload.family_name || "",
          },
          role: "couple",
          isActive: true,
          isRegistered: true,
          socialProvider: "google",
          socialId: payload.sub,
        });
      }

      // Generate JWT token
      const jwtToken = AuthService.generateToken(
        (user as User & { _id: { toString(): string } })._id.toString()
      );

      res.json({
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          isAdmin: user.isAdmin,
          profile: {
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
          },
        },
        isNewUser: isNewUser,
      });
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Server error:", error);
    next(error);
  }
}) as RequestHandler);

/**
 * PATCH /complete-onboarding
 * Updates user's isNewUser status after completing onboarding
 */
userRouter.patch(
  "/complete-onboarding",
  authenticateUser,
  UserController.completeOnboarding
);
