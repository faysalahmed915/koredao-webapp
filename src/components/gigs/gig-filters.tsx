"use client";

import * as React from "react";
import { Search, Filter, ChevronDown, X, Clock, Check, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";
import type { GigFilterState } from "./gig-types";
import { getTaxonomyCategories, LEGACY_CATEGORY_OPTIONS } from "./gig-types";

export interface GigFiltersProps {
  value: GigFilterState;
  onChange: (next: GigFilterState) => void;
}

const sortOptions = [
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Orders", value: "orders" },
] as const;

export function GigFilters({ value, onChange }: GigFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [draft, setDraft] = React.useState<GigFilterState>(value);

  const activeSort = sortOptions.find((option) => option.value === draft.sortBy);

  const hasActiveFilters =
    draft.search.trim().length > 0 ||
    draft.category.length > 0 ||
    Boolean(draft.university) ||
    draft.requiresHardcopy === true ||
    draft.sortBy !== "rating";

  const activeFilterCount =
    (draft.search.trim().length > 0 ? 1 : 0) +
    draft.category.length +
    (Boolean(draft.university) ? 1 : 0) +
    (draft.requiresHardcopy === true ? 1 : 0) +
    (draft.sortBy !== "rating" ? 1 : 0);

  const updateDraft = <K extends keyof GigFilterState>(
    key: K,
    nextValue: GigFilterState[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: nextValue }));
  };

  const toggleCategory = (value: string) => {
    setDraft((current: GigFilterState) => {
      const next = current.category.includes(value)
        ? current.category.filter((v: string) => v !== value)
        : [...current.category, value];
      return { ...current, category: next };
    });
  };

  const isCategorySelected = (value: string) =>
    draft.category.includes(value);

  const handleApply = () => {
    onChange(draft);
    setIsExpanded(false);
  };

  const handleClear = () => {
    const cleared: GigFilterState = {
      ...value,
      search: "",
      category: [],
      university: "",
      requiresHardcopy: false,
      sortBy: "rating",
      subject: "",
      topic: "",
      department: "",
      institution: "",
      location: "",
      handwritingStyle: "",
    };
    setDraft(cleared);
    onChange(cleared);
    setIsExpanded(false);
  };

  const removeFilter = (key: keyof GigFilterState, resetValue: string | boolean) => {
    const updated = {
      ...draft,
      [key]: resetValue,
    } as GigFilterState;
    setDraft(updated);
    onChange(updated);
  };

  const removeCategory = (value: string) => {
    setDraft((current: GigFilterState) => {
      const next = current.category.filter((v: string) => v !== value);
      return { ...current, category: next };
    });
    const nextState = (() => {
      const next = draft.category.filter((v: string) => v !== value);
      return { ...draft, category: next };
    })();
    onChange(nextState);
  };

  return (
    <div className="mb-8 rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Always-visible search and selected filters */}
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by subject, skills, helper name..."
              className="h-11 pl-10"
              value={draft.search}
              onChange={(e) => updateDraft("search", e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(value);
              setIsExpanded((previous) => !previous);
            }}
            aria-expanded={isExpanded}
            aria-controls="gig-filter-panel"
            className={cn(
              "h-11 shrink-0 gap-2",
              isExpanded && "border-indigo-500 text-indigo-600",
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="h-5 min-w-5 justify-center rounded-full px-1.5">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Selected filters */}
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters ? (
            <>
              <span className="text-xs font-medium text-muted-foreground">
                Active filters:
              </span>

              {draft.search.trim().length > 0 && (
                <Badge variant="secondary" className="gap-1.5 py-1">
                  &quot;{draft.search}&quot;
                  <button
                    type="button"
                    aria-label="Remove search filter"
                    onClick={() => removeFilter("search", "")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {draft.category.map((catSlug) => {
                const option = LEGACY_CATEGORY_OPTIONS.find((o) => o.slug === catSlug);
                return (
                  <Badge
                    key={catSlug}
                    variant="secondary"
                    className="gap-1.5 py-1"
                  >
                    {option?.label ?? catSlug}
                    <button
                      type="button"
                      aria-label="Remove category filter"
                      onClick={() => removeCategory(catSlug)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}

              {draft.university && (
                <Badge variant="secondary" className="gap-1.5 py-1">
                  {draft.university}
                  <button
                    type="button"
                    aria-label="Remove university filter"
                    onClick={() => removeFilter("university", "")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {draft.requiresHardcopy === true && (
                <Badge variant="secondary" className="gap-1.5 py-1">
                  Hardcopy
                  <button
                    type="button"
                    aria-label="Remove hardcopy filter"
                    onClick={() => removeFilter("requiresHardcopy", false)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {draft.sortBy !== "rating" && (
                <Badge variant="secondary" className="gap-1.5 py-1">
                  {activeSort?.label ?? draft.sortBy}
                  <button
                    type="button"
                    aria-label="Remove sorting filter"
                    onClick={() => removeFilter("sortBy", "rating")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="ml-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No filters applied. Use Filters to customize your results.
            </p>
          )}
        </div>
      </div>

      {/* Inline expandable filter section — not a modal */}
      {isExpanded && (
        <div
          id="gig-filter-panel"
          className="border-t border-border/60 bg-muted/20 p-4 sm:p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Customize filters</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose your preferences and apply them to the results.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Close filters"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Category - multi-select dropdown checkboxes */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold">Service category</label>
                <span className="text-xs text-muted-foreground">
                  {draft.category.length} selected
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-md border border-input p-3 space-y-1 bg-background">
                {LEGACY_CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => toggleCategory(option.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                      isCategorySelected(option.slug)
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {isCategorySelected(option.value) ? (
                        <Check className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Select multiple categories to combine results.
              </p>
            </div>

            <Separator className="sm:col-span-2 my-4" />

            {/* University */}
            <div className="space-y-2">
              <label
                htmlFor="gig-university"
                className="text-xs font-semibold"
              >
                University / Institution
              </label>
              <Input
                id="gig-university"
                placeholder="Enter university name..."
                value={draft.university}
                onChange={(e) => updateDraft("university", e.target.value)}
              />
            </div>

            {/* Hardcopy */}
            <div className="space-y-2">
              <label className="text-xs font-semibold">Delivery preference</label>
              <button
                type="button"
                onClick={() =>
                  updateDraft(
                    "requiresHardcopy",
                    draft.requiresHardcopy !== true,
                  )
                }
                aria-pressed={draft.requiresHardcopy === true}
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm transition-colors",
                  draft.requiresHardcopy === true
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-input bg-background hover:bg-muted",
                )}
              >
                <span>Physical hardcopy required</span>
                <span className="text-xs">
                  {draft.requiresHardcopy === true ? "On" : "Off"}
                </span>
              </button>
            </div>

            {/* Sorting */}
            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="gig-sort"
                className="flex items-center gap-2 text-xs font-semibold"
              >
                <Clock className="h-3.5 w-3.5" />
                Sort results by
              </label>
              <select
                id="gig-sort"
                value={draft.sortBy}
                onChange={(e) => updateDraft("sortBy", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft(value);
              }}
              className="text-muted-foreground"
            >
              Reset changes
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleApply}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
