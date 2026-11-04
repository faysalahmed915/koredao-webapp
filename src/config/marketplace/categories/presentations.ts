// src/config/marketplace/categories/presentations.ts
//
// Category 8: Presentations & Reports
// Slug: presentations-reports
//
// Academic-integrity rules distinguish formatting and coaching from
// ghostwriting assessed work.

import type { MarketplaceCategory } from "../types";

export const PRESENTATIONS_REPORTS_CATEGORY: MarketplaceCategory = {
  id: "cat-presentations-reports",
  title: "Presentations & Reports",
  slug: "presentations-reports",
  description:
    "PowerPoint and seminar presentations, lab and technical reports, project documentation and report formatting.",
  enabled: true,
  subcategories: [
    {
      id: "sub-presentations-ppt",
      title: "PowerPoint Presentations",
      slug: "powerpoint-presentations",
      description: "PowerPoint presentation design and coaching.",
      enabled: true,
    },
    {
      id: "sub-presentations-seminar",
      title: "Seminar Presentations",
      slug: "seminar-presentations",
      description: "Seminar presentation preparation and coaching.",
      enabled: true,
    },
    {
      id: "sub-reports-lab",
      title: "Lab Reports",
      slug: "lab-reports",
      description: "Lab report structure and feedback.",
      enabled: true,
    },
    {
      id: "sub-reports-technical",
      title: "Technical Reports",
      slug: "technical-reports",
      description: "Technical report structure and feedback.",
      enabled: true,
    },
    {
      id: "sub-reports-project-docs",
      title: "Project Documentation",
      slug: "project-documentation",
      description: "Academic project documentation support.",
      enabled: true,
    },
    {
      id: "sub-presentations-design",
      title: "Presentation Design",
      slug: "presentation-design",
      description: "Presentation slide design support.",
      enabled: true,
    },
    {
      id: "sub-reports-formatting",
      title: "Report Formatting",
      slug: "report-formatting",
      description: "Academic report formatting support.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-presentation-design", "tag-report-formatting", "tag-technical-report"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "HARDCOPY", "BOTH"],
  policyClassification: {
    "sub-presentations-ppt": "CONDITIONAL",
    "sub-presentations-seminar": "CONDITIONAL",
    "sub-reports-lab": "CONDITIONAL",
    "sub-reports-technical": "CONDITIONAL",
    "sub-reports-project-docs": "CONDITIONAL",
    "sub-presentations-design": "ALLOWED",
    "sub-reports-formatting": "ALLOWED",
  },
  defaultPolicy: "CONDITIONAL",
  gigCategory: "PRESENTATION_SLIDES",
};

export default PRESENTATIONS_REPORTS_CATEGORY;
