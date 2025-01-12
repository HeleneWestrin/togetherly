import { Router } from "express";
import { WeddingController } from "../controllers/wedding.controller";
import { authenticateUser } from "../middleware/authentication";
import { requireWeddingAccess } from "../middleware/weddingAuth";

export const weddingRouter = Router();

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

// Update RSVP status
weddingRouter.patch(
  "/:weddingId/rsvp",
  authenticateUser,
  WeddingController.updateRSVP
);
