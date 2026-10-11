
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronDown,
    ArrowRight,
    X,
} from "lucide-react";

import { dropdownNavigation } from "./navigation-data";

export function DesktopNavigation() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const navRef = React.useRef<HTMLElement>(null);

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
            className="hidden md:flex items-center gap-1"
        >
            <Link
                href="/"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === "/"
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
            >
                Home
            </Link>

            {dropdownNavigation.map((item) => {
                const isOpen = openMenu === item.title;

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
                                <div className="w-[600px] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
                                    <div className="flex items-start justify-between border-b border-border/70 p-5">
                                        <div className="max-w-[470px]">
                                            <h2 className="text-lg font-semibold">
                                                {item.title}
                                            </h2>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            aria-label="Close navigation menu"
                                            onClick={() => setOpenMenu(null)}
                                            className="rounded-md p-2 hover:bg-accent"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div
                                        className={`grid gap-6 p-5 ${(item.groups?.length ?? 0) > 1
                                                ? "grid-cols-2"
                                                : "grid-cols-1"
                                            }`}
                                    >
                                        {item.groups?.map((group) => (
                                            <section key={group.title}>
                                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    {group.title}
                                                </h3>

                                                <p className="mt-1 mb-3 text-xs text-muted-foreground">
                                                    {group.description}
                                                </p>

                                                <ul className="space-y-1">
                                                    {group.items.map((child) => {
                                                        const childActive =
                                                            pathname === child.href ||
                                                            pathname.startsWith(`${child.href}/`);

                                                        return (
                                                            <li key={child.href}>
                                                                <Link
                                                                    href={child.href}
                                                                    onClick={() => setOpenMenu(null)}
                                                                    className={`group block rounded-lg p-3 transition-colors ${childActive
                                                                            ? "bg-accent"
                                                                            : "hover:bg-accent/60"
                                                                        }`}
                                                                >
                                                                    <span className="flex items-center justify-between gap-2 text-sm font-medium">
                                                                        {child.title}

                                                                        <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                                                    </span>

                                                                    {child.description && (
                                                                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                                                            {child.description}
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </section>
                                        ))}
                                    </div>

                                    {item.href && (
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
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
