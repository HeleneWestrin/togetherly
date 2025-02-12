import express from "express";
import * as OnboardingController from "../controllers/onboarding.controller";
import { authenticateUser } from "../middleware/authentication";

export const onboardingRouter = express.Router();

onboardingRouter.get(
  "/progress",
  authenticateUser,
  OnboardingController.getProgress
);
onboardingRouter.put(
  "/progress",
  authenticateUser,
  OnboardingController.updateProgress
);
