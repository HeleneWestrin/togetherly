import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createAuthenticationError } from "../utils/errors";

// Extend the JWT payload interface to include our userId field.
interface JwtPayload extends jwt.JwtPayload {
  userId: string;
}

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      createAuthenticationError(
        "Authorization header missing or improperly formatted"
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    // Attach the user id to the request object.
    req.user = { id: payload.userId };
    next();
  } catch (error) {
    next(createAuthenticationError("Invalid or expired token"));
  }
}
