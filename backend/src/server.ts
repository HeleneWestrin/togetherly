import { app } from "./app";
import { connectDB } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT || 8080;

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
