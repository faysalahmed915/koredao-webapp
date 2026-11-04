// src/config/marketplace/delivery.ts
//
// Reusable service attributes for delivery mode, deliverable format and
// geographic location. These are independent of categories and education.

import type {
  DeliverableFormat,
  DeliveryMode,
  LocationLevel,
  SupportedCountry,
} from "./types";

/** KoreaDao is Bangladesh-only at launch. International marketplace
 * functionality is intentionally not built. */
export const MARKETPLACE_COUNTRY: SupportedCountry = "Bangladesh";

export const MARKETPLACE_COUNTRY_CODE = "BD";

/** All supported delivery modes. */
export const DELIVERY_MODES: readonly DeliveryMode[] = [
  "ONLINE",
  "IN_PERSON",
  "HYBRID",
] as const;

/** All supported deliverable formats. */
export const DELIVERABLE_FORMATS: readonly DeliverableFormat[] = [
  "DIGITAL",
  "HARDCOPY",
  "BOTH",
] as const;

/** Human-readable labels for delivery modes (translation keys). */
export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  ONLINE: "marketplace.delivery.online",
  IN_PERSON: "marketplace.delivery.inPerson",
  HYBRID: "marketplace.delivery.hybrid",
};

/** Human-readable labels for deliverable formats (translation keys). */
export const DELIVERABLE_FORMAT_LABELS: Record<DeliverableFormat, string> = {
  DIGITAL: "marketplace.format.digital",
  HARDCOPY: "marketplace.format.hardcopy",
  BOTH: "marketplace.format.both",
};

/** Geographic levels available for location-based filtering. */
export const LOCATION_LEVELS: readonly LocationLevel[] = [
  { id: "country", title: "marketplace.location.country", slug: "country", enabled: true },
  { id: "division", title: "marketplace.location.division", slug: "division", enabled: true },
  { id: "district", title: "marketplace.location.district", slug: "district", enabled: true },
  { id: "city", title: "marketplace.location.city", slug: "city", enabled: true },
  { id: "area", title: "marketplace.location.area", slug: "area", enabled: true },
] as const;

/** Bangladesh divisions used for location filtering (config-only, no hardcoded
 * address data that would expose personal locations). */
export const BANGLADESH_DIVISIONS: readonly string[] = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
] as const;
