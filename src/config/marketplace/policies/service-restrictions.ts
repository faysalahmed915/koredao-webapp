// src/config/marketplace/policies/service-restrictions.ts
//
// Maps marketplace categories and subcategories to service-policy
// classifications. Classification is independent of navigation: disabling
// one classification never disables another.

import type { MarketplaceCategory } from "../types";
import type { ServicePolicy } from "../types";
import {
  CONDITIONAL_SERVICE_CONDITIONS,
  DEFAULT_SERVICE_POLICY,
  SERVICE_TYPE_POLICIES,
} from "./academic-integrity";

/** Default policy applied per category when no subcategory entry matches. */
export const CATEGORY_DEFAULT_POLICY: Record<string, ServicePolicy> = {
  assignments: "CONDITIONAL",
  "practical-lab": "ALLOWED",
  "research-thesis": "CONDITIONAL",
  tutoring: "ALLOWED",
  "study-materials": "ALLOWED",
  "data-analysis": "CONDITIONAL",
  "programming-technical": "ALLOWED",
  "presentations-reports": "ALLOWED",
  "editing-proofreading": "ALLOWED",
  "translation-transcription": "ALLOWED",
  "exam-admission": "CONDITIONAL",
} as const;

/**
 * Resolves the effective policy for a category or subcategory.
 *
 * Falls back to CATEGORY_DEFAULT_POLICY then DEFAULT_SERVICE_POLICY.
 * Disabling a policy classification must not delete historical data.
 */
export function resolveServicePolicy(
  categorySlug: string,
  subcategorySlug?: string,
): ServicePolicy {
  if (subcategorySlug) {
    const key = `${categorySlug}.${subcategorySlug}`;
    if (key in SERVICE_TYPE_POLICIES) {
      return SERVICE_TYPE_POLICIES[key];
    }
  }
  if (categorySlug in CATEGORY_DEFAULT_POLICY) {
    return CATEGORY_DEFAULT_POLICY[categorySlug];
  }
  return DEFAULT_SERVICE_POLICY;
}

/** Conditions to surface for conditional categories in listing forms. */
export function conditionalServiceConditions(categorySlug: string): readonly string[] {
  const policy = resolveServicePolicy(categorySlug);
  if (policy === "CONDITIONAL") {
    return CONDITIONAL_SERVICE_CONDITIONS;
  }
  return [];
}

/**
 * Attaches resolved policy metadata to each category so the UI can render
 * integrity chips and moderation hints without duplicating logic.
 */
export function annotateCategoriesWithPolicy(
  categories: readonly MarketplaceCategory[],
): MarketplaceCategory[] {
  return categories.map((category) => ({
    ...category,
    defaultPolicy: resolveServicePolicy(category.slug),
  }));
}
