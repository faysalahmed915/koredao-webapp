// src/config/marketplace/categories/editing.ts
//
// Category 9: Editing & Proofreading
// Slug: editing-proofreading
//
// Does not offer plagiarism evasion or rewriting intended to conceal
// academic misconduct.

import type { MarketplaceCategory } from "../types";

export const EDITING_PROOFREADING_CATEGORY: MarketplaceCategory = {
  id: "cat-editing-proofreading",
  title: "Editing & Proofreading",
  slug: "editing-proofreading",
  description:
    "Proofreading, document formatting, citation and referencing, grammar editing and academic structure feedback.",
  enabled: true,
  subcategories: [
    {
      id: "sub-editing-proofreading",
      title: "Proofreading",
      slug: "proofreading",
      description: "Academic document proofreading.",
      enabled: true,
    },
    {
      id: "sub-editing-formatting",
      title: "Document Formatting",
      slug: "document-formatting",
      description: "Document formatting support.",
      enabled: true,
    },
    {
      id: "sub-editing-citation",
      title: "Citation & Referencing",
      slug: "citation-referencing",
      description: "Citation and referencing guidance.",
      enabled: true,
    },
    {
      id: "sub-editing-grammar",
      title: "Grammar & Language Editing",
      slug: "grammar-language",
      description: "Grammar and language editing support.",
      enabled: true,
    },
    {
      id: "sub-editing-structure",
      title: "Academic Structure Feedback",
      slug: "academic-structure",
      description: "Academic structure and organization feedback.",
      enabled: true,
    },
    {
      id: "sub-editing-plagiarism",
      title: "Plagiarism-Free Writing Guidance",
      slug: "plagiarism-free",
      description: "Guidance on writing original, plagiarism-free work.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-proofreading", "tag-citation-referencing", "tag-grammar-editing", "tag-plagiarism-free-guidance"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "HARDCOPY", "BOTH"],
  policyClassification: {},
  defaultPolicy: "ALLOWED",
  gigCategory: "EDITING_PROOFREADING",
};

export default EDITING_PROOFREADING_CATEGORY;
