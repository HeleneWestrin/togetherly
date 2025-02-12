const createError = (
  statusCode: number,
  message: string,
  isOperational: boolean = true
): Error => {
  const error = new Error(message);
  // Attach additional properties
  (error as any).statusCode = statusCode;
  (error as any).isOperational = isOperational;
  return error;
};

export const createValidationError = (message: string): Error => {
  const error = createError(400, message);
  error.name = "ValidationError";
  return error;
};

export const createAuthenticationError = (
  message: string = "Authentication failed"
): Error => {
  const error = createError(401, message);
  error.name = "AuthenticationError";
  return error;
};

export const createNotFoundError = (
  message: string = "Resource not found"
): Error => {
  const error = createError(404, message);
  error.name = "NotFoundError";
  return error;
};

export const createForbiddenError = (
  message: string = "Access denied"
): Error => {
  const error = createError(403, message);
  error.name = "ForbiddenError";
  return error;
};

export const createInternalServerError = (
  message: string = "Internal server error"
): Error => {
  const error = createError(500, message);
  error.name = "InternalServerError";
  return error;
};
