// src/config/marketplace/categories/programming-technical.ts
//
// Category 7: Programming & Technical
// Slug: programming-technical
//
// Does not permit plagiarism or unauthorized access to systems.

import type { MarketplaceCategory } from "../types";

export const PROGRAMMING_TECHNICAL_CATEGORY: MarketplaceCategory = {
  id: "cat-programming-technical",
  title: "Programming & Technical",
  slug: "programming-technical",
  description:
    "Web and mobile development, Python, C/C++, Java, databases, debugging, code review and electronics projects.",
  enabled: true,
  subcategories: [
    {
      id: "sub-prog-web",
      title: "Web Development",
      slug: "web-development",
      description: "Web development tutoring and project guidance.",
      enabled: true,
    },
    {
      id: "sub-prog-mobile",
      title: "Mobile App Development",
      slug: "mobile-app-development",
      description: "Mobile app development tutoring.",
      enabled: true,
    },
    {
      id: "sub-prog-python",
      title: "Python Programming",
      slug: "python-programming",
      description: "Python programming tutoring.",
      enabled: true,
    },
    {
      id: "sub-prog-c",
      title: "C & C++",
      slug: "c-cpp",
      description: "C and C++ programming tutoring.",
      enabled: true,
    },
    {
      id: "sub-prog-java",
      title: "Java",
      slug: "java",
      description: "Java programming tutoring.",
      enabled: true,
    },
    {
      id: "sub-prog-database",
      title: "Database & SQL",
      slug: "database-sql",
      description: "Database and SQL tutoring.",
      enabled: true,
    },
    {
      id: "sub-prog-debugging",
      title: "Debugging",
      slug: "debugging",
      description: "Code debugging assistance.",
      enabled: true,
    },
    {
      id: "sub-prog-code-review",
      title: "Code Review",
      slug: "code-review",
      description: "Educational code review and feedback.",
      enabled: true,
    },
    {
      id: "sub-prog-microcontrollers",
      title: "Microcontrollers",
      slug: "microcontrollers",
      description: "Microcontroller and embedded systems tutoring.",
      enabled: true,
    },
    {
      id: "sub-prog-electronics",
      title: "Electronics Projects",
      slug: "electronics-projects",
      description: "Electronics project guidance.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-debugging", "tag-code-review", "tag-programming-microcontroller", "tag-electronics-projects"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "BOTH"],
  policyClassification: {
    "sub-prog-web": "ALLOWED",
    "sub-prog-mobile": "ALLOWED",
    "sub-prog-python": "ALLOWED",
    "sub-prog-c": "ALLOWED",
    "sub-prog-java": "ALLOWED",
    "sub-prog-database": "ALLOWED",
    "sub-prog-debugging": "ALLOWED",
    "sub-prog-code-review": "ALLOWED",
    "sub-prog-microcontrollers": "ALLOWED",
    "sub-prog-electronics": "ALLOWED",
  },
  defaultPolicy: "ALLOWED",
  gigCategory: "OTHER",
};

export default PROGRAMMING_TECHNICAL_CATEGORY;
