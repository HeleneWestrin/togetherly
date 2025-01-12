import { Response } from "express";

interface ApiResponse {
  status: "success" | "error";
  data?: any;
  message?: string;
}

export const sendSuccess = (
  res: Response,
  data: any,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    status: "success",
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400
): void => {
  res.status(statusCode).json({
    status: "error",
    message,
  });
};
