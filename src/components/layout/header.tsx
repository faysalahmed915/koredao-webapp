"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/access-control";
import { useMembership } from "@/components/providers/membership-provider";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { BrandMark } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { DesktopNav } from "@/components/layout/nav/desktop-nav";
import { AuthActions } from "@/components/layout/nav/auth-actions";
import { MobileNavButton } from "@/components/layout/nav/mobile-nav-button";
import {
  resolvePublicNavContext,
  getPublicNavForContext,
  type PublicNavContext,
} from "@/components/layout/nav/public-nav-context";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * Public site header.
 *
 * Client component: owns the session read so the buy-side / sell-side
 * navigation can switch on the user's intent. Guest view shows a generic
 * discoverable mega-menu; signed-in customers see buy-side next-actions;
 * signed-in helpers see sell-side next-actions.
 *
 * UX notes:
 * - Visible skip-link for keyboard/screen-reader users.
 * - Action bar (Membership, Language, Theme, Nav, Auth, Mobile) consistently
 *   hidden on `<sm` and shown as inline flex from `sm` onward so tablet users
 *   never see orphaned UI.
 */
export function Header() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, isPending } = useSession();
  const { membership } = useMembership();

  const user = session?.user;
  const role = getUserRole(user);
  const isSignedIn = Boolean(user);
  const hasMembership = membership.isMember && isSignedIn;

  let navContext: PublicNavContext = "guest";
  if (isSignedIn) {
    navContext = resolvePublicNavContext(role, hasMembership);
  }

console.log(navContext);

  if (isPending) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Skip to content
            </a>
            <BrandMark />
            <div className="h-[36px] w-full animate-pulse rounded-md bg-muted/50 sm:w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[32px] w-[80px] animate-pulse rounded-md bg-muted/50 sm:w-[120px]" />
            <div className="hidden h-8 w-[60px] animate-pulse rounded-md bg-muted/50 sm:block" />
            <div className="hidden h-8 w-[60px] animate-pulse rounded-md bg-muted/50 sm:block" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <BrandMark />
          <DesktopNav context={navContext} />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/membership"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-500/10 lg:inline-flex dark:text-indigo-400",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {hasMembership ? "My Membership" : "Membership"}
          </Link>

          <LanguageToggle />
          <ThemeToggle />

          {/* Role-aware next-action chips (inline): guest vs signed-in */}
          <div className="hidden items-center gap-2 pl-1 sm:flex">
            {navContext === "guest" ? (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-sm font-medium",
                  )}
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "gap-1.5 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700",
                  )}
                >
                  <span>{t.nav.register}</span>
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </>
            ) : (
              <AuthActions />
            )}
          </div>

          <MobileNavButton />
        </div>
      </div>
    </header>

  );
}

export {};
