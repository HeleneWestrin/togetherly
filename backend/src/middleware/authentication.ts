import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthenticationError } from "../utils/errors";

const JWT_SECRET = env.JWT_SECRET;

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new AuthenticationError("Missing Authorization header");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      throw new AuthenticationError("Bearer token missing");
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Attach userId to `req` object
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};
