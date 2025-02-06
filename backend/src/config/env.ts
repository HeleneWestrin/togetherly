import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  BACKEND_URL: z.string().min(1, "BACKEND_URL is required"),
  FRONTEND_URL: z.string().min(1, "FRONTEND_URL is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("8080"),
  SEED_DATABASE: z.string().default("false"),
});

// Arrow function to load and validate the environment variables
const loadEnv = () => {
  const parsedEnv = envSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsedEnv.error.format()
    );
    process.exit(1);
  }
  return parsedEnv.data;
};

// Export the validated environment variables
export const env = loadEnv();
