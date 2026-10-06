import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional().default("3001"),
  APP_NAME: z.string().default("NextEnterprise"),
  APP_URL: z.string().url().default("http://localhost:3001"),
  APP_DESCRIPTION: z.string().default(
    "High-performance, secure, SEO-optimized enterprise frontend starter built with Next.js App Router, shadcn/ui, Better-Auth, and Zod."
  ),
  BACKEND_URL: z.string().url().default("http://localhost:3000/api/v1"),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  APP_DESCRIPTION: process.env.APP_DESCRIPTION,
  BACKEND_URL: process.env.BACKEND_URL,
  AUTH_URL: process.env.AUTH_URL,
});
