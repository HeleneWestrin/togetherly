import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthenticationError } from "../utils/errors";

const JWT_SECRET = env.JWT_SECRET;

interface JwtPayload extends jwt.JwtPayload {
  userId: string;
}

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthenticationError("Invalid Authorization header format");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AuthenticationError("Bearer token missing");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      if (!decoded.userId) {
        throw new AuthenticationError("Invalid token payload");
      }
      (req as any).userId = decoded.userId;
      next();
    } catch (jwtError) {
      throw new AuthenticationError(
        jwtError instanceof jwt.TokenExpiredError
          ? "Token expired"
          : "Invalid token"
      );
    }
  } catch (error) {
    next(error);
  }
};
