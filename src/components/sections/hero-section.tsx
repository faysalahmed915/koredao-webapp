"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  GraduationCap,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export function HeroSectionTwo() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto grid min-h-[650px] items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: Hero copy */}
        <div className="mx-auto max-w-2xl lg:mx-0">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {t.home.heroBadge}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {t.home.heroTitleLine1}{" "}
            <span className="relative inline-block text-primary">
              {t.home.heroTitleLine2}
              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                fill="none"
                className="absolute -bottom-2 left-0 w-full text-primary/30"
              >
                <path
                  d="M3 10C76 2 204 2 297 8"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            {t.home.heroDescription}
          </p>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/gigs"
              className={buttonVariants({
                size: "lg",
                className: "group h-12 gap-2 rounded-xl px-6",
              })}
            >
              {t.home.heroGetStarted}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/helpers"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "h-12 gap-2 rounded-xl px-6",
              })}
            >
              <Users className="h-4 w-4" />
              {t.home.heroFindHelpers}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t.home.heroTrustPlatform}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t.home.heroTrustDirect}
            </span>
          </div>
        </div>

        {/* Right: Visual card composition */}
        <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-[2.5rem] bg-primary/15 blur-3xl"
          />

          <div className="relative rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-6">
            {/* Search panel */}
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.home.heroSearchPlaceholder}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your next project starts here
                  </p>
                </div>

                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Search className="h-5 w-5" />
                </div>
              </div>

              <Link
                href="/gigs"
                className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1">{t.home.heroSearchButton}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
              </Link>

              <div className="mt-4 flex flex-wrap gap-2">
                {[t.home.heroCategoryAcademic, t.home.heroCategoryCreative, t.home.heroCategoryDigital].map(
                  (category) => (
                    <span
                      key={category}
                      className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {category}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Service cards */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/assignments"
                className="group rounded-2xl border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">
                  {t.home.heroServiceGetWork}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t.home.heroServiceGetWorkDesc}
                </p>
                <ArrowUpRight className="mt-4 h-4 w-4 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                href="/helpers"
                className="group rounded-2xl border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">
                  {t.home.heroServiceMeetHelpers}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t.home.heroServiceMeetHelpersDesc}
                </p>
                <ArrowUpRight className="mt-4 h-4 w-4 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>

            {/* Trust banner */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/5 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {t.home.heroTrustWork}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {t.home.heroTrustWorkDesc}
                </p>
              </div>

              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            </div>
          </div>

          {/* Floating decorative badge */}
          <div className="absolute -left-4 top-1/3 hidden -translate-x-1/4 items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xl sm:flex lg:-left-8">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t.home.heroYourNextStep}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.home.heroYourNextStepDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
