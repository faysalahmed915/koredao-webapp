// src/config/marketplace/categories/study-materials.ts
//
// Category 5: Notes & Study Materials
// Slug: study-materials
//
// Only legally shareable materials. Respects copyright; does not facilitate
// distribution of leaked examination papers.

import type { MarketplaceCategory } from "../types";

export const STUDY_MATERIALS_CATEGORY: MarketplaceCategory = {
  id: "cat-study-materials",
  title: "Notes & Study Materials",
  slug: "study-materials",
  description:
    "Lecture notes, study guides, question banks, exam suggestions and chapter summaries across all education tracks.",
  enabled: true,
  subcategories: [
    {
      id: "sub-materials-lecture-notes",
      title: "Lecture Notes",
      slug: "lecture-notes",
      description: "Legally shareable lecture notes.",
      enabled: true,
    },
    {
      id: "sub-materials-study-guides",
      title: "Study Guides",
      slug: "study-guides",
      description: "Level-by-level study guidance.",
      enabled: true,
    },
    {
      id: "sub-materials-question-banks",
      title: "Question Banks",
      slug: "question-banks",
      description: "Practice question banks by subject and level.",
      enabled: true,
    },
    {
      id: "sub-materials-exam-suggestions",
      title: "Exam Suggestions",
      slug: "exam-suggestions",
      description: "Exam suggestion and guidance materials.",
      enabled: true,
    },
    {
      id: "sub-materials-past-papers",
      title: "Past Papers",
      slug: "past-papers",
      description: "Legally shareable past papers.",
      enabled: true,
    },
    {
      id: "sub-materials-chapter-summaries",
      title: "Chapter Summaries",
      slug: "chapter-summaries",
      description: "Chapter summaries and key points.",
      enabled: true,
    },
    {
      id: "sub-materials-practice-questions",
      title: "Practice Questions",
      slug: "practice-questions",
      description: "Practice questions for self-assessment.",
      enabled: true,
    },
    {
      id: "sub-materials-learning-resources",
      title: "Learning Resources",
      slug: "learning-resources",
      description: "General academic learning resources.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-chapter-summary", "tag-mcq-practice", "tag-cq-practice"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "HARDCOPY", "BOTH"],
  policyClassification: {},
  defaultPolicy: "ALLOWED",
  gigCategory: "STUDY_MATERIALS",
};

export default STUDY_MATERIALS_CATEGORY;
