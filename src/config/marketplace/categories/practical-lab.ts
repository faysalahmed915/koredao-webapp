// src/config/marketplace/categories/practical-lab.ts
//
// Category 2: Practical & Lab Assistance
// Slug: practical-lab
//
// Never facilitates fabricated experimental results or false lab records.

import type { MarketplaceCategory } from "../types";

export const PRACTICAL_LAB_CATEGORY: MarketplaceCategory = {
  id: "cat-practical-lab",
  title: "Practical & Lab Assistance",
  slug: "practical-lab",
  description:
    "Physics, chemistry, biology, ICT and engineering lab practicals with experiment explanations and lab report feedback.",
  enabled: true,
  subcategories: [
    {
      id: "sub-practical-ssc",
      title: "SSC Practicals",
      slug: "ssc",
      description: "Practical assistance for SSC students.",
      enabled: true,
    },
    {
      id: "sub-practical-hsc",
      title: "HSC Practicals",
      slug: "hsc",
      description: "Practical assistance for HSC students.",
      enabled: true,
    },
    {
      id: "sub-practical-madrasa",
      title: "Madrasa Practicals",
      slug: "madrasa",
      description: "Practical assistance where relevant to madrasa education.",
      enabled: true,
    },
    {
      id: "sub-practical-vocational",
      title: "Vocational Practicals",
      slug: "vocational",
      description: "Technical and vocational practical assistance.",
      enabled: true,
    },
    {
      id: "sub-practical-diploma",
      title: "Diploma Labs",
      slug: "diploma",
      description: "Diploma-level laboratory assistance.",
      enabled: true,
    },
    {
      id: "sub-practical-university",
      title: "University Labs",
      slug: "university",
      description: "University-level laboratory and project assistance.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-practical-demonstration", "tag-lab-report-feedback"],
  defaultDeliveryModes: ["IN_PERSON", "HYBRID", "ONLINE"],
  defaultDeliverableFormats: ["DIGITAL", "HARDCOPY", "BOTH"],
  policyClassification: {
    "sub-practical-ssc": "ALLOWED",
    "sub-practical-hsc": "ALLOWED",
    "sub-practical-madrasa": "ALLOWED",
    "sub-practical-vocational": "ALLOWED",
    "sub-practical-diploma": "CONDITIONAL",
    "sub-practical-university": "CONDITIONAL",
  },
  defaultPolicy: "ALLOWED",
  gigCategory: "LAB_REPORT",
};

export default PRACTICAL_LAB_CATEGORY;
