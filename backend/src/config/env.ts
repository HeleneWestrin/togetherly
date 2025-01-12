import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("8080"),
  MONGO_URI: z.string(),
  JWT_SECRET: z.string(),
  SEED_DATABASE: z.string().default("false"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
