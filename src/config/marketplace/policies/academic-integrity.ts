// src/config/marketplace/policies/academic-integrity.ts
//
// Academic integrity & marketplace policy configuration.
//
// Policy classification is independent of navigation categories. The backend
// must enforce policies; hiding an item from the frontend is insufficient.

import type { ServicePolicy } from "../types";

/**
 * Policy classification for broad service types.
 *
 * ALLOWED - legitimate educational assistance.
 * CONDITIONAL - permitted only when the student remains responsible for
 *               assessed work and no impersonation / fabrication occurs.
 * PROHIBITED - academic dishonesty; must never be offered on the platform.
 */
export type ServiceTypePolicy = Record<string, ServicePolicy>;

export const SERVICE_TYPE_POLICIES: ServiceTypePolicy = {
  // ALLOWED
  tutoring: "ALLOWED",
  "subject-explanation": "ALLOWED",
  "study-notes": "ALLOWED",
  "learning-resources": "ALLOWED",
  "mock-tests": "ALLOWED",
  "language-tutoring": "ALLOWED",
  proofreading: "ALLOWED",
  formatting: "ALLOWED",
  "citation-guidance": "ALLOWED",
  "programming-concept-explanation": "ALLOWED",
  "survey-design": "ALLOWED",
  "legitimate-data-collection": "ALLOWED",
  "lab-demonstration": "ALLOWED",
  "handwriting-practice": "ALLOWED",
  "document-digitization": "ALLOWED",
  "accessibility-assistance": "ALLOWED",

  // CONDITIONAL
  "assignment-guidance": "CONDITIONAL",
  "research-writing-assistance": "CONDITIONAL",
  "thesis-guidance": "CONDITIONAL",
  dataanalysis: "CONDITIONAL",
  "lab-report-assistance": "CONDITIONAL",
  "academic-project-development": "CONDITIONAL",
  "presentation-preparation": "CONDITIONAL",

  // PROHIBITED
  "assignment-ghostwriting": "PROHIBITED",
  "thesis-ghostwriting": "PROHIBITED",
  "exam-impersonation": "PROHIBITED",
  "student-impersonation": "PROHIBITED",
  "fabricated-survey-responses": "PROHIBITED",
  "fabricated-lab-results": "PROHIBITED",
  "leaked-exam-questions": "PROHIBITED",
  "forged-certificates": "PROHIBITED",
  "plagiarism-detection-circumvention": "PROHIBITED",
} as const;

/** Default policy applied when a service type is not explicitly classified. */
export const DEFAULT_SERVICE_POLICY: ServicePolicy = "ALLOWED";

/**
 * Conditions that must be met for any CONDITIONAL service. These are enforced
 * by the backend and surfaced to users through listing descriptions and
 * moderation tooling.
 */
export const CONDITIONAL_SERVICE_CONDITIONS: readonly string[] = [
  "The student must remain responsible for their assessed work.",
  "The service must not involve impersonation.",
  "The service must comply with institutional academic-integrity rules.",
  "No fabricated data or results.",
  "No unauthorized exam assistance.",
  "The listing must clearly describe what the provider actually delivers.",
] as const;

/**
 * Prohibited service categories that must never appear as orderable services.
 * Used by backend validation and moderation review.
 */
export const PROHIBITED_SERVICE_TYPES: readonly string[] = Object.entries(
  SERVICE_TYPE_POLICIES,
)
  .filter(([, policy]) => policy === "PROHIBITED")
  .map(([type]) => type);

/**
 * Service types that require moderator review before publication because they
 * are conditional and can easily cross into academic dishonesty.
 */
export const MODERATION_REVIEW_SERVICE_TYPES: readonly string[] = Object.entries(
  SERVICE_TYPE_POLICIES,
)
  .filter(([, policy]) => policy === "CONDITIONAL")
  .map(([type]) => type);
