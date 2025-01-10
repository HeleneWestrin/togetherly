import { Router } from "express";
import {
  createUser,
  loginUser,
  getSecrets,
} from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authentication";

export const userRouter = Router();

userRouter.post("/create", createUser);
userRouter.post("/login", loginUser);

// This is a protected route for testing purposes only
userRouter.get("/secrets", authenticateUser, getSecrets);
