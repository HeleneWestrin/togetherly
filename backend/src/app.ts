import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./routes/user.routes";
import { errorHandler } from "./middleware/errorHandler";
import { weddingRouter } from "./routes/wedding.routes";
import { taskRouter } from "./routes/task.routes";
import { onboardingRouter } from "./routes/onboarding.routes";

export const app = express();

// Configure CORS to only allow requests from our frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Add security headers with Helmet
app.use(helmet());

// Health check endpoint
app.get("/api/", (req, res) => {
  res.json({
    message: "Welcome to the Togetherly API",
    endpoints: listEndpoints(app),
  });
});

// Register route modules
app.use("/api/users", userRouter);
app.use("/api/weddings", weddingRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/onboarding", onboardingRouter);

// Global error handler - must be last middleware
app.use(errorHandler);
