// src/config/marketplace/categories/index.ts

import type { MarketplaceCategory } from "../types";
import { ASSIGNMENTS_CATEGORY } from "./assignments";
import { PRACTICAL_LAB_CATEGORY } from "./practical-lab";
import { RESEARCH_THESIS_CATEGORY } from "./research-thesis";
import { TUTORING_CATEGORY } from "./tutoring";
import { STUDY_MATERIALS_CATEGORY } from "./study-materials";
import { DATA_ANALYSIS_CATEGORY } from "./data-analysis";
import { PROGRAMMING_TECHNICAL_CATEGORY } from "./programming-technical";
import { PRESENTATIONS_REPORTS_CATEGORY } from "./presentations";
import { EDITING_PROOFREADING_CATEGORY } from "./editing";
import { TRANSLATION_TRANSCRIPTION_CATEGORY } from "./translation";
import { EXAM_ADMISSION_CATEGORY } from "./exam-preparation";

export type { MarketplaceCategory } from "../types";
export {
  ASSIGNMENTS_CATEGORY,
  PRACTICAL_LAB_CATEGORY,
  RESEARCH_THESIS_CATEGORY,
  TUTORING_CATEGORY,
  STUDY_MATERIALS_CATEGORY,
  DATA_ANALYSIS_CATEGORY,
  PROGRAMMING_TECHNICAL_CATEGORY,
  PRESENTATIONS_REPORTS_CATEGORY,
  EDITING_PROOFREADING_CATEGORY,
  TRANSLATION_TRANSCRIPTION_CATEGORY,
  EXAM_ADMISSION_CATEGORY,
};

export const ALL_MARKETPLACE_CATEGORIES: readonly MarketplaceCategory[] = [
  ASSIGNMENTS_CATEGORY,
  PRACTICAL_LAB_CATEGORY,
  RESEARCH_THESIS_CATEGORY,
  TUTORING_CATEGORY,
  STUDY_MATERIALS_CATEGORY,
  DATA_ANALYSIS_CATEGORY,
  PROGRAMMING_TECHNICAL_CATEGORY,
  PRESENTATIONS_REPORTS_CATEGORY,
  EDITING_PROOFREADING_CATEGORY,
  TRANSLATION_TRANSCRIPTION_CATEGORY,
  EXAM_ADMISSION_CATEGORY,
];

export function findMarketplaceCategory(
  slug: string,
): MarketplaceCategory | undefined {
  return ALL_MARKETPLACE_CATEGORIES.find((category) => category.slug === slug);
}

export function enabledCategories(): readonly MarketplaceCategory[] {
  return ALL_MARKETPLACE_CATEGORIES.filter((category) => category.enabled);
}

export function findSubcategory(
  categorySlug: string,
  subcategorySlug: string,
) {
  const category = findMarketplaceCategory(categorySlug);
  if (!category) return undefined;
  return category.subcategories.find((sub) => sub.slug === subcategorySlug);
}
