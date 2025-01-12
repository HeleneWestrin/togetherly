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

export const userRouter = Router();

const createUserSchema = z.object({
  email: userSchemas.email,
  password: userSchemas.password,
  profile: userSchemas.profile,
});

userRouter.post("/create", validateRequest(createUserSchema), createUser);

userRouter.post("/login", loginUser);

userRouter.get("/secrets", authenticateUser, getSecrets);

userRouter.get("/", authenticateUser, requireAdmin, getUsers);
