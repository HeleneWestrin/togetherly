import { Request, Response, NextFunction } from "express";
import * as WeddingService from "../services/wedding.service";
import { sendSuccess } from "../utils/responseHandlers";
import { weddingSchemas } from "../validators/schemas";
import { z } from "zod";
import { createValidationError, createForbiddenError } from "../utils/errors";
import { WeddingPartyRoles, RSVPStatus } from "../types/constants";
import { User } from "../models/user.model";

export const getWeddings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const weddings = await WeddingService.getWeddingsForUser(userId);
    sendSuccess(res, weddings);
  } catch (error) {
    next(error);
  }
};

export const getWedding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const wedding = await WeddingService.getWeddingById(weddingId, userId);
    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const createWedding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingInfo } = req.body;

    // Create the wedding
    const wedding = await WeddingService.createWedding(weddingInfo);

    // Add wedding role for the creating user with defaults for couple users
    await User.findByIdAndUpdate(userId, {
      $push: {
        weddings: {
          weddingId: wedding._id,
          accessLevel: "couple",
          coupleDetails: { role: "Couple" },
          guestDetails: {
            rsvpStatus: RSVPStatus.CONFIRMED,
            partyRole: WeddingPartyRoles.COUPLE,
          },
        },
      },
    });

    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const getWeddingBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { slug } = req.params;
    const wedding = await WeddingService.getWeddingBySlug(slug, userId);
    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const { completed } = req.body;

    const task = await WeddingService.updateTask(taskId, completed, userId);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const task = await WeddingService.createTask(weddingId, req.body, userId);
    sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const result = await WeddingService.deleteTask(taskId, userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateTaskDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;
    const task = await WeddingService.updateTaskDetails(
      taskId,
      req.body,
      userId
    );
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const { total } = req.body;

    const wedding = await WeddingService.updateBudget(weddingId, total, userId);
    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const createWeddingFromOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const wedding = await WeddingService.createWeddingFromOnboarding(
      userId,
      req.body
    );
    sendSuccess(res, wedding, 201);
  } catch (error) {
    next(error);
  }
};

export const addGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;

    const guestData = {
      ...req.body,
      partyRole: req.body.partyRole || WeddingPartyRoles.GUEST,
      rsvpStatus: req.body.rsvpStatus || RSVPStatus.PENDING,
    };

    const validatedData = weddingSchemas.guestData.parse(guestData);

    const wedding = await WeddingService.addGuest(
      weddingId,
      validatedData,
      userId
    );
    sendSuccess(res, wedding);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(createValidationError(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

export const updateRSVP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const { rsvpStatus } = req.body;
    const user = await WeddingService.updateRSVP(weddingId, userId, rsvpStatus);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId, guestId } = req.params;
    const guestData = req.body;

    const wedding = await WeddingService.updateGuest(
      weddingId,
      guestId,
      guestData,
      userId
    );
    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const deleteGuests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const { guestIds } = req.body;

    const wedding = await WeddingService.deleteGuests(
      weddingId,
      guestIds,
      userId
    );
    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const inviteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const inviteData = req.body;

    const requestingUserRole = await WeddingService.getUserWeddingAccess(
      userId,
      weddingId
    );
    if (!requestingUserRole)
      throw createForbiddenError("No access to this wedding");

    validateRoleChange("guest", inviteData.accessLevel, requestingUserRole);

    const result = await WeddingService.inviteUser(
      weddingId,
      inviteData,
      userId
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateGuestsRSVP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { weddingId } = req.params;
    const { guestIds, rsvpStatus } = req.body;

    const wedding = await WeddingService.updateGuestsRSVP(
      weddingId,
      guestIds,
      rsvpStatus,
      userId
    );
    sendSuccess(res, wedding);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { weddingId, userId } = req.params;
    const requestingUserId = req.user.id;
    const userData = req.body;

    const requestingUser = await WeddingService.getUserWeddingAccess(
      requestingUserId,
      weddingId
    );
    const targetUser = await WeddingService.getUserWeddingAccess(
      userId,
      weddingId
    );

    if (userData.accessLevel && targetUser) {
      validateRoleChange(
        targetUser,
        userData.accessLevel,
        requestingUser || ""
      );
    }

    const result = await WeddingService.updateUser(
      weddingId,
      userId,
      userData,
      requestingUserId
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { weddingId, userId } = req.params;
    const requestingUserId = req.user.id;

    const result = await WeddingService.deleteUser(
      weddingId,
      userId,
      requestingUserId
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

const validateRoleChange = (
  currentRole: string,
  newRole: string,
  requestingUserRole: string
) => {
  if (newRole === "couple" && requestingUserRole !== "couple") {
    throw createForbiddenError(
      "Only existing couple members can add new couple members"
    );
  }
};
