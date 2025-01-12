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
      req[location] = data; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError(error.errors[0].message));
      } else {
        next(error);
      }
    }
  };
};
