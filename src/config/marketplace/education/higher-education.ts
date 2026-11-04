// src/config/marketplace/education/higher-education.ts
//
// Higher education track: undergraduate, postgraduate, professional and
// research education. Professional and regulated qualifications are
// represented accurately; no equivalency claims are made.

import type { EducationLevel, EducationTrack } from "../types";

export const HIGHER_EDUCATION_LEVELS: readonly EducationLevel[] = [
  {
    id: "higher-undergraduate",
    title: "Undergraduate",
    slug: "undergraduate",
    enabled: true,
    description: "Bachelor's degree and undergraduate studies.",
  },
  {
    id: "higher-postgraduate",
    title: "Postgraduate",
    slug: "postgraduate",
    enabled: true,
    description: "Master's and postgraduate studies.",
  },
  {
    id: "higher-professional",
    title: "Professional Education",
    slug: "professional",
    enabled: true,
    description: "Professional and regulated qualification programmes.",
  },
  {
    id: "higher-research",
    title: "Research Education",
    slug: "research",
    enabled: true,
    description: "MPhil, PhD and research-based programmes.",
  },
] as const;

export const HIGHER_EDUCATION_TRACK: EducationTrack = {
  id: "higher-education",
  title: "Higher Education",
  slug: "higher-education",
  enabled: true,
  description:
    "Undergraduate, postgraduate, professional and research education. " +
    "Professional and regulated qualifications are represented accurately.",
  levels: HIGHER_EDUCATION_LEVELS,
};

export default HIGHER_EDUCATION_TRACK;
