
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronDown,
    ArrowRight,
    X,
} from "lucide-react";

import {
    dropdownNavigation,
    isRouteActive,
    type NavItem,
} from "./navigation-data";
import { useSession } from "@/lib/auth-client";
import { isNavItemVisible } from "@/lib/access-control";

// Reusable recursive component for unlimited nesting.
type NestedNavItemProps = {
    item: NavItem;
    pathname: string;
    onNavigate: () => void;
    depth?: number;
};

function NestedNavItem({
    item,
    pathname,
    onNavigate,
    depth = 0,
}: NestedNavItemProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const hasChildren = Boolean(item.children?.length);
    const isActive = isRouteActive(pathname, item);
    const isCurrentPage = pathname === item.href;

    const submenuId = React.useId();

    React.useEffect(() => {
        // Expand ancestors when a nested route is active.
        if (hasChildren && isActive) {
            setIsExpanded(true);
        }
    }, [hasChildren, isActive, pathname]);

    return (
        <li className="min-w-0">
            <div
                className={`flex items-start gap-1 rounded-lg transition-colors ${isCurrentPage
                    ? "bg-accent text-primary"
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
                    className="group flex min-w-0 flex-1 items-start justify-between gap-2 p-3"
                >
                    <span className="min-w-0">
                        <span className="block text-sm font-medium">
                            {item.title}
                        </span>

                        {item.description && (
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                {item.description}
                            </span>
                        )}
                    </span>

                    {!hasChildren && (
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                </Link>

                {hasChildren && (
                    <button
                        type="button"
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.title}`}
                        aria-expanded={isExpanded}
                        aria-controls={submenuId}
                        onClick={() => setIsExpanded((previous) => !previous)}
                        className="mr-1 mt-1.5 rounded-md p-2 hover:bg-background/80"
                    >
                        <ChevronDown
                            aria-hidden="true"
                            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
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
                        <NestedNavItem
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

export function DesktopNavigation() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const navRef = React.useRef<HTMLElement>(null);
    const { data: session } = useSession();

    // Filter dropdown navigation based on user session & roles
    const visibleNavigation = React.useMemo(() => {
        return dropdownNavigation.filter((item) =>
            isNavItemVisible(item, session?.user)
        );
    }, [session?.user]);

    React.useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (
                navRef.current &&
                !navRef.current.contains(event.target as Node)
            ) {
                setOpenMenu(null);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpenMenu(null);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    React.useEffect(() => {
        setOpenMenu(null);
    }, [pathname]);

    return (
        <nav
            ref={navRef}
            aria-label="Main navigation"
            className="hidden items-center gap-1 md:flex"
        >
            <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === "/"
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
            >
                Home
            </Link>

            {visibleNavigation.map((item) => {
                const hasGroups = Boolean(item.groups && item.groups.length > 0);

                // For items without dropdown groups (e.g. Dashboard, Admin, Gigs), render a direct link
                if (!hasGroups) {
                    const isDirectActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            aria-current={isDirectActive ? "page" : undefined}
                            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${isDirectActive
                                ? "bg-accent text-primary"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                }`}
                        >
                            {item.title}
                        </Link>
                    );
                }

                const isOpen = openMenu === item.title;

                const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`) ||
                    (item.groups?.some((group) =>
                        group.items.some((child) =>
                            isRouteActive(pathname, child)
                        )
                    ) ?? false);

                return (
                    <div key={item.title} className="relative">
                        <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-haspopup="true"
                            onClick={() =>
                                setOpenMenu(isOpen ? null : item.title)
                            }
                            className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive || isOpen
                                ? "bg-accent/70 text-primary"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                }`}
                        >
                            {item.title}

                            <ChevronDown
                                aria-hidden="true"
                                className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>

                        {isOpen && (
                            <div className="absolute left-0 top-full z-50 pt-3">
                                <div className="w-[600px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                                    <div className="flex items-start justify-between gap-4 border-b border-border/70 p-5">
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                {item.title}
                                            </h2>

                                            {item.description && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            aria-label="Close navigation menu"
                                            onClick={() => setOpenMenu(null)}
                                            className="shrink-0 rounded-md p-2 hover:bg-accent"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div
                                        className={`grid max-h-[70vh] gap-6 overflow-y-auto p-5 ${(item.groups?.length ?? 0) > 1
                                            ? "grid-cols-2"
                                            : "grid-cols-1"
                                            }`}
                                    >
                                        {item.groups?.map((group, groupIndex) => (
                                            <section key={group.title || `${item.href}-group-${groupIndex}`} className="min-w-0">
                                                {group.title && (
                                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                        {group.title}
                                                    </h3>
                                                )}

                                                {group.description && (
                                                    <p className="mb-3 mt-1 text-xs text-muted-foreground">
                                                        {group.description}
                                                    </p>
                                                )}

                                                <ul className="space-y-1">
                                                    {group.items.map((child) => (
                                                        <NestedNavItem
                                                            key={child.href}
                                                            item={child}
                                                            pathname={pathname}
                                                            onNavigate={() => setOpenMenu(null)}
                                                        />
                                                    ))}
                                                </ul>
                                            </section>
                                        ))}
                                    </div>

                                    <div className="border-t border-border/70 bg-muted/30 p-4">
                                        <Link
                                            href={item.href}
                                            onClick={() => setOpenMenu(null)}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                                        >
                                            Browse all {item.title}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
