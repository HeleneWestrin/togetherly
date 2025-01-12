import express from "express";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./routes/user.routes";
import { errorHandler } from "./middleware/errorHandler";
import { weddingRouter } from "./routes/wedding.routes";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Togetherly API" });
});

// User routes
app.use("/users", userRouter);

// Wedding routes
app.use("/weddings", weddingRouter);

// Error handler should be last
app.use(errorHandler);
