import { Request, Response } from "express";
import { OnboardingProgress } from "../models/onboarding.model";

export const getProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const progress = await OnboardingProgress.findOne({
      userId: (req as any).userId,
    });
    res.json({ status: "success", data: progress });
  } catch (error) {
    console.error("Onboarding progress error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch onboarding progress",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { step, coupleInfo, weddingInfo, completed } = req.body;
    const progress = await OnboardingProgress.findOneAndUpdate(
      { userId: (req as any).userId },
      {
        $set: {
          step,
          ...(coupleInfo && { coupleInfo }),
          ...(weddingInfo && { weddingInfo }),
          ...(completed !== undefined && { completed }),
          lastUpdated: new Date(),
        },
      },
      { new: true, upsert: true }
    );
    res.json({ status: "success", data: progress });
  } catch (error) {
    console.error("Onboarding update error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update onboarding progress",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
