import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract statusCode if available, default to 500
  const statusCode = (err as any).statusCode || 500;

  // Determine error code; if statusCode exists, use the error's constructor name, else default to 'InternalServerError'
  const code = (err as any).statusCode
    ? err.constructor.name
    : "InternalServerError";

  // Log the error
  console.error("Error occurred:", err);

  res.status(statusCode).json({
    status: "error",
    message: err.message,
    code: code,
    path: req.path,
  });
};
