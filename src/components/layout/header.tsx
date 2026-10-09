"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Menu, ArrowRight, LogOut, GraduationCap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: session, isPending } = useSession();

  const userRole = (session?.user as any)?.role;
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAdmin = userRole === "ADMIN" || isSuperAdmin;
  const isModerator = userRole === "MODERATOR";
  const canAccessAdmin = isAdmin || isModerator;
  const isVendor = userRole === "VENDOR" || isAdmin;

  // Navigation Links
  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Services", href: "/gigs" },
    { title: "Job Board", href: "/assignments" },
    { title: "Find Helpers", href: "/helpers" },
    { title: "Handwriting Matcher", href: "/handwriting-matcher" },
    ...(session?.user
      ? [
          { title: "Dashboard", href: "/dashboard" },
          { title: "Orders", href: "/orders" },
          { title: "Messages", href: "/messages" },
        ]
      : []),
    ...(isVendor ? [{ title: "Wallet", href: "/vendor/wallet" }] : []),
    ...(!isVendor && !isAdmin && !isModerator ? [{ title: "Become a Helper", href: "/vendor/apply" }] : []),
    ...(canAccessAdmin ? [{ title: "Verifications", href: "/admin/verifications" }] : []),
    { title: t.nav.about, href: "/about" },
    { title: t.nav.contact, href: "/contact" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-mono">
                Kore<span className="text-indigo-600 dark:text-indigo-400">Dao</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider text-indigo-500 font-semibold uppercase leading-none">
                Academic Escrow
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 pl-4" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "text-primary bg-accent/60 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Backend Badge, Language, Theme, Auth CTAs */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NestJS Backend Paired</span>
          </div>

          <LanguageToggle />
          <ThemeToggle />

          {/* Auth State Button Group (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 pl-1">
            {!isPending && session?.user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-2 px-2.5 rounded-md border border-border/50 text-xs font-medium hover:bg-accent/60"
                  )}
                  title="View Profile"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground max-w-[130px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40 cursor-pointer transition-colors"
                  )}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.nav.signOut}</span>
                </button>
              </div>
            ) : !isPending ? (
              <>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-sm font-medium")}
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25"
                  )}
                >
                  <span>{t.nav.register}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Hamburger Drawer */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9 rounded-md border border-border/40 cursor-pointer"
                )}
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="font-bold">KoreDao</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  <div className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          pathname === link.href
                            ? "bg-accent text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-border/60 my-1" />

                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-muted-foreground font-mono">Backend Status</span>
                    <span className="text-xs font-mono text-emerald-500 font-medium">NestJS :3000</span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    {session?.user ? (
                      <>
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 p-2.5 rounded-md bg-muted/60 border border-border/50 text-xs"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                            {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate">{session.user.name}</span>
                            <span className="text-[11px] text-muted-foreground truncate">{session.user.email}</span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            handleSignOut();
                          }}
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "w-full justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                          )}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t.nav.signOut}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}
                        >
                          {t.nav.login}
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            buttonVariants(),
                            "w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
                          )}
                        >
                          {t.nav.register}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
