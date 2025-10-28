import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().default(""),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
  CORS_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn("⚠️  Environment configuration incomplete:", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      OPENAI_API_KEY: "",
      PORT: 4000,
      DATABASE_URL: undefined,
      NODE_ENV: process.env.NODE_ENV ?? "development",
      SENTRY_DSN: process.env.SENTRY_DSN,
      CORS_ORIGINS: process.env.CORS_ORIGINS,
    };
