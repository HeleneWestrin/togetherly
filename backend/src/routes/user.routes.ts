import { Router } from "express";
import {
  createUser,
  loginUser,
  getSecrets,
  getUsers,
} from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireAdmin } from "../middleware/adminAuth";
import { userSchemas } from "../validators/schemas";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

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
 * GET /secrets
 * Protected route - requires valid JWT token
 * Returns sensitive data only for authenticated users
 */
userRouter.get("/secrets", authenticateUser, getSecrets);

/**
 * GET /
 * Admin-only route - requires both authentication and admin role
 * Returns list of all users in the system
 */
userRouter.get("/", authenticateUser, requireAdmin, getUsers);
