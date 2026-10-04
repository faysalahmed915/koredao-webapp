import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(64, { message: "Name cannot exceed 64 characters" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must include at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must include at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must include at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must include at least one special character" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
