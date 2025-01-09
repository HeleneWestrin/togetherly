import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user.routes";

export const app = express();

app.use(cors());
app.use(express.json());

// TO-DO: Fix documentation route
app.get("/", (req, res) => {
  res.send("Welcome to the Togetherly API");
});

// Base routes
app.use("/users", userRouter);
