// src/config/marketplace/education/technical-vocational.ts
//
// Technical, vocational, diploma and skills-based education track.

import type { EducationLevel, EducationTrack } from "../types";

export const TECHNICAL_VOCATIONAL_LEVELS: readonly EducationLevel[] = [
  {
    id: "vocational-ssc",
    title: "SSC Vocational",
    slug: "ssc-vocational",
    enabled: true,
    description: "Secondary School Certificate (Vocational) track.",
  },
  {
    id: "vocational-hsc",
    title: "HSC Vocational",
    slug: "hsc-vocational",
    enabled: true,
    description: "Higher Secondary Certificate (Vocational) track.",
  },
  {
    id: "vocational-diploma-engineering",
    title: "Diploma in Engineering",
    slug: "diploma-engineering",
    enabled: true,
    description: "Polytechnic diploma in engineering disciplines.",
  },
  {
    id: "vocational-diploma-agriculture",
    title: "Diploma in Agriculture",
    slug: "diploma-agriculture",
    enabled: true,
    description: "Diploma in agriculture technology.",
  },
  {
    id: "vocational-diploma-textile",
    title: "Diploma in Textile",
    slug: "diploma-textile",
    enabled: true,
    description: "Diploma in textile engineering / technology.",
  },
  {
    id: "vocational-trade",
    title: "Trade & Skills Training",
    slug: "trade-skills",
    enabled: true,
    description: "Trade and skills-based vocational training.",
  },
] as const;

export const TECHNICAL_VOCATIONAL_TRACK: EducationTrack = {
  id: "technical-vocational",
  title: "Technical & Vocational Education",
  slug: "technical-vocational",
  enabled: true,
  description:
    "Technical, vocational, diploma and skills-based education. Physical " +
    "services support geographic matching when applicable.",
  levels: TECHNICAL_VOCATIONAL_LEVELS,
};

export default TECHNICAL_VOCATIONAL_TRACK;
