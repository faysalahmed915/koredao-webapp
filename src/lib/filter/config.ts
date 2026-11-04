/**
 * Filter Configuration - Data-driven filter definitions for KoreDao marketplace.
 * Filter options resolved from canonical taxonomy at runtime.
 */

import type { DeliveryMode, DeliverableFormat } from "@/config/marketplace/types";

export type FilterControlType = "select" | "multi-select" | "search-select" | "range" | "toggle";

export interface FilterDependency {
  dependsOn: string;
  onParentChange: "removeInvalid" | "retainValid";
}

export interface BaseFilterConfig {
  id: string;
  label: string;
  description: string;
  controlType: FilterControlType;
  multiSelect: boolean;
  searchable: boolean;
  dependsOn?: FilterDependency;
  startVisible: boolean;
  enabled: boolean;
}

export interface TaxonomyFilterConfig extends BaseFilterConfig {
  type: "taxonomy";
  entityType: "CATEGORY" | "SERVICE" | "EDUCATION_TRACK" | "ACADEMIC_LEVEL" | "SUBJECT" | "SPECIALIZATION" | "TAG";
}

export interface ListingAttributeFilterConfig extends BaseFilterConfig {
  type: "listing-attribute";
  options: ReadonlyArray<{ id: string; label: string }>;
}

export interface InstitutionFilterConfig extends BaseFilterConfig {
  type: "institution";
}

export interface LocationFilterConfig extends BaseFilterConfig {
  type: "location";
}

export interface PriceFilterConfig extends BaseFilterConfig {
  type: "price";
  min: number;
  max: number;
  step: number;
}

export interface SortConfig {
  id: string;
  label: string;
  value: string;
  default?: boolean;
}

export type FilterConfig =
  | TaxonomyFilterConfig
  | ListingAttributeFilterConfig
  | InstitutionFilterConfig
  | LocationFilterConfig
  | PriceFilterConfig;

export interface FilterGroupConfig {
  id: string;
  title: string;
  description: string;
  startExpanded: boolean;
  filters: string[];
}

export interface FilterValue {
  filterId: string;
  value: string | string[];
  label: string;
}

export interface FilterDraft {
  [filterId: string]: FilterValue | null;
}

export interface AppliedFilters {
  [filterId: string]: FilterValue;
}

export interface FilterState {
  draft: FilterDraft;
  applied: AppliedFilters;
  groups: Record<string, FilterGroupConfig>;
}