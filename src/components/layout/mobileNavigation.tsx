"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";

import { dropdownNavigation } from "./navigation-data";

type MobileNavigationProps = {
    onNavigate?: () => void;
};

export function MobileNavigation({
    onNavigate,
}: MobileNavigationProps) {
    const pathname = usePathname();
    const [expanded, setExpanded] = React.useState<string | null>(
        null
    );

    return (
        <nav aria-label="Mobile navigation" className="space-y-1">
            <Link
                href="/"
                onClick={onNavigate}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === "/"
                    ? "bg-accent text-primary"
                    : "hover:bg-accent/60"
                    }`}
            >
                Home
            </Link>

            {dropdownNavigation.map((item) => {
                const isExpanded = expanded === item.title;

                const isActive =
                    pathname === item.href ||
                    item.groups?.some((group) =>
                        group.items.some(
                            (child) =>
                                pathname === child.href ||
                                pathname.startsWith(`${child.href}/`)
                        )
                    );

                return (
                    <section
                        key={item.title}
                        className="overflow-hidden rounded-lg"
                    >
                        <div className="flex items-center gap-1">
                            <Link
                                href={item.href ?? "#"}
                                onClick={onNavigate}
                                className={`min-w-0 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive
                                    ? "text-primary"
                                    : "text-foreground"
                                    }`}
                            >
                                {item.title}
                            </Link>

                            <button
                                type="button"
                                aria-label={`Toggle ${item.title} submenu`}
                                aria-expanded={isExpanded}
                                onClick={() =>
                                    setExpanded(
                                        isExpanded ? null : item.title
                                    )
                                }
                                className="rounded-lg p-2.5 hover:bg-accent"
                            >
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                        </div>

                        {isExpanded && (
                            <div className="ml-3 border-l border-border pl-3 pb-2">
                                <p className="px-3 py-2 text-xs text-muted-foreground">
                                    {item.description}
                                </p>

                                {item.groups?.map((group) => (
                                    <div key={group.title} className="mb-3">
                                        <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {group.title}
                                        </h3>

                                        {group.items.map((child) => {
                                            const childActive =
                                                pathname === child.href ||
                                                pathname.startsWith(`${child.href}/`);

                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={onNavigate}
                                                    className={`mb-1 flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 ${childActive
                                                        ? "bg-accent text-primary"
                                                        : "hover:bg-accent/60"
                                                        }`}
                                                >
                                                    <span>
                                                        <span className="block text-sm font-medium">
                                                            {child.title}
                                                        </span>

                                                        {child.description && (
                                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                                {child.description}
                                                            </span>
                                                        )}
                                                    </span>

                                                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}

                                {item.href && (
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary"
                                    >
                                        Browse all {item.title}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
        </nav>
    );
}
