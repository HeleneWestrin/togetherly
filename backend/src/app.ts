import express from "express";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./routes/user.routes";
import { errorHandler } from "./middleware/errorHandler";
import { weddingRouter } from "./routes/wedding.routes";
import { taskRouter } from "./routes/task.routes";
import { onboardingRouter } from "./routes/onboarding.routes";

export const app = express();

console.log("CORS Allowed Origin:", process.env.FRONTEND_URL);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());

// Root route
app.get("/api/", (req, res) => {
  res.json({ message: "Welcome to the Togetherly API" });
});

// User routes
app.use("/api/users", userRouter);

// Wedding routes
app.use("/api/weddings", weddingRouter);

// Task routes
app.use("/api/tasks", taskRouter);

// Onboarding routes
app.use("/api/onboarding", onboardingRouter);

// Error handler should be last
app.use(errorHandler);
