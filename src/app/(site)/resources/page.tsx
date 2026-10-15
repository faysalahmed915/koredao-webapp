import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GraduationCap,
  PenTool,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Study guides, writing standards and platform walkthroughs for students and academic helpers on KoreDao.",
  alternates: { canonical: "/resources" },
};

const RESOURCE_GROUPS = [
  {
    title: "Study Guides",
    description:
      "Level-by-level guidance on structuring practicals, assignments and research work.",
    href: "/resources/study-guides",
    icon: BookOpen,
    items: ["SSC study guides", "HSC study guides", "University study guides"],
  },
  {
    title: "How KoreDao Works",
    description:
      "Escrow, membership, verification and dispute resolution explained end to end.",
    href: "/how-it-works",
    icon: ShieldCheck,
    items: [
      "Escrow & the 72-hour auto-release",
      "Verifying helpers",
      "Membership and paid actions",
    ],
  },
  {
    title: "Writing Standards",
    description:
      "What a high-scoring submission looks like, plus academic integrity expectations.",
    href: "/about",
    icon: PenTool,
    items: ["Formatting & referencing", "Academic integrity code", "Revision etiquette"],
  },
] as const;

export default function ResourcesPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <Badge
          variant="outline"
          className="border-indigo-500/30 text-[11px] text-indigo-600 dark:text-indigo-400"
        >
          <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
          Resources
        </Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Everything you need to work confidently
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Guidance for students hiring help and for helpers delivering it — written
          around how KoreDao actually protects both sides of a project.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {RESOURCE_GROUPS.map((group) => (
          <Card
            key={group.title}
            className="flex flex-col border-border/60 transition-colors hover:border-indigo-500/40"
          >
            <CardHeader className="pb-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                <group.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-bold">{group.title}</CardTitle>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {group.description}
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <ul className="flex-1 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ClipboardList
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={group.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Open {group.title}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-14 rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <GraduationCap className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              Prefer to see live examples?
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Browse real service packages and open requests from verified helpers
              across BUET, DU, IUT, SUST, NSU and BRAC University.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/gigs"
              className={cn(
                buttonVariants(),
                "gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              Browse services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/assignments" className={cn(buttonVariants({ variant: "outline" }))}>
              Open job board
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
