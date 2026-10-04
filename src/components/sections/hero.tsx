"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Terminal, CheckCircle2, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession } from "@/lib/auth-client";
import { cn } from "cn";

export function HeroSection() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 backdrop-blur-sm shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{t.hero.badge}</span>
            <span className="h-1 w-1 rounded-full bg-indigo-500" />
            <span className="font-mono font-semibold">v1.0.0</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            {t.hero.titleLine1}{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              {t.hero.titleLine2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t.hero.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/helpers"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-6 gap-2 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
              )}
            >
              <span>{t.hero.getStarted}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gigs"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-6 gap-2 text-base border-border/80 hover:bg-accent/60"
              )}
            >
              <span>{t.hero.exploreDocs}</span>
            </Link>
            <Link
              href="/assignments/create"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-12 px-6 gap-2 text-base hover:bg-accent/80"
              )}
            >
              <span>{t.hero.viewGithub}</span>
            </Link>
          </div>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 text-xs sm:text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> BUET, DU, IUT & SUST Helpers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Handwriting Style Matcher
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 100% Escrow Protection
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 72h Review Window
            </span>
          </div>

          {/* Interactive Live Academic Showcase Preview */}
          <div className="w-full max-w-3xl mt-8 rounded-xl border border-border/60 bg-card/80 backdrop-blur-md shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/40">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-semibold text-foreground">
                  LIVE CAMPUS DISPATCH ENGINE
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
                14+ CAMPUSES ACTIVE
              </Badge>
            </div>
            
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card/40">
              {/* Highlight 1: BUET EEE */}
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-500">BUET (Palashi)</span>
                  <Badge variant="secondary" className="text-[10px]">★ 4.96</Badge>
                </div>
                <div className="text-sm font-bold text-foreground">Tanvir Hasan</div>
                <div className="text-xs text-muted-foreground">EEE & Circuit Analysis</div>
                <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✍️ Math Equation Specialist
                </div>
              </div>

              {/* Highlight 2: DU Curzon Hall */}
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-500">DU (Curzon Hall)</span>
                  <Badge variant="secondary" className="text-[10px]">★ 5.0</Badge>
                </div>
                <div className="text-sm font-bold text-foreground">Fahim Chowdhury</div>
                <div className="text-xs text-muted-foreground">Applied Mathematics</div>
                <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  📐 Multivariable Calculus
                </div>
              </div>

              {/* Highlight 3: DU Pharmacy Hardcopy */}
              <div className="p-3 rounded-lg border border-border/50 bg-background/50 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-pink-500">DU Pharmacy</span>
                  <Badge variant="secondary" className="text-[10px]">★ 4.95</Badge>
                </div>
                <div className="text-sm font-bold text-foreground">Samira Akter</div>
                <div className="text-xs text-muted-foreground">Handwritten Hardcopy</div>
                <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  🖋️ Neat Cursive (5/5)
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-border/40 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>📍 Instant campus handover near Curzon Hall, Palashi, Merul Badda & Bashundhara</span>
              <Link href="/handwriting-matcher" className="font-semibold text-indigo-500 hover:underline inline-flex items-center gap-1">
                Try Handwriting Matcher <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
