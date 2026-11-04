// src/components/gigs/gig-types.ts
// Shared types for the reusable gig component layer.
// Designed to be importable from both (site) and (dashboard) without changes.

import type { Gig } from "@/lib/gigs-api";

/** Props for a single gig card. */
export interface GigCardProps {
  gig: Gig;
  /** Override the detail link target (default `/gigs/${gig.slug}`). */
  detailHref?: string;
  /** Whether to show the order/CTA button in the card footer. */
  showCta?: boolean;
}

/** Props for the reusable gig grid. */
export interface GigsGridProps {
  gigs: Gig[];
  loading?: boolean;
  emptyMessage?: string;
  detailHref?: (gig: Gig) => string;
  showCta?: boolean;
}

/** Current filter state for gig browsing. */
export interface GigFilterState {
  search: string;
  /** Multiple backend enum values (e.g. `["ASSIGNMENT", "LAB_REPORT"]`). Empty array = no category filter. */
  category: string[];
  university: string;
  requiresHardcopy: boolean | undefined;
  sortBy: string;
  /** Future: academic subject filter (disabled for now). */
  subject: string;
  /** Future: academic topic filter (disabled for now). */
  topic: string;
  /** Future: department filter (disabled for now). */
  department: string;
  /** Future: institution filter (disabled for now). */
  institution: string;
  /** Future: location filter (disabled for now). */
  location: string;
  /** Future: handwriting style filter (disabled for now). */
  handwritingStyle: string;
}

/** Category filter options shown in GigFilters dropdown. Values are backend GigCategory enum values. */
export interface GigCategoryOption {
  label: string;
  value: string;
  /** Corresponding marketplace category slug (for URL search params). */
  slug: string;
}

export const GIG_CATEGORY_OPTIONS: GigCategoryOption[] = [
  { label: "All Services", value: "", slug: "" },
  { label: "Assignments", value: "ASSIGNMENT", slug: "assignments" },
  { label: "Practical & Lab", value: "LAB_REPORT", slug: "practical-lab" },
  { label: "Research & Thesis", value: "THESIS_RESEARCH", slug: "research-thesis" },
  { label: "Tutoring", value: "OTHER", slug: "tutoring" },
  { label: "Study Materials", value: "STUDY_MATERIALS", slug: "study-materials" },
  { label: "Data Analysis", value: "DATA_ANALYSIS", slug: "data-analysis" },
  { label: "Programming & Technical", value: "OTHER", slug: "programming-technical" },
  { label: "Presentations & Reports", value: "PRESENTATION_SLIDES", slug: "presentations-reports" },
  { label: "Editing & Proofreading", value: "EDITING_PROOFREADING", slug: "editing-proofreading" },
  { label: "Translation & Transcription", value: "TRANSLATION_TRANSCRIPTION", slug: "translation-transcription" },
  { label: "Exam & Admission", value: "EXAM_ADMISSION", slug: "exam-admission" },
] as const;


/** Category filter options shown in GigFilters dropdown.
 * Values are stable taxonomy category IDs (not backend enum values).
 * Populated from canonical marketplace category definitions at runtime.
 */
export interface TaxonomyCategoryOption {
  label: string;
  value: string; // stable category ID
  slug: string; // URL-friendly slug
  description?: string;
}

/** Category options loaded from taxonomy config (replaces GIG_CATEGORY_OPTIONS). */
export const getTaxonomyCategories = (): TaxonomyCategoryOption[] => {
  return [];
};

/** Pre-built category options from the 11 marketplace categories (for backward compatibility during transition). */
export const LEGACY_CATEGORY_OPTIONS: readonly {
  label: string;
  value: string;
  slug: string;
}[] = [
  { label: "All Services", value: "", slug: "" },
  { label: "Assignments", value: "cat-assignments", slug: "assignments" },
  { label: "Practical & Lab", value: "cat-practical-lab", slug: "practical-lab" },
  { label: "Research & Thesis", value: "cat-research-thesis", slug: "research-thesis" },
  { label: "Tutoring", value: "cat-tutoring", slug: "tutoring" },
  { label: "Study Materials", value: "cat-study-materials", slug: "study-materials" },
  { label: "Data Analysis", value: "cat-data-analysis", slug: "data-analysis" },
  { label: "Programming & Technical", value: "cat-programming-technical", slug: "programming-technical" },
  { label: "Presentations & Reports", value: "cat-presentations-reports", slug: "presentations-reports" },
  { label: "Editing & Proofreading", value: "cat-editing-proofreading", slug: "editing-proofreading" },
  { label: "Translation & Transcription", value: "cat-translation-transcription", slug: "translation-transcription" },
  { label: "Exam & Admission", value: "cat-exam-admission", slug: "exam-admission" },
];
