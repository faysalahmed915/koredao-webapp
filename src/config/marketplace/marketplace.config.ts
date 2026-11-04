// src/config/marketplace/marketplace.config.ts
//
// Root marketplace configuration. Composes categories, education tracks,
// subjects, tags, delivery attributes and policy rules into a single
// taxonomoy object.
//
// Everything here is static configuration for the first implementation. It is
// designed to be migrated to a database-driven taxonomy later: ids and slugs
// are stable, and disabling an item never deletes historical data.

import type { MarketplaceTaxonomy } from "./types";
import { MARKETPLACE_COUNTRY, DELIVERY_MODES, DELIVERABLE_FORMATS, LOCATION_LEVELS } from "./delivery";
import { ALL_MARKETPLACE_CATEGORIES } from "./categories";
import { ALL_EDUCATION_TRACKS } from "./education";
import { SUBJECTS } from "./subjects";
import { SERVICE_TAGS } from "./tags";
import { annotateCategoriesWithPolicy } from "./policies";

export const SERVICE_POLICIES: readonly ("ALLOWED" | "CONDITIONAL" | "PROHIBITED")[] = [
  "ALLOWED",
  "CONDITIONAL",
  "PROHIBITED",
] as const;

/**
 * Complete marketplace taxonomy. Categories and education tracks are
 * independently configurable; subjects are shared across categories.
 *
 * Disabling a category, track, level or service does not delete historical
 * data. It only removes the item from discovery surfaces.
 */
export const marketplaceTaxonomy: MarketplaceTaxonomy = {
  country: MARKETPLACE_COUNTRY,
  categories: annotateCategoriesWithPolicy(ALL_MARKETPLACE_CATEGORIES),
  educationTracks: ALL_EDUCATION_TRACKS,
  subjects: SUBJECTS,
  serviceTags: SERVICE_TAGS,
  deliveryModes: DELIVERY_MODES,
  deliverableFormats: DELIVERABLE_FORMATS,
  servicePolicies: SERVICE_POLICIES,
  locationLevels: LOCATION_LEVELS,
};

export default marketplaceTaxonomy;
