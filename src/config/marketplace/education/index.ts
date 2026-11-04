// src/config/marketplace/education/index.ts

import type { EducationLevel, EducationTrack } from "../types";
import { GENERAL_EDUCATION_TRACK } from "./general";
import { MADRASA_TRACK } from "./madrasa";
import { TECHNICAL_VOCATIONAL_TRACK } from "./technical-vocational";
import { INTERNATIONAL_TRACK } from "./international";
import { HIGHER_EDUCATION_TRACK } from "./higher-education";

export type { EducationLevel, EducationTrack } from "../types";
export {
  GENERAL_EDUCATION_TRACK,
  GENERAL_EDUCATION_LEVELS,
} from "./general";
export {
  MADRASA_TRACK,
  MADRASA_BOARD_LEVELS,
  QAWMI_MADRASA_LEVELS,
} from "./madrasa";
export {
  TECHNICAL_VOCATIONAL_TRACK,
  TECHNICAL_VOCATIONAL_LEVELS,
} from "./technical-vocational";
export { INTERNATIONAL_TRACK } from "./international";
export {
  HIGHER_EDUCATION_TRACK,
  HIGHER_EDUCATION_LEVELS,
} from "./higher-education";

export const ALL_EDUCATION_TRACKS: readonly EducationTrack[] = [
  GENERAL_EDUCATION_TRACK,
  MADRASA_TRACK,
  TECHNICAL_VOCATIONAL_TRACK,
  INTERNATIONAL_TRACK,
  HIGHER_EDUCATION_TRACK,
];

export function findEducationTrack(
  slug: string,
): EducationTrack | undefined {
  return ALL_EDUCATION_TRACKS.find((track) => track.slug === slug);
}

export function findEducationLevel(
  trackSlug: string,
  levelSlug: string,
): EducationLevel | undefined {
  const track = findEducationTrack(trackSlug);
  if (!track) return undefined;
  return track.levels.find((level) => level.slug === levelSlug);
}

export function enabledEducationTracks(): readonly EducationTrack[] {
  return ALL_EDUCATION_TRACKS.filter((track) => track.enabled);
}
