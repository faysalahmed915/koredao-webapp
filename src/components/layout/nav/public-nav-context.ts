// src/components/layout/nav/public-nav-context.ts
//
// Single source of truth for the public header navigation.
//
// The public site is a two-sided marketplace:
//   - CUSTOMER / MEMBER  -> buy-side (search gigs, post jobs)
//   - VENDOR / HELPER    -> sell-side (create gigs, find jobs, wallet)
//   - guest              -> discoverable
//
// `getPublicNavForContext()` is the only function that decides which items
// appear in the header action bar / mega-menu. Both `header.tsx` and
// `desktop-nav.tsx` consume this — never duplicate the lists.

import type { PublicNavContext, PublicNavItem } from "./public-nav-types";
import type { UserRole } from "@/types";

// Re-export the context type so importing modules don't need a circular dep.
export type { PublicNavContext };

// ------------------------------------------------------------------
// Per-context flat next-action lists
// ------------------------------------------------------------------

const GUEST_ITEMS: PublicNavItem[] = [
  {
    label: "Hire Help",
    href: "/categories",
    variant: "secondary",
    context: ["guest"],
    badge: "member",
  },
  {
    label: "Become a Helper",
    href: "/gigs",
    variant: "secondary",
    context: ["guest"],
  },
  { label: "Resources", href: "/resources", variant: "ghost", context: ["guest"] },
];

const CUSTOMER_ITEMS: PublicNavItem[] = [
  { label: "Search Gigs", href: "/gigs", variant: "secondary", context: ["customer"] },
  { label: "Post a Job", href: "/categories", variant: "primary", context: ["customer"] },
  { label: "Browse Gigs", href: "/gigs", variant: "secondary", context: ["customer"] },
  { label: "Resources", href: "/resources", variant: "ghost", context: ["customer"] },
];

const HELPER_ITEMS: PublicNavItem[] = [
  { label: "Create Gig", href: "/vendor/gigs/create", variant: "primary", context: ["helper"] },
  { label: "Browse Gigs", href: "/gigs", variant: "secondary", context: ["helper"] },
  { label: "Find Jobs", href: "/assignments", variant: "secondary", context: ["helper"] },
  { label: "Wallet", href: "/vendor/wallet", variant: "secondary", context: ["helper"] },
];

// ------------------------------------------------------------------
// Resolution
// ------------------------------------------------------------------

export function resolvePublicNavContext(
  role: UserRole | null,
  isMember: boolean,
): PublicNavContext {
  if (!role || !isMember) return "guest";
  if (role === "VENDOR") return "helper";
  if (role === "MEMBER") return "customer";
  return "guest";
}

export function getPublicNavForContext(context: PublicNavContext): PublicNavItem[] {
  switch (context) {
    case "guest": return GUEST_ITEMS;
    case "customer": return CUSTOMER_ITEMS;
    case "helper": return HELPER_ITEMS;
    case "member":
      return resolvePublicNavContext(null, true) === "customer"
        ? CUSTOMER_ITEMS
        : HELPER_ITEMS;
    default: return GUEST_ITEMS;
  }
}
