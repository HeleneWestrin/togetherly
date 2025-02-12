import { app } from "./app";
import { connectDB } from "./config/database";
import { env } from "./config/env";
import { seedDatabase } from "./utils/seedDatabase";

const startServer = async (): Promise<void> => {
  await connectDB();

  // Only seed in development environment
  if (env.NODE_ENV === "development" && env.SEED_DATABASE === "true") {
    try {
      await seedDatabase();
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
  });
};

startServer().catch((error) => {
  if (
    error &&
    typeof (error as any).statusCode === "number" &&
    (error as any).isOperational
  ) {
    console.error(`${(error as any).statusCode} - ${(error as any).message}`);
  } else {
    console.error("Failed to start server:", error);
  }
  process.exit(1);
});
