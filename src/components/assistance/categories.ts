/**
 * Taxonomy definition for the public "Hire Assistance" navigation.
 *
 * Each entry maps a URL branch to the service categories the backend can
 * actually filter on, plus the optional level/branch filters exposed as chips.
 * Keeping this in one place means the mega-menu and the landing pages can never
 * drift apart, and no advertised link can 404.
 */

export type GigCategoryValue =
  | "ASSIGNMENT"
  | "LAB_REPORT"
  | "THESIS_RESEARCH"
  | "HANDWRITTEN_HARDCOPY"
  | "MATH_PROBLEM_SOLVING"
  | "PRESENTATION_SLIDES"
  | "OTHER";

export interface AssistanceLevel {
  /** URL segment, e.g. `ssc` in `/assistance/practical/ssc`. */
  slug: string;
  label: string;
  /** Free-text term applied to the search APIs for this branch. */
  search: string;
  description: string;
}

export interface AssistanceCategoryConfig {
  slug: string;
  title: string;
  description: string;
  /** One or more service categories merged into this landing page. */
  categories: GigCategoryValue[];
  levels: AssistanceLevel[];
  highlights: string[];
}

export const PRACTICAL_CATEGORY: AssistanceCategoryConfig = {
  slug: "practical",
  title: "Practical & Lab Assistance",
  description:
    "Lab reports, experiment write-ups, circuit analysis, notebook work and physical hardcopy practicals — delivered by verified campus helpers with escrow-protected payment.",
  categories: ["LAB_REPORT", "HANDWRITTEN_HARDCOPY"],
  levels: [
    {
      slug: "ssc",
      label: "SSC Practical",
      search: "SSC",
      description:
        "School-level practical notebooks, ICT lab work and science experiment records.",
    },
    {
      slug: "hsc",
      label: "HSC Practical",
      search: "HSC",
      description:
        "Higher-secondary physics, chemistry and biology practicals with accurate observations.",
    },
    {
      slug: "university",
      label: "University Practical",
      search: "University",
      description:
        "Engineering and computer-science lab reports, simulations and viva preparation.",
    },
  ],
  highlights: [
    "Observation tables, calculations and error analysis included",
    "Proteus / Multisim / MATLAB simulation screenshots on request",
    "Neat handwriting matched to your own notebook style",
  ],
};

export const RESEARCH_SURVEY_CATEGORY: AssistanceCategoryConfig = {
  slug: "research-and-survey",
  title: "Research & Survey Assistance",
  description:
    "Questionnaire design, field data collection, statistical analysis and research write-ups for academic projects.",
  categories: ["THESIS_RESEARCH"],
  levels: [
    {
      slug: "research",
      label: "Academic Research",
      search: "Research",
      description:
        "Literature reviews, methodology sections and data interpretation.",
    },
    {
      slug: "survey",
      label: "Survey Data Collection",
      search: "Survey",
      description:
        "Questionnaire distribution, respondent outreach and cleaned datasets.",
    },
  ],
  highlights: [
    "SPSS / Excel / Python analysis with reproducible outputs",
    "Plagiarism-aware drafting and citation formatting",
    "Milestone checkpoints so you approve each stage",
  ],
};

export const THESIS_CATEGORY: AssistanceCategoryConfig = {
  slug: "thesis",
  title: "Thesis & Dissertation Assistance",
  description:
    "Chapter-by-chapter thesis support: proposal, literature review, methodology, analysis, formatting and defence preparation.",
  categories: ["THESIS_RESEARCH"],
  levels: [],
  highlights: [
    "University-specific formatting and referencing styles",
    "Supervisor feedback turnaround between revisions",
    "Defence slide decks and viva question preparation",
  ],
};

export const ASSISTANCE_CATEGORIES: AssistanceCategoryConfig[] = [
  PRACTICAL_CATEGORY,
  RESEARCH_SURVEY_CATEGORY,
  THESIS_CATEGORY,
];

export function findAssistanceCategory(
  slug: string
): AssistanceCategoryConfig | undefined {
  return ASSISTANCE_CATEGORIES.find((c) => c.slug === slug);
}

/** Resolves a level from URL segments, tolerating deeper paths like `ssc/science`. */
export function findAssistanceLevel(
  config: AssistanceCategoryConfig,
  segments: string[]
): AssistanceLevel | undefined {
  if (segments.length === 0) return undefined;
  return config.levels.find((level) => level.slug === segments[0]);
}
