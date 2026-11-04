// src/config/marketplace/education/general.ts
//
// Bangladesh National Curriculum (General Education) track.
// Levels and subjects follow the NCTB curriculum structure.

import type { EducationLevel, EducationTrack } from "../types";

export const GENERAL_EDUCATION_LEVELS: readonly EducationLevel[] = [
  // Primary
  {
    id: "general-class-1-5",
    title: "Class 1–5",
    slug: "class-1-5",
    enabled: true,
    description: "Primary education under the Bangladesh national curriculum.",
  },
  // Junior
  {
    id: "general-class-6-8",
    title: "Class 6–8",
    slug: "class-6-8",
    enabled: true,
    description: "Junior secondary education under the Bangladesh national curriculum.",
  },
  // SSC
  {
    id: "general-ssc",
    title: "SSC",
    slug: "ssc",
    enabled: true,
    description: "Secondary School Certificate (Class 9–10).",
  },
  // HSC
  {
    id: "general-hsc",
    title: "HSC",
    slug: "hsc",
    enabled: true,
    description: "Higher Secondary Certificate (Class 11–12).",
  },
] as const;

export const GENERAL_EDUCATION_TRACK: EducationTrack = {
  id: "general",
  title: "General Education",
  slug: "general",
  enabled: true,
  description:
    "Bangladesh national curriculum (NCTB): Primary, Junior, SSC and HSC.",
  levels: GENERAL_EDUCATION_LEVELS,
};

export default GENERAL_EDUCATION_TRACK;
