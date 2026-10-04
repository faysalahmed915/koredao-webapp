import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional().default("3001"),
  NEXT_PUBLIC_APP_NAME: z.string().default("NextEnterprise"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_DESCRIPTION: z.string().default(
    "High-performance, secure, SEO-optimized enterprise frontend starter built with Next.js App Router, shadcn/ui, Better-Auth, and Zod."
  ),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().default("http://localhost:3000/api/v1"),
  NEXT_PUBLIC_AUTH_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
});
