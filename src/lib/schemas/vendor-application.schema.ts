import { z } from "zod";

export const AcademicLevelSchema = z.enum([
  "UNDERGRADUATE",
  "GRADUATE",
  "POSTGRADUATE",
  "DOCTORATE",
  "OTHER",
]);

export const HandwritingStyleSchema = z.enum([
  "CURSIVE",
  "PRINT",
  "MIXED",
  "MATH_EQUATION",
]);

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function coerceNumber(value: unknown) {
  if (value === "" || value === undefined || value === null) return undefined;
  return Number(value);
}

export const vendorApplicationSchema = z.object({
  realName: z
    .string()
    .min(2, "Real name must be at least 2 characters")
    .max(100, "Real name must be at most 100 characters"),
  university: z.string().min(1, "University is required"),
  department: z.string().min(1, "Department is required"),
  academicLevel: AcademicLevelSchema,
  degree: z.string().optional(),
  passingYear: z
    .preprocess(coerceNumber, z.number().int().min(2000, "Year must be ≥ 2000").max(2100, "Year must be ≤ 2100"))
    .optional(),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional(),
  skills: z.string().optional().default(""),
  idCardUrl: z
    .string()
    .min(1, "Student ID document URL is required")
    .refine(isValidUrl, "Enter a valid URL (e.g. https://example.com/id.jpg)"),
  handwritingSamples: z
    .array(
      z.object({
        sampleUrl: z
          .string()
          .min(1, "Image URL is required")
          .refine(isValidUrl, "Enter a valid URL"),
        style: HandwritingStyleSchema,
        neatnessScore: z
          .preprocess(coerceNumber, z.number().int().min(1, "Score must be between 1 and 10").max(10, "Score must be between 1 and 10"))
          .optional(),
        description: z.string().optional(),
      })
    )
    .min(1, "Add at least one handwriting sample"),
});

export type VendorApplicationInput = z.infer<typeof vendorApplicationSchema>;
