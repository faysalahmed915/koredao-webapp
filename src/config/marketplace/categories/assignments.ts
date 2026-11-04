// src/config/marketplace/categories/assignments.ts
//
// Category 1: Assignments & Coursework
// Slug: assignments
//
// Academic-integrity restrictions apply: assignment guidance is CONDITIONAL;
// completing graded work for submission as another person's work is
// PROHIBITED and must not appear as an orderable service.

import type { MarketplaceCategory } from "../types";

export const ASSIGNMENTS_CATEGORY: MarketplaceCategory = {
  id: "cat-assignments",
  title: "Assignments & Coursework",
  slug: "assignments",
  description:
    "Academic assignment guidance, coursework support and subject-specific learning assistance.",
  enabled: true,
  subcategories: [
    {
      id: "sub-assignments-school",
      title: "School Assignments",
      slug: "school",
      description: "Primary and junior-school assignment guidance.",
      enabled: true,
      relevantSubjects: ["subject-bangla", "subject-english", "subject-ict", "subject-mathematics", "subject-general-science"],
    },
    {
      id: "sub-assignments-ssc",
      title: "SSC Assignments",
      slug: "ssc",
      description: "Secondary School Certificate (Class 9–10) assignment guidance.",
      enabled: true,
      relevantSubjects: ["subject-bangla", "subject-english", "subject-ict", "subject-mathematics", "subject-general-science", "subject-physics", "subject-chemistry", "subject-biology", "subject-higher-mathematics", "subject-history", "subject-geography", "subject-civics", "subject-economics", "subject-accounting", "subject-finance-banking", "subject-business-entrepreneurship"],
    },
    {
      id: "sub-assignments-hsc",
      title: "HSC Assignments",
      slug: "hsc",
      description: "Higher Secondary Certificate (Class 11–12) assignment guidance.",
      enabled: true,
    },
    {
      id: "sub-assignments-madrasa",
      title: "Madrasa Assignments",
      slug: "madrasa",
      description: "Assignment guidance for madrasa education pathways.",
      enabled: true,
    },
    {
      id: "sub-assignments-diploma",
      title: "Diploma Assignments",
      slug: "diploma",
      description: "Technical and vocational diploma assignment guidance.",
      enabled: true,
    },
    {
      id: "sub-assignments-university",
      title: "University Assignments",
      slug: "university",
      description: "Undergraduate and postgraduate assignment guidance.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-tutoring", "tag-proofreading", "tag-chapter-summary", "tag-exam-preparation"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "HARDCOPY", "BOTH"],
  policyClassification: {
    "sub-assignments-school": "CONDITIONAL",
    "sub-assignments-ssc": "CONDITIONAL",
    "sub-assignments-hsc": "CONDITIONAL",
    "sub-assignments-madrasa": "CONDITIONAL",
    "sub-assignments-diploma": "CONDITIONAL",
    "sub-assignments-university": "CONDITIONAL",
  },
  defaultPolicy: "CONDITIONAL",
  gigCategory: "ASSIGNMENT",
};

export default ASSIGNMENTS_CATEGORY;
