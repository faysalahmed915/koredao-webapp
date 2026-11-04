// src/components/layout/nav/public-nav-types.ts
// Shared types for the public navigation layer.
// No imports from other domain modules — pure types only.

/** The intent state of the public header. Determines whether the user sees a
 * buy-side, sell-side, or guest-focused top level. */
export type PublicNavContext = "guest" | "customer" | "helper" | "member";

/** Direct action that sits in the header action bar (not inside the menu). */
export interface PublicNavItem {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "ghost";
  context: PublicNavContext[];
  badge?: "member" | "signin";
}
