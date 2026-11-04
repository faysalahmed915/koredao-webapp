// src/config/marketplace/categories/tutoring.ts
//
// Category 4: Tutoring & Academic Guidance
// Slug: tutoring
//
// Supports one-to-one tutoring and academic mentoring across all tracks.

import type { MarketplaceCategory } from "../types";

export const TUTORING_CATEGORY: MarketplaceCategory = {
  id: "cat-tutoring",
  title: "Tutoring & Academic Guidance",
  slug: "tutoring",
  description:
    "One-to-one tutoring and academic mentoring across all Bangladesh education tracks and levels.",
  enabled: true,
  subcategories: [
    {
      id: "sub-tutoring-primary",
      title: "Primary Tutoring",
      slug: "primary",
      description: "Tutoring for Class 1–5 students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-junior",
      title: "Junior School Tutoring",
      slug: "junior",
      description: "Tutoring for Class 6–8 students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-ssc",
      title: "SSC Tutoring",
      slug: "ssc",
      description: "Tutoring for SSC (Class 9–10) students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-hsc",
      title: "HSC Tutoring",
      slug: "hsc",
      description: "Tutoring for HSC (Class 11–12) students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-madrasa",
      title: "Madrasa Tutoring",
      slug: "madrasa",
      description: "Tutoring for madrasa education pathways.",
      enabled: true,
    },
    {
      id: "sub-tutoring-vocational",
      title: "Vocational & Diploma Tutoring",
      slug: "vocational",
      description: "Tutoring for technical, vocational and diploma students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-university",
      title: "University Tutoring",
      slug: "university",
      description: "Tutoring for undergraduate and postgraduate students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-international",
      title: "English-Medium Tutoring",
      slug: "international",
      description: "Tutoring for Cambridge, Edexcel and English Version students.",
      enabled: true,
    },
    {
      id: "sub-tutoring-online",
      title: "Online Tutoring",
      slug: "online",
      description: "Tutoring delivered online.",
      enabled: true,
    },
    {
      id: "sub-tutoring-inperson",
      title: "In-Person Tutoring",
      slug: "in-person",
      description: "Tutoring delivered in person.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-tutoring", "tag-language-tutoring"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "BOTH"],
  policyClassification: {},
  defaultPolicy: "ALLOWED",
  gigCategory: "OTHER",
};

export default TUTORING_CATEGORY;
