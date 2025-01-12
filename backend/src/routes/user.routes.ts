import { Router } from "express";
import {
  createUser,
  loginUser,
  getSecrets,
  getUsers,
} from "../controllers/user.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireAdmin } from "../middleware/adminAuth";

export const userRouter = Router();

userRouter.post("/create", createUser);

userRouter.post("/login", loginUser);

userRouter.get("/secrets", authenticateUser, getSecrets);

userRouter.get("/", authenticateUser, requireAdmin, getUsers);
