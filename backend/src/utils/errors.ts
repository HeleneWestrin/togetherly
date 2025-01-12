export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(403, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(500, message);
  }
}
