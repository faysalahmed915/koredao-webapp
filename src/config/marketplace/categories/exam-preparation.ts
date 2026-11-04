// src/config/marketplace/categories/exam-preparation.ts
//
// Category 11: Exam & Admission Preparation
// Slug: exam-admission
//
// Never allows impersonation or taking examinations on behalf of students.

import type { MarketplaceCategory } from "../types";

export const EXAM_ADMISSION_CATEGORY: MarketplaceCategory = {
  id: "cat-exam-admission",
  title: "Exam & Admission Preparation",
  slug: "exam-admission",
  description:
    "Mock exams, practice materials and tutoring for SSC, HSC, Dakhil, Alim, O/A Level, university and professional admission exams.",
  enabled: true,
  subcategories: [
    {
      id: "sub-exam-primary",
      title: "Primary Exam Preparation",
      slug: "primary-exam",
      description: "Primary-level exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-junior",
      title: "Junior School Preparation",
      slug: "junior-exam",
      description: "Junior-school exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-ssc",
      title: "SSC Preparation",
      slug: "ssc-preparation",
      description: "SSC exam preparation and mock tests.",
      enabled: true,
    },
    {
      id: "sub-exam-hsc",
      title: "HSC Preparation",
      slug: "hsc-preparation",
      description: "HSC exam preparation and mock tests.",
      enabled: true,
    },
    {
      id: "sub-exam-dakhil",
      title: "Dakhil Preparation",
      slug: "dakhil-preparation",
      description: "Dakhil exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-alim",
      title: "Alim Preparation",
      slug: "alim-preparation",
      description: "Alim exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-o-level",
      title: "O Level Preparation",
      slug: "o-level-preparation",
      description: "O Level exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-a-level",
      title: "A Level Preparation",
      slug: "a-level-preparation",
      description: "A Level exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-university",
      title: "University Admission",
      slug: "university-admission",
      description: "University admission preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-medical",
      title: "Medical Admission",
      slug: "medical-admission",
      description: "Medical admission test preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-engineering",
      title: "Engineering Admission",
      slug: "engineering-admission",
      description: "Engineering admission test preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-competitive",
      title: "Competitive Exams",
      slug: "competitive-exams",
      description: "Competitive exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-bcs",
      title: "BCS Preparation",
      slug: "bcs-preparation",
      description: "BCS exam preparation.",
      enabled: true,
    },
    {
      id: "sub-exam-professional",
      title: "Professional Certification Preparation",
      slug: "professional-certification",
      description: "Professional certification exam preparation.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-exam-preparation", "tag-admission-preparation", "tag-mcq-practice", "tag-model-test"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "BOTH"],
  policyClassification: {
    "sub-exam-primary": "ALLOWED",
    "sub-exam-junior": "ALLOWED",
    "sub-exam-ssc": "ALLOWED",
    "sub-exam-hsc": "ALLOWED",
    "sub-exam-dakhil": "ALLOWED",
    "sub-exam-alim": "ALLOWED",
    "sub-exam-o-level": "ALLOWED",
    "sub-exam-a-level": "ALLOWED",
    "sub-exam-university": "CONDITIONAL",
    "sub-exam-medical": "CONDITIONAL",
    "sub-exam-engineering": "CONDITIONAL",
    "sub-exam-competitive": "CONDITIONAL",
    "sub-exam-bcs": "CONDITIONAL",
    "sub-exam-professional": "CONDITIONAL",
  },
  defaultPolicy: "ALLOWED",
  gigCategory: "EXAM_ADMISSION",
};

export default EXAM_ADMISSION_CATEGORY;
