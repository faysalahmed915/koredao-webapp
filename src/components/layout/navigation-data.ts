// src/components/layout/navigation-data.ts

/**
 * PUBLIC site navigation.
 *
 * Everything declared here is intentionally visible to anonymous visitors —
 * including every nested child. Paid or signed-in-only actions are not hidden;
 * they carry a `badge` / `requiresMembership` flag so the UI can render an
 * explanatory chip or a "Become a Member" call to action instead of silently
 * removing the link.
 *
 * Authenticated, role-specific navigation lives in
 * `@/components/layout/dashboard/dashboard-navigation`.
 */

import type { UserRole } from "@/types";

/** Small informational chip rendered next to a navigation item. */
export type NavBadge = "members" | "helpers" | "signin";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  children?: NavItem[];
  /** Purely informational — never used to hide the item. */
  badge?: NavBadge;
  /** Paid marketplace action: the destination shows a membership gate. */
  requiresMembership?: boolean;
  /**
   * Retained for reuse by non-public surfaces (e.g. the dashboard sidebar).
   * Public navigation intentionally leaves these unset so nothing is hidden.
   */
  roles?: UserRole[];
  requireAuth?: boolean;
  guestOnly?: boolean;
};

export type NavGroup = {
  title?: string;
  description?: string;
  items: NavItem[];
  roles?: UserRole[];
  requireAuth?: boolean;
  guestOnly?: boolean;
};

export type DropdownNavItem = {
  title: string;
  href: string;
  description?: string;
  groups?: NavGroup[];
  roles?: UserRole[];
  requireAuth?: boolean;
  guestOnly?: boolean;
};

/** Depth-first check for whether `pathname` sits on or under `item`. */
export function isRouteActive(pathname: string, item: NavItem): boolean {
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.children?.some((child) => isRouteActive(pathname, child)) ?? false)
  );
}

