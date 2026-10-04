import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(60, { message: "Name cannot exceed 60 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid business email" }),
  category: z.enum(["general", "sales", "security", "support"]),
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(120, { message: "Subject cannot exceed 120 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must contain at least 10 characters" })
    .max(1500, { message: "Message cannot exceed 1500 characters" }),
});

export type ContactInput = z.infer<typeof contactSchema>;
