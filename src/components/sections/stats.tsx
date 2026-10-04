"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function StatsSection() {
  const { t } = useLanguage();

  const stats = [
    { value: t.stats.securityScore, label: t.stats.securityScoreLabel, sub: "BUET, DU, IUT & SUST" },
    { value: t.stats.typeCoverage, label: t.stats.typeCoverageLabel, sub: "Bank & Mobile Banking Escrow" },
    { value: t.stats.lighthouseScore, label: t.stats.lighthouseScoreLabel, sub: "Guaranteed Submission" },
    { value: t.stats.productionReady, label: t.stats.productionReadyLabel, sub: "Dhaka, Sylhet, Rajshahi & Ctg" },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30 border-y border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1.5 p-4 rounded-xl hover:bg-accent/40 transition-colors">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-mono">
                {stat.value}
              </div>
              <div className="text-sm font-semibold text-foreground tracking-tight">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
