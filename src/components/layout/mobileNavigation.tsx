"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";

import {
    dropdownNavigation,
    isRouteActive,
    type NavItem,
    type DropdownNavItem,
} from "./navigation-data";
import { useSession } from "@/lib/auth-client";
import { isNavItemVisible } from "@/lib/access-control";

// Check whether any item or subitem in a dropdown category is active.
function isDropdownActive(pathname: string, item: DropdownNavItem): boolean {
    return (
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`) ||
        (item.groups?.some((group) =>
            group.items.some((child) => isRouteActive(pathname, child))
        ) ?? false)
    );
}

// Reusable recursive component for unlimited nesting in mobile navigation.
type MobileNestedNavItemProps = {
    item: NavItem;
    pathname: string;
    onNavigate?: () => void;
    depth?: number;
};

function MobileNestedNavItem({
    item,
    pathname,
    onNavigate,
    depth = 0,
}: MobileNestedNavItemProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const hasChildren = Boolean(item.children?.length);
    const isActive = isRouteActive(pathname, item);
    const isCurrentPage = pathname === item.href;

    const submenuId = React.useId();

    React.useEffect(() => {
        // Expand ancestors when a nested route is active.
        if (hasChildren && isActive) {
            // Defer so this setState is not synchronous within the effect.
            queueMicrotask(() => setIsExpanded(true));
        }
    }, [hasChildren, isActive, pathname]);

    return (
        <li className="min-w-0 list-none">
            <div
                className={`flex items-start gap-1 rounded-lg transition-colors ${
                    isCurrentPage
                        ? "bg-accent text-primary font-medium"
                        : isActive
                            ? "bg-accent/40"
                            : "hover:bg-accent/60"
                }`}
                style={{ marginLeft: depth > 0 ? 0 : undefined }}
            >
                <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isCurrentPage ? "page" : undefined}
                    className="group flex min-w-0 flex-1 items-start justify-between gap-2 p-2.5"
                >
                    <span className="min-w-0">
                        <span className="block text-sm font-medium">
                            {item.title}
                        </span>

                        {item.description && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                {item.description}
                            </span>
                        )}
                    </span>

                    {!hasChildren && (
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
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
                            className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                            }`}
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
                        <MobileNestedNavItem
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

type MobileNavigationProps = {
    onNavigate?: () => void;
};

export function MobileNavigation({ onNavigate }: MobileNavigationProps) {
    const pathname = usePathname();
    const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
    const { data: session } = useSession();

    // Filter navigation based on user session & roles
    const visibleNavigation = React.useMemo(() => {
        return dropdownNavigation.filter((item) =>
            isNavItemVisible(item, session?.user)
        );
    }, [session?.user]);

    // Auto-expand the category containing the active route
    React.useEffect(() => {
        const activeCategory = visibleNavigation.find((item) =>
            isDropdownActive(pathname, item)
        );
        if (activeCategory) {
            // Defer so this setState is not synchronous within the effect.
            queueMicrotask(() => setExpandedSection(activeCategory.title));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const isHomeActive = pathname === "/";

    return (
        <nav aria-label="Mobile navigation" className="space-y-1.5">
            {/* Home Link */}
            <Link
                href="/"
                onClick={onNavigate}
                aria-current={isHomeActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isHomeActive
                        ? "bg-accent text-primary font-semibold"
                        : "text-foreground hover:bg-accent/60"
                }`}
            >
                <span>Home</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
            </Link>

            {/* Navigation Items */}
            {visibleNavigation.map((item) => {
                const hasGroups = Boolean(item.groups && item.groups.length > 0);

                // For items without dropdown groups (e.g. Dashboard, Admin, Gigs), render direct link
                if (!hasGroups) {
                    const isDirectActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={isDirectActive ? "page" : undefined}
                            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                isDirectActive
                                    ? "bg-accent text-primary font-semibold"
                                    : "text-foreground hover:bg-accent/60"
                            }`}
                        >
                            <span>{item.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                        </Link>
                    );
                }

                const isExpanded = expandedSection === item.title;
                const isActive = isDropdownActive(pathname, item);
                const sectionId = `mobile-menu-${item.title.toLowerCase().replace(/\s+/g, "-")}`;

                return (
                    <section
                        key={item.title}
                        className="overflow-hidden rounded-lg border border-border/40 bg-card/40 transition-colors"
                    >
                        {/* Header Row */}
                        <div
                            className={`flex items-center justify-between rounded-lg transition-colors ${
                                isActive
                                    ? "bg-accent/50 text-primary font-semibold"
                                    : "text-foreground hover:bg-accent/40"
                            }`}
                        >
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                aria-current={pathname === item.href ? "page" : undefined}
                                className="flex min-w-0 flex-1 items-center justify-between py-2.5 pl-3 pr-2 text-sm font-semibold"
                            >
                                <span className="truncate">{item.title}</span>
                            </Link>

                            <button
                                type="button"
                                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
                                aria-expanded={isExpanded}
                                aria-controls={sectionId}
                                onClick={() =>
                                    setExpandedSection(isExpanded ? null : item.title)
                                }
                                className="mr-1 rounded-md p-2 text-muted-foreground hover:bg-background/80 hover:text-foreground"
                            >
                                <ChevronDown
                                    aria-hidden="true"
                                    className={`h-4 w-4 transition-transform duration-200 ${
                                        isExpanded ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                            <div
                                id={sectionId}
                                className="border-t border-border/40 bg-background/50 px-3 pb-3 pt-2 space-y-3"
                            >
                                {item.description && (
                                    <p className="px-1 text-xs text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                )}

                                 {item.groups
                                    ?.filter((group) => isNavItemVisible(group, session?.user))
                                    .map((group, groupIndex) => (
                                        <div key={group.title || `${item.href}-group-${groupIndex}`} className="space-y-2">
                                            {(group.title || group.description) && (
                                                <div className="px-1 pt-1">
                                                    {group.title && (
                                                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                            {group.title}
                                                        </h3>
                                                    )}
                                                    {group.description && (
                                                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                                                            {group.description}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <ul className="space-y-1">
                                                {group.items
                                                    .filter((child) => isNavItemVisible(child, session?.user))
                                                    .map((child) => (
                                                        <MobileNestedNavItem
                                                            key={child.href}
                                                            item={child}
                                                            pathname={pathname}
                                                            onNavigate={onNavigate}
                                                        />
                                                    ))}
                                            </ul>
                                        </div>
                                    ))}

                                {/* Browse all link */}
                                <div className="border-t border-border/50 pt-2 px-1">
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                                    >
                                        Browse all {item.title}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>
                );
            })}
        </nav>
    );
}
