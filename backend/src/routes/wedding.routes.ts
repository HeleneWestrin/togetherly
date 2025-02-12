import { Router } from "express";
import * as WeddingController from "../controllers/wedding.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireWeddingAccess } from "../middleware/weddingAuth";
import { weddingSchemas } from "../validators/schemas";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";

export const weddingRouter = Router();

const updateGuestsRsvpSchema = z.object({
  guestIds: z.array(z.string()),
  rsvpStatus: weddingSchemas.rsvpStatus,
});

// Get all weddings (filtered by user role)
weddingRouter.get("/", authenticateUser, WeddingController.getWeddings);

// Get wedding by slug (must come before :weddingId route)
weddingRouter.get(
  "/by-slug/:slug",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.getWeddingBySlug
);

// Get specific wedding by ID
weddingRouter.get(
  "/:weddingId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.getWedding
);

// Create new wedding
weddingRouter.post("/", authenticateUser, WeddingController.createWedding);

// Add guest to wedding
weddingRouter.post(
  "/:weddingId/guests",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.addGuest
);

// Update RSVP status for multiple guests
weddingRouter.patch(
  "/:weddingId/guests/rsvp",
  authenticateUser,
  validateRequest(updateGuestsRsvpSchema),
  WeddingController.updateGuestsRSVP
);

// Update guest details
weddingRouter.patch(
  "/:weddingId/guests/:guestId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateGuest
);

// Delete guests
weddingRouter.delete(
  "/:weddingId/guests",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.deleteGuests
);

// Update task status
weddingRouter.patch(
  "/tasks/:taskId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateTask
);

// Update budget
weddingRouter.patch(
  "/:weddingId/budget",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateBudget
);

// Create wedding from onboarding
weddingRouter.post(
  "/onboarding",
  authenticateUser,
  WeddingController.createWeddingFromOnboarding
);

// Invite user to wedding
weddingRouter.post(
  "/:weddingId/users/invite",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.inviteUser
);

// Update user details
weddingRouter.patch(
  "/:weddingId/users/:userId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.updateUser
);

// Delete user from wedding
weddingRouter.delete(
  "/:weddingId/users/:userId",
  authenticateUser,
  requireWeddingAccess,
  WeddingController.deleteUser
);
