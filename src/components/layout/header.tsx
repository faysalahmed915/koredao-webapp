import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { BrandMark } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { DesktopNav } from "@/components/layout/nav/desktop-nav";
import { AuthActions } from "@/components/layout/nav/auth-actions";
import { MobileNavButton } from "@/components/layout/nav/mobile-nav-button";

/**
 * Public site header.
 *
 * Performance notes
 * -----------------
 * This is a **server component**: the marketing chrome ships no client
 * JavaScript of its own. Interactivity is delegated to three small islands —
 * `DesktopNav` (route highlighting only), `AuthActions` (the only session
 * consumer) and `MobileNavButton` (the drawer). Because the mega-menu is not a
 * session consumer, signing in or out no longer re-renders the whole navigation
 * tree, and `next/link` prefetching keeps in-viewport destinations warm.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <BrandMark />
          <DesktopNav />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/membership"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden gap-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-500/10 lg:inline-flex dark:text-indigo-400"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Membership
          </Link>

          <LanguageToggle />
          <ThemeToggle />
          <AuthActions />
          <MobileNavButton />
        </div>
      </div>
    </header>
  );
}
