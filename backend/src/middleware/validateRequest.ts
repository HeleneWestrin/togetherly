import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../utils/errors";

export const validateRequest = (
  schema: z.ZodTypeAny,
  location: "body" | "query" | "params" = "body"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[location]);
      req[location] = data;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          const field = err.path.join(".");
          return `${field}: ${err.message}`;
        });

        next(new ValidationError(errorMessages.join(", ")));
      } else {
        next(error);
      }
    }
  };
};
