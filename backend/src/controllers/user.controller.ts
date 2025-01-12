import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess, sendError } from "../utils/responseHandlers";
import { ValidationError } from "../utils/errors";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const result = await UserService.createUser(email, password);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await UserService.loginUser(email, password);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await UserService.getActiveUsers();
    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

export const getSecrets = (req: Request, res: Response): void => {
  const userId = (req as any).userId;
  const secrets = UserService.getSecrets(userId);
  sendSuccess(res, secrets);
};
