import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "developmentSecret";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      res.status(401).json({ message: "Missing Authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      res.status(401).json({ message: "Bearer token missing" });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Attach userId to `req` object
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token", error });
  }
};
