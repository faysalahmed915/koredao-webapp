// src/config/marketplace/education/international.ts
//
// English-Medium & International Curriculum track.
//
// English-medium education is NOT the same as English-version (NCTB) education.
// Cambridge and Pearson Edexcel are distinct curricula and are not treated as
// identical.

import type { EducationLevel, EducationTrack } from "../types";

const cambridgeLevels: readonly EducationLevel[] = [
  { id: "cambridge-primary", title: "Cambridge Primary", slug: "cambridge-primary", enabled: true, description: "Cambridge Primary curriculum." },
  { id: "cambridge-lower-secondary", title: "Cambridge Lower Secondary", slug: "cambridge-lower-secondary", enabled: true, description: "Cambridge Lower Secondary curriculum." },
  { id: "cambridge-igcse", title: "IGCSE", slug: "igcse", enabled: true, description: "Cambridge IGCSE." },
  { id: "cambridge-o-level", title: "O Level", slug: "o-level", enabled: true, description: "Cambridge O Level." },
  { id: "cambridge-as-level", title: "AS Level", slug: "as-level", enabled: true, description: "Cambridge AS Level." },
  { id: "cambridge-a-level", title: "A Level", slug: "a-level", enabled: true, description: "Cambridge A Level." },
] as const;

const edexcelLevels: readonly EducationLevel[] = [
  { id: "edexcel-international-gcse", title: "International GCSE", slug: "international-gcse", enabled: true, description: "Pearson Edexcel International GCSE." },
  { id: "edexcel-international-a-level", title: "International A Level", slug: "international-a-level", enabled: true, description: "Pearson Edexcel International A Level." },
] as const;

const englishVersionLevels: readonly EducationLevel[] = [
  { id: "english-version-class-1-5", title: "English Version Class 1–5", slug: "english-version-class-1-5", enabled: true, description: "NCTB English Version, Class 1–5." },
  { id: "english-version-class-6-8", title: "English Version Class 6–8", slug: "english-version-class-6-8", enabled: true, description: "NCTB English Version, Class 6–8." },
  { id: "english-version-ssc", title: "English Version SSC", slug: "english-version-ssc", enabled: true, description: "NCTB English Version SSC." },
  { id: "english-version-hsc", title: "English Version HSC", slug: "english-version-hsc", enabled: true, description: "NCTB English Version HSC." },
] as const;

export const INTERNATIONAL_TRACK: EducationTrack = {
  id: "international",
  title: "English-Medium & International Curriculum",
  slug: "international",
  enabled: true,
  description:
    "Cambridge, Pearson Edexcel and NCTB English Version. These are distinct " +
    "curricula and are not treated as equivalent to one another or to the " +
    "Bangladesh national curriculum (General Education).",
  levels: [...cambridgeLevels, ...edexcelLevels, ...englishVersionLevels],
};

export default INTERNATIONAL_TRACK;
