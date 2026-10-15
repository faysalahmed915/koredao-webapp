"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Lock } from "lucide-react";
import { cn } from "cn";

import {
  isRouteActive,
  NAV_BADGE_LABELS,
  type NavItem,
} from "@/components/layout/navigation-data";

export interface CollapsibleNavItemProps {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
  depth?: number;
}

function BadgeChip({ item }: { item: NavItem }) {
  if (item.badge === "members" || item.requiresMembership) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
        <Lock className="h-2.5 w-2.5" aria-hidden="true" />
        {NAV_BADGE_LABELS.members}
      </span>
    );
  }
  if (item.badge) {
    return (
      <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        {NAV_BADGE_LABELS[item.badge]}
      </span>
    );
  }
  return null;
}

/**
 * Recursive, accessible navigation row shared by the desktop mega-menu and the
 * mobile drawer. Unlimited nesting, expandable branches, active-route tracking
 * and informational badges (e.g. "Members" for paid actions).
 */
export function CollapsibleNavItem({
  item,
  pathname,
  onNavigate,
  depth = 0,
}: CollapsibleNavItemProps) {
  const hasChildren = Boolean(item.children?.length);
  const isActive = isRouteActive(pathname, item);
  const isCurrentPage = pathname === item.href;

  // Auto-expand the branch that contains the active route.
  const [isExpanded, setIsExpanded] = React.useState(isActive && hasChildren);
  const submenuId = React.useId();

  React.useEffect(() => {
    if (hasChildren && isActive) {
      // Defer so this setState is not synchronous within the effect.
      queueMicrotask(() => setIsExpanded(true));
    }
  }, [hasChildren, isActive, pathname]);

  return (
    <li className="min-w-0 list-none">
      <div
        className={cn(
          "flex items-start gap-1 rounded-lg transition-colors",
          isCurrentPage
            ? "bg-accent text-primary"
            : isActive
              ? "bg-accent/40"
              : "hover:bg-accent/60"
        )}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={isCurrentPage ? "page" : undefined}
          className="group flex min-w-0 flex-1 items-start justify-between gap-2 p-2.5"
        >
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium">{item.title}</span>
              <BadgeChip item={item} />
            </span>
            {item.description && (
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </span>
            )}
          </span>
          {!hasChildren && (
            <ArrowRight
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}
        </Link>

        {hasChildren && (
          <button
            type="button"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
            aria-expanded={isExpanded}
            aria-controls={submenuId}
            onClick={() => setIsExpanded((previous) => !previous)}
            className="mr-1 mt-1 rounded-md p-2 text-muted-foreground hover:bg-background/80 hover:text-foreground"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <ul
          id={submenuId}
          className="ml-3 mt-1 space-y-1 border-l border-border pl-2"
        >
          {item.children!.map((child) => (
            <CollapsibleNavItem
              key={child.href}
              item={child}
              pathname={pathname}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
