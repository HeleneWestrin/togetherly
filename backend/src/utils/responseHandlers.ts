import { Response } from "express";
import { ApiResponse } from "../types/api.types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    status: "success",
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400
): void => {
  const response: ApiResponse = {
    status: "error",
    message,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
};