/** Whether any item inside a mega-menu panel is currently active. */
export function isDropdownActive(
  pathname: string,
  item: DropdownNavItem
): boolean {
  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`) ||
    (item.groups?.some((group) =>
      group.items.some((child) => isRouteActive(pathname, child))
    ) ??
      false)
  );
}

export const publicNavigation: DropdownNavItem[] = [
  {
    title: "Hire Assistance",
    href: "/assistance",
    description: "Discover academic assistance for your practicals and coursework.",
    groups: [
      {
        items: [
          {
            title: "Practical",
            href: "/assistance/practical",
            description: "Browse practical assistance by academic level.",
            children: [
              {
                title: "SSC Practical",
                href: "/assistance/practical/ssc",
                description: "Practical assistance for SSC students.",
                children: [
                  {
                    title: "SSC Science",
                    href: "/assistance/practical/ssc/science",
                  },
                  { title: "SSC ICT", href: "/assistance/practical/ssc/ict" },
                ],
              },
              {
                title: "HSC Practical",
                href: "/assistance/practical/hsc",
                description: "Practical assistance for HSC students.",
                children: [
                  {
                    title: "HSC Physics",
                    href: "/assistance/practical/hsc/physics",
                  },
                  {
                    title: "HSC Chemistry",
                    href: "/assistance/practical/hsc/chemistry",
                  },
                  {
                    title: "HSC Biology",
                    href: "/assistance/practical/hsc/biology",
                  },
                ],
              },
              {
                title: "University Practical",
                href: "/assistance/practical/university",
                description: "Practical support for university students.",
                children: [
                  {
                    title: "Engineering Lab",
                    href: "/assistance/practical/university/engineering",
                  },
                  {
                    title: "Computer Science Lab",
                    href: "/assistance/practical/university/cse",
                  },
                ],
              },
            ],
          },
          {
            title: "Research and Survey",
            href: "/assistance/research-and-survey",
            description: "Browse research and survey assistance by academic level.",
            children: [
              {
                title: "Research",
                href: "/assistance/research-and-survey/research",
              },
              { title: "Survey", href: "/assistance/research-and-survey/survey" },
            ],
          },
          {
            title: "Thesis",
            href: "/assistance/thesis",
            description: "Browse thesis assistance by academic level.",
          },
          {
            title: "Assignment",
            href: "/assistance/assignments",
            description: "Browse assignment assistance by academic level.",
          },
        ],
      },
    ],
  },
  {
    title: "Find Work",
    href: "/assignments",
    description:
      "Browse academic jobs, submit bids, and monetise your skills as an assistant.",
    groups: [
      {
        title: "Browse Academic Jobs",
        description: "Find open student requests and submit proposals to earn money.",
        items: [
          {
            title: "Open Assignments Feed",
            href: "/assignments",
            description:
              "Browse all open student assignments, filter by subject, and place bids.",
          },
          {
            title: "Practical & Lab Work",
            href: "/assistance/practical",
            description:
              "Bid on practical notebook writing and lab experiment assistance.",
            children: [
              { title: "SSC Practicals", href: "/assistance/practical/ssc" },
              { title: "HSC Practicals", href: "/assistance/practical/hsc" },
              {
                title: "University Labs",
                href: "/assistance/practical/university",
              },
            ],
          },
          {
            title: "Research & Surveys",
            href: "/assistance/research-and-survey",
            description:
              "Earn by conducting academic surveys, data collection, and research analysis.",
            children: [
              {
                title: "Academic Research",
                href: "/assistance/research-and-survey/research",
              },
              {
                title: "Survey Data Collection",
                href: "/assistance/research-and-survey/survey",
              },
            ],
          },
          {
            title: "Thesis & Dissertations",
            href: "/assistance/thesis",
            description:
              "Offer thesis consultation, chapter reviews, and academic formatting.",
          },
        ],
      },
      {
        title: "Assistant Workspace & Tools",
        description: "Manage your gig offerings, fulfilment tools, and earnings.",
        items: [
          {
            title: "Academic Gigs Catalog",
            href: "/gigs",
            description:
              "Showcase pre-packaged academic services for students to hire directly.",
          },
          {
            title: "Create a Gig Package",
            href: "/vendor/gigs/create",
            description:
              "Publish custom service packages and pricing tiers for student buyers.",
            badge: "members",
            requiresMembership: true,
          },
          {
            title: "Handwriting Matcher",
            href: "/handwriting-matcher",
            description:
              "AI-powered tool to replicate student handwriting styles for authentic deliverables.",
          },
          {
            title: "Active Orders & Contracts",
            href: "/orders",
            description:
              "Track ongoing student assignments, submit deliverables, and meet deadlines.",
            badge: "signin",
          },
          {
            title: "Assistant Wallet & Payouts",
            href: "/vendor/wallet",
            description:
              "Track escrow balances and withdraw earnings via bKash, Nagad, or Bank.",
            badge: "signin",
          },
          {
            title: "Become a Verified Assistant",
            href: "/vendor/apply",
            description:
              "Submit your academic credentials and handwriting sample to start earning.",
            badge: "helpers",
          },
        ],
      },
    ],
  },
  {
    title: "Resources",
    href: "/resources",
    description: "Explore learning resources and platform information.",
    groups: [
      {
        title: "Explore",
        description: "Resources for the academic community.",
        items: [
          {
            title: "Study Guides",
            href: "/resources/study-guides",
            children: [
              // Level guides live as anchored sections on the single study-guides
              // page, so these links resolve instead of 404ing.
              { title: "SSC Guides", href: "/resources/study-guides#ssc" },
              { title: "HSC Guides", href: "/resources/study-guides#hsc" },
              {
                title: "University Guides",
                href: "/resources/study-guides#university",
              },
            ],
          },
          {
            title: "Membership & Pricing",
            href: "/membership",
            description: "Compare plans and unlock posting jobs and taking jobs.",
          },
          { title: "How It Works", href: "/how-it-works" },
          { title: "About Us", href: "/about" },
          { title: "Contact", href: "/contact" },
        ],
      },
    ],
  },
];

/**
 * @deprecated Use `publicNavigation`. Kept so older imports keep working.
 */
export const dropdownNavigation = publicNavigation;

/** Badge copy rendered beside public navigation items. */
export const NAV_BADGE_LABELS: Record<NavBadge, string> = {
  members: "Members",
  helpers: "Verified helpers",
  signin: "Sign in",
};
