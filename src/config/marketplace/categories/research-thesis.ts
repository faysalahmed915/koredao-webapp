// src/config/marketplace/categories/research-thesis.ts
//
// Category 3: Research & Thesis
// Slug: research-thesis
//
// Does not permit fabricated survey responses, fabricated research data or
// thesis ghostwriting. Supports legitimate physical data collection.

import type { MarketplaceCategory } from "../types";

export const RESEARCH_THESIS_CATEGORY: MarketplaceCategory = {
  id: "cat-research-thesis",
  title: "Research & Thesis",
  slug: "research-thesis",
  description:
    "Research proposal, literature review, methodology, survey design, data collection, thesis and dissertation guidance.",
  enabled: true,
  subcategories: [
    {
      id: "sub-research-proposal",
      title: "Research Proposal Guidance",
      slug: "research-proposal",
      description: "Guidance on structuring academic research proposals.",
      enabled: true,
    },
    {
      id: "sub-research-literature-review",
      title: "Literature Review Guidance",
      slug: "literature-review",
      description: "Help finding and reviewing academic sources.",
      enabled: true,
    },
    {
      id: "sub-research-methodology",
      title: "Research Methodology",
      slug: "methodology",
      description: "Guidance on research methods and design.",
      enabled: true,
    },
    {
      id: "sub-research-survey-design",
      title: "Survey Design",
      slug: "survey-design",
      description: "Designing academic questionnaires and surveys.",
      enabled: true,
    },
    {
      id: "sub-research-data-collection",
      title: "Data Collection",
      slug: "data-collection",
      description: "Legitimate online and physical data collection support.",
      enabled: true,
    },
    {
      id: "sub-research-consultation",
      title: "Research Consultation",
      slug: "consultation",
      description: "One-to-one research consultation.",
      enabled: true,
    },
    {
      id: "sub-thesis-undergraduate",
      title: "Undergraduate Thesis Guidance",
      slug: "undergraduate-thesis",
      description: "Chapter-by-chapter undergraduate thesis support.",
      enabled: true,
    },
    {
      id: "sub-thesis-masters",
      title: "Master's Thesis Guidance",
      slug: "masters-thesis",
      description: "Chapter-by-chapter master's thesis support.",
      enabled: true,
    },
    {
      id: "sub-thesis-dissertation",
      title: "Dissertation Guidance",
      slug: "dissertation",
      description: "Dissertation chapter review and formatting support.",
      enabled: true,
    },
    {
      id: "sub-thesis-chapter-review",
      title: "Chapter Review",
      slug: "chapter-review",
      description: "Review and feedback on thesis chapters.",
      enabled: true,
    },
    {
      id: "sub-thesis-formatting",
      title: "Research Formatting",
      slug: "formatting",
      description: "Referencing and document formatting for research work.",
      enabled: true,
    },
    {
      id: "sub-survey-online",
      title: "Online Surveys",
      slug: "online-surveys",
      description: "Online survey design and distribution support.",
      enabled: true,
    },
    {
      id: "sub-survey-physical",
      title: "Physical Surveys",
      slug: "physical-surveys",
      description: "Physical field survey and observation support in Bangladesh.",
      enabled: true,
    },
    {
      id: "sub-survey-interviews",
      title: "Interviews",
      slug: "interviews",
      description: "Academic interview design and conduct support.",
      enabled: true,
    },
    {
      id: "sub-survey-field",
      title: "Field Data Collection",
      slug: "field-data-collection",
      description: "Field-based data collection for research projects.",
      enabled: true,
    },
    {
      id: "sub-survey-observation",
      title: "Observation-Based Research",
      slug: "observation-research",
      description: "Observation-based research guidance.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-survey-design", "tag-interviews", "tag-field-research", "tag-statistical-analysis", "tag-data-visualization", "tag-citation-referencing"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "BOTH"],
  policyClassification: {
    "sub-research-proposal": "CONDITIONAL",
    "sub-research-literature-review": "ALLOWED",
    "sub-research-methodology": "CONDITIONAL",
    "sub-research-survey-design": "ALLOWED",
    "sub-research-data-collection": "CONDITIONAL",
    "sub-research-consultation": "ALLOWED",
    "sub-thesis-undergraduate": "CONDITIONAL",
    "sub-thesis-masters": "CONDITIONAL",
    "sub-thesis-dissertation": "CONDITIONAL",
    "sub-thesis-chapter-review": "CONDITIONAL",
    "sub-thesis-formatting": "ALLOWED",
    "sub-survey-online": "ALLOWED",
    "sub-survey-physical": "CONDITIONAL",
    "sub-survey-interviews": "CONDITIONAL",
    "sub-survey-field": "CONDITIONAL",
    "sub-survey-observation": "CONDITIONAL",
  },
  defaultPolicy: "CONDITIONAL",
  gigCategory: "THESIS_RESEARCH",
};

export default RESEARCH_THESIS_CATEGORY;
