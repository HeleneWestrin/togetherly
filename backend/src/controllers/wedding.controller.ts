import { Request, Response, NextFunction } from "express";
import { WeddingService } from "../services/wedding.service";
import { sendSuccess } from "../utils/responseHandlers";
import { weddingSchemas } from "../validators/schemas";
import { z } from "zod";
import { ValidationError } from "../utils/errors";

export class WeddingController {
  static async getWeddings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const weddings = await WeddingService.getWeddingsForUser(userId);
      sendSuccess(res, weddings);
    } catch (error) {
      next(error);
    }
  }

  static async getWedding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { weddingId } = req.params;
      const wedding = await WeddingService.getWeddingById(weddingId, userId);
      sendSuccess(res, wedding);
    } catch (error) {
      next(error);
    }
  }

  static async createWedding(req: Request, res: Response, next: NextFunction) {
    try {
      const wedding = await WeddingService.createWedding(req.body);
      sendSuccess(res, wedding, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getWeddingBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).userId;
      const { slug } = req.params;
      const wedding = await WeddingService.getWeddingBySlug(slug, userId);
      sendSuccess(res, wedding);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { taskId } = req.params;
      const { completed } = req.body;

      const task = await WeddingService.updateTask(taskId, completed, userId);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }

  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const task = await WeddingService.createTask(req.body, userId);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { taskId } = req.params;
      const result = await WeddingService.deleteTask(taskId, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).userId;
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
  }

  static async updateBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { weddingId } = req.params;
      const { total } = req.body;

      const wedding = await WeddingService.updateBudget(
        weddingId,
        total,
        userId
      );
      sendSuccess(res, wedding);
    } catch (error) {
      next(error);
    }
  }

  static async createWeddingFromOnboarding(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).userId;
      const wedding = await WeddingService.createWeddingFromOnboarding(
        userId,
        req.body
      );
      sendSuccess(res, wedding, 201);
    } catch (error) {
      next(error);
    }
  }

  static async addGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { weddingId } = req.params;

      // Ensure role is included with a default value if not provided
      const guestData = {
        ...req.body,
        role: req.body.role || "Guest", // Set default role if not provided
      };

      // Validate guest data
      const validatedData = weddingSchemas.guestData.parse(guestData);

      const wedding = await WeddingService.addGuest(
        weddingId,
        validatedData,
        userId
      );
      sendSuccess(res, wedding);
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error.errors[0].message));
      } else {
        next(error);
      }
    }
  }

  static async updateRSVP(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { weddingId } = req.params;
      const { rsvpStatus } = req.body;
      const user = await WeddingService.updateRSVP(
        weddingId,
        userId,
        rsvpStatus
      );
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  static async updateGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
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
  }

  static async deleteGuests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
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
  }

  static async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { weddingId } = req.params;
      const inviteData = req.body;

      const result = await WeddingService.inviteUser(
        weddingId,
        inviteData,
        userId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateGuestsRSVP(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).userId;
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
  }
}
