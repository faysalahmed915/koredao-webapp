"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMembership } from "@/components/providers/membership-provider";
import { signOut, useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/access-control";
import { ROLE_LABELS } from "@/types";
import { useLanguage } from "@/components/providers/language-provider";

/**
 * The only session-aware part of the public header.
 *
 * Isolating it keeps the mega-menu completely static, so signing in or out no
 * longer re-renders the whole navigation tree.
 */
export function AuthActions() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: session, isPending } = useSession();
  const { membership } = useMembership();

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }, [router]);

  const user = session?.user;

  // Reserve the slot while the session resolves to avoid layout shift.
  if (isPending) {
    return (
      <div
        aria-hidden="true"
        className="hidden h-8 w-[190px] animate-pulse rounded-md bg-muted/50 sm:block"
      />
    );
  }

  if (!user) {
    return (
      <div className="hidden items-center gap-2 pl-1 sm:flex">
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
            "gap-1.5 bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700"
          )}
        >
          <span>{t.nav.register}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const role = getUserRole(user);
  const initials = (user.name || user.email || "U")[0]?.toUpperCase() ?? "U";

  return (
    <div className="hidden items-center gap-2 pl-1 sm:flex">
      {membership.isMember && (
        <Badge
          variant="outline"
          className="hidden border-emerald-500/30 text-[10px] text-emerald-600 lg:inline-flex dark:text-emerald-400"
        >
          Member
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "cursor-pointer gap-2 rounded-md border border-border/50 px-2.5 text-xs font-medium hover:bg-accent/60"
          )}
          aria-label="Account menu"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            {initials}
          </span>
          <span className="max-w-[130px] truncate font-semibold text-foreground">
            {user.name || user.email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="truncate text-xs font-semibold text-foreground">
              {user.name || "Account"}
            </span>
            <span className="truncate text-[11px] font-normal text-muted-foreground">
              {user.email}
            </span>
            {role && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-indigo-500">
                {ROLE_LABELS[role]}
                {membership.isMember && role !== "MEMBER" ? " • Member" : ""}
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer gap-2" render={<Link href="/dashboard" />}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            render={<Link href="/membership" />}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Membership
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t.nav.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
