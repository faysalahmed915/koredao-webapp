// src/config/marketplace/types.ts
//
// Shared types for the KoreDao marketplace taxonomy.
//
// These concepts are intentionally independent and reusable:
//   - Marketplace categories (what service is offered)
//   - Education tracks (which education system)
//   - Academic levels (student's education level)
//   - Subjects (reusable across categories)
//   - Delivery modes & deliverable formats
//   - Service tags & service policy
//
// Stable ids and slugs are used throughout so the taxonomy can migrate to a
// database later without breaking historical references.

/** How a service is delivered to the customer. */
export type DeliveryMode = "ONLINE" | "IN_PERSON" | "HYBRID";

/** What the customer receives. */
export type DeliverableFormat = "DIGITAL" | "HARDCOPY" | "BOTH";

/**
 * Independent academic-integrity classification of a service.
 *
 * Classification is independent of navigation categories: disabling
 * assignment ghostwriting (PROHIBITED) must not disable legitimate
 * assignment tutoring (ALLOWED / CONDITIONAL).
 */
export type ServicePolicy = "ALLOWED" | "CONDITIONAL" | "PROHIBITED";

/** KoreDao is Bangladesh-only at launch. */
export type SupportedCountry = "Bangladesh";

/** A reusable subject or technical area, shared across all categories. */
export interface Subject {
  id: string;
  title: string;
  slug: string;
  description?: string;
  enabled: boolean;
}

/** A specific piece of work involved in a service. */
export interface ServiceTag {
  id: string;
  title: string;
  slug: string;
  description?: string;
  enabled: boolean;
}

/** One level within an education track (e.g. SSC, HSC, Dakhil). */
export interface EducationLevel {
  id: string;
  title: string;
  slug: string;
  enabled: boolean;
  description?: string;
}

/** One education track (e.g. General Education, Madrasa Education). */
export interface EducationTrack {
  id: string;
  title: string;
  slug: string;
  enabled: boolean;
  description: string;
  levels: readonly EducationLevel[];
}

/** A subcategory within a marketplace category. */
export interface MarketplaceSubcategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  enabled: boolean;
  /** Subjects especially relevant to this subcategory (by subject id). */
  relevantSubjects?: string[];
}

/** Policy classification keyed by subcategory id or service id. */
export interface ServicePolicyMap {
  [entityId: string]: ServicePolicy;
}

/**
 * A top-level marketplace category.
 *
 * Categories work across all relevant education tracks and academic levels.
 * Subjects are referenced by id and are not duplicated per category.
 */
export interface MarketplaceCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  enabled: boolean;
  subcategories: MarketplaceSubcategory[];
  /** Service tags relevant to this category (by tag id). */
  relevantTags?: string[];
  /** Default delivery modes offered in this category. */
  defaultDeliveryModes?: DeliveryMode[];
  /** Default deliverable formats offered in this category. */
  defaultDeliverableFormats?: DeliverableFormat[];
  /**
   * Policy classification per subcategory or service.
   * Missing entries fall back to the category-level default policy.
   */
  policyClassification?: ServicePolicyMap;
  /** Default policy applied when no entry matches (default ALLOWED). */
  defaultPolicy?: ServicePolicy;
  /**
   * Backend enum value used when querying the gigs/jobs API (e.g. `ASSIGNMENT`,
   * `LAB_REPORT`). Optional — falls back to `category.slug` if not set.
   */
  gigCategory?: string;
}

/**
 * Full marketplace configuration. Every track, level, category, subcategory
 * and service can be enabled or disabled independently. Disabling does not
 * delete historical data.
 */
export interface MarketplaceTaxonomy {
  country: SupportedCountry;
  categories: readonly MarketplaceCategory[];
  educationTracks: readonly EducationTrack[];
  subjects: readonly Subject[];
  serviceTags: readonly ServiceTag[];
  deliveryModes: readonly DeliveryMode[];
  deliverableFormats: readonly DeliverableFormat[];
  servicePolicies: readonly ServicePolicy[];
  locationLevels: readonly LocationLevel[];
}

/** Geographic location hierarchy supported for in-person matching. */
export interface LocationLevel {
  id: string;
  title: string;
  slug: string;
  enabled: boolean;
}

/** Result of looking up a category by slug. */
export interface CategoryLookup {
  category: MarketplaceCategory;
  /** URL path used to reach the category landing page. */
  path: string;
}

/** Result of looking up an education track by slug. */
export interface TrackLookup {
  track: EducationTrack;
  path: string;
}
