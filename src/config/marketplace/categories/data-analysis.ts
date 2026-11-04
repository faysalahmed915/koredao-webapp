// src/config/marketplace/categories/data-analysis.ts
//
// Category 6: Data Analysis & Statistics
// Slug: data-analysis
//
// Does not allow fabrication or manipulation of research results.

import type { MarketplaceCategory } from "../types";

export const DATA_ANALYSIS_CATEGORY: MarketplaceCategory = {
  id: "cat-data-analysis",
  title: "Data Analysis & Statistics",
  slug: "data-analysis",
  description:
    "SPSS, Excel, Python and R statistical tutoring and research analysis for academic projects.",
  enabled: true,
  subcategories: [
    {
      id: "sub-data-spss",
      title: "SPSS",
      slug: "spss",
      description: "SPSS statistical analysis tutoring.",
      enabled: true,
    },
    {
      id: "sub-data-excel",
      title: "Microsoft Excel",
      slug: "excel",
      description: "Excel-based data analysis tutoring.",
      enabled: true,
    },
    {
      id: "sub-data-python",
      title: "Python",
      slug: "python",
      description: "Python for data analysis tutoring.",
      enabled: true,
    },
    {
      id: "sub-data-r",
      title: "R Programming",
      slug: "r-programming",
      description: "R programming for statistical analysis tutoring.",
      enabled: true,
    },
    {
      id: "sub-data-statistical-analysis",
      title: "Statistical Analysis",
      slug: "statistical-analysis",
      description: "Statistical analysis guidance for research.",
      enabled: true,
    },
    {
      id: "sub-data-visualization",
      title: "Data Visualization",
      slug: "data-visualization",
      description: "Data visualization tutoring.",
      enabled: true,
    },
    {
      id: "sub-data-survey-processing",
      title: "Survey Data Processing",
      slug: "survey-data-processing",
      description: "Processing and cleaning survey data.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-statistical-analysis", "tag-data-visualization", "tag-survey-design"],
  defaultDeliveryModes: ["ONLINE", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "BOTH"],
  policyClassification: {
    "sub-data-spss": "CONDITIONAL",
    "sub-data-excel": "CONDITIONAL",
    "sub-data-python": "CONDITIONAL",
    "sub-data-r": "CONDITIONAL",
    "sub-data-statistical-analysis": "CONDITIONAL",
    "sub-data-visualization": "ALLOWED",
    "sub-data-survey-processing": "CONDITIONAL",
  },
  defaultPolicy: "CONDITIONAL",
  gigCategory: "DATA_ANALYSIS",
};

export default DATA_ANALYSIS_CATEGORY;
