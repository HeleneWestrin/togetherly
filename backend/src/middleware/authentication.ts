import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createAuthenticationError } from "../utils/errors";

// Secret key used for JWT verification, loaded from environment variables
const JWT_SECRET = env.JWT_SECRET;

// Extend the JWT payload interface to include our userId field
interface JwtPayload extends jwt.JwtPayload {
  userId: string;
}

/**
 * Middleware to authenticate requests using JWT tokens
 * Validates the Authorization header and verifies the JWT token
 * Adds the userId to the request object if authentication is successful
 */
export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if Authorization header exists and starts with "Bearer "
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw createAuthenticationError("Invalid Authorization header format");
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw createAuthenticationError("Bearer token missing");
    }

    try {
      // Verify the JWT token and decode its payload
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      if (!decoded.userId) {
        throw createAuthenticationError("Invalid token payload");
      }
      // Add the userId to the request object for use in subsequent middleware/routes
      (req as any).userId = decoded.userId;
      next();
    } catch (jwtError) {
      // Handle specific JWT verification errors
      throw createAuthenticationError(
        jwtError instanceof jwt.TokenExpiredError
          ? "Token expired"
          : "Invalid token"
      );
    }
  } catch (error) {
    // Pass any errors to Express error handling middleware
    next(error);
  }
};
