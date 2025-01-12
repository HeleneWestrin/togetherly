import { Request, Response, NextFunction } from "express";
import { WeddingService } from "../services/wedding.service";
import { sendSuccess } from "../utils/responseHandlers";

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

  static async addGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { weddingId } = req.params;
      const { guestEmail } = req.body;
      const wedding = await WeddingService.addGuest(
        weddingId,
        guestEmail,
        userId
      );
      sendSuccess(res, wedding);
    } catch (error) {
      next(error);
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
}
