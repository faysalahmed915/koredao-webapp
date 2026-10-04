"use client";

import { ShieldCheck, PenTool, MapPin, Briefcase, CheckCircle2, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t.features.securityTitle,
      description: t.features.securityDesc,
      tag: "72h Escrow",
      color: "from-blue-500/20 to-indigo-500/20 text-indigo-500",
    },
    {
      icon: PenTool,
      title: t.features.performanceTitle,
      description: t.features.performanceDesc,
      tag: "Style AI",
      color: "from-amber-500/20 to-orange-500/20 text-amber-500",
    },
    {
      icon: MapPin,
      title: t.features.authTitle,
      description: t.features.authDesc,
      tag: "Campus Handover",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-500",
    },
    {
      icon: Briefcase,
      title: t.features.seoTitle,
      description: t.features.seoDesc,
      tag: "Gigs & Bids",
      color: "from-purple-500/20 to-pink-500/20 text-purple-500",
    },
    {
      icon: CheckCircle2,
      title: t.features.backendTitle,
      description: t.features.backendDesc,
      tag: "Milestones",
      color: "from-rose-500/20 to-red-500/20 text-rose-500",
    },
    {
      icon: Lock,
      title: t.features.scaleTitle,
      description: t.features.scaleDesc,
      tag: "Leak Protection",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-500",
    },
  ];

  return (
    <section className="py-20 bg-muted/20 border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 text-xs font-mono uppercase tracking-wider text-indigo-500 border-indigo-500/30">
            {t.features.sectionBadge}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground max-w-3xl">
            {t.features.sectionTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base sm:text-lg">
            {t.features.sectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm hover:border-indigo-500/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} border border-border/40 group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6 stroke-[2]" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono font-medium">
                      {feature.tag}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground pt-1">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
