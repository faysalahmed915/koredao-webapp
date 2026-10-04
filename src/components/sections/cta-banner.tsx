"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession } from "@/lib/auth-client";
import { cn } from "cn";

export function CtaBanner() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-background p-8 sm:p-12 md:p-16 text-center overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              {t.cta.title}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              {t.cta.desc}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {session?.user ? (
                <Link
                  href="/profile"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/30 gap-2"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>View Your Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/30"
                  )}
                >
                  <span>{t.nav.register}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              )}
              <Link
                href="/gigs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-6 text-base border-border/80 hover:bg-accent/60"
                )}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{t.cta.button}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
