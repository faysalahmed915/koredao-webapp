// src/config/marketplace/education/madrasa.ts
//
// Bangladesh madrasa education pathway, kept separate from general education.
//
// Qawmi Madrasa is represented within this track as a clearly separated,
// optional level group. Its qualifications are NOT equated with the
// Bangladesh Madrasah Education Board pathway, and no equivalency or
// recognition claims are made.

import type { EducationLevel, EducationTrack } from "../types";

export const MADRASA_BOARD_LEVELS: readonly EducationLevel[] = [
  {
    id: "madrasa-ebtedayee",
    title: "Ebtedayee",
    slug: "ebtedayee",
    enabled: true,
    description: "Primary level under the Bangladesh Madrasah Education Board.",
  },
  {
    id: "madrasa-dakhil",
    title: "Dakhil",
    slug: "dakhil",
    enabled: true,
    description: "Secondary level under the Bangladesh Madrasah Education Board (equivalent stage to SSC, not a formal equivalency claim).",
  },
  {
    id: "madrasa-alim",
    title: "Alim",
    slug: "alim",
    enabled: true,
    description: "Higher secondary level under the Bangladesh Madrasah Education Board.",
  },
  {
    id: "madrasa-fazil",
    title: "Fazil",
    slug: "fazil",
    enabled: true,
    description: "Degree level under the Bangladesh Madrasah Education Board.",
  },
  {
    id: "madrasa-kamil",
    title: "Kamil",
    slug: "kamil",
    enabled: true,
    description: "Postgraduate level under the Bangladesh Madrasah Education Board.",
  },
] as const;

/** Qawmi Madrasa levels. Separate from the Board pathway; not equivalenced. */
export const QAWMI_MADRASA_LEVELS: readonly EducationLevel[] = [
  {
    id: "qawmi-muktaq",
    title: "Qawmi — Muktaq / Primary",
    slug: "qawmi-muktaq",
    enabled: true,
    description:
      "Qawmi madrasa primary stage. Not equated with the Bangladesh Madrasah Education Board pathway.",
  },
  {
    id: "qawmi-amin",
    title: "Qawmi — Amin",
    slug: "qawmi-amin",
    enabled: true,
    description:
      "Qawmi madrasa Amin stage. Not equated with the Bangladesh Madrasah Education Board pathway.",
  },
  {
    id: "qawmi-fazil",
    title: "Qawmi — Fazil",
    slug: "qawmi-fazil",
    enabled: true,
    description:
      "Qawmi madrasa Fazil stage. Not equated with the Bangladesh Madrasah Education Board pathway.",
  },
] as const;

export const MADRASA_TRACK: EducationTrack = {
  id: "madrasa",
  title: "Madrasa Education",
  slug: "madrasa",
  enabled: true,
  description:
    "Bangladesh madrasa education. The Bangladesh Madrasah Education Board pathway " +
    "(Ebtedayee, Dakhil, Alim, Fazil, Kamil) is kept separate from general education. " +
    "Qawmi Madrasa is listed separately and is not equated with Board qualifications.",
  levels: [...MADRASA_BOARD_LEVELS, ...QAWMI_MADRASA_LEVELS],
};

export default MADRASA_TRACK;
