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
 * The "Hire Assistance" section exposes the 11 marketplace categories defined
 * in `@/config/marketplace`. Category slugs are taken from that configuration
 * so navigation and category landing pages can never drift apart. Education
 * tracks, academic levels and subject filters are exposed on the category
 * landing pages rather than duplicated in the header.
 *
 * Authenticated, role-specific navigation lives in
 * `@/components/layout/dashboard/dashboard-navigation`.
 */

import type { UserRole } from "@/types";
import type { NavItemsDictionary } from "@/i18n/types";
import { ALL_MARKETPLACE_CATEGORIES } from "@/config/marketplace/categories";

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

/**
 * Resolve a navigation title/description key to its translated string.
 *
 * Navigation data stores keys like `navItems.hireAssistance`, but the
 * translation dictionary (`t.navItems`) uses flat keys like `hireAssistance`.
 * Strip the `navItems.` prefix before lookup so the translation resolves;
 * fall back to the raw key if no translation exists.
 */
export function resolveNavTitle(
  key: string,
  t: NavItemsDictionary
): string {
  const cleanKey = key.replace(/^navItems\./, "");
  return ((t as unknown) as Record<string, string>)[cleanKey] || key;
}

/**
 * Map a marketplace category slug to the navigation title/description keys
 * used by the mega-menu. The slug is the single source of truth for the URL;
 * the keys resolve to translated labels.
 */
function categoryNavKeys(slug: string): {
  title: `navItems.${string}`;
  description: `navItems.${string}`;
} {
  const keys: Record<string, { title: string; description: string }> = {
    assignments: {
      title: "navItems.categoryAssignments",
      description: "navItems.categoryAssignmentsDesc",
    },
    "practical-lab": {
      title: "navItems.categoryPracticalLab",
      description: "navItems.categoryPracticalLabDesc",
    },
    "research-thesis": {
      title: "navItems.categoryResearchThesis",
      description: "navItems.categoryResearchThesisDesc",
    },
    tutoring: {
      title: "navItems.categoryTutoring",
      description: "navItems.categoryTutoringDesc",
    },
    "study-materials": {
      title: "navItems.categoryStudyMaterials",
      description: "navItems.categoryStudyMaterialsDesc",
    },
    "data-analysis": {
      title: "navItems.categoryDataAnalysis",
      description: "navItems.categoryDataAnalysisDesc",
    },
    "programming-technical": {
      title: "navItems.categoryProgrammingTechnical",
      description: "navItems.categoryProgrammingTechnicalDesc",
    },
    "presentations-reports": {
      title: "navItems.categoryPresentationsReports",
      description: "navItems.categoryPresentationsReportsDesc",
    },
    "editing-proofreading": {
      title: "navItems.categoryEditingProofreading",
      description: "navItems.categoryEditingProofreadingDesc",
    },
    "translation-transcription": {
      title: "navItems.categoryTranslationTranscription",
      description: "navItems.categoryTranslationTranscriptionDesc",
    },
    "exam-admission": {
      title: "navItems.categoryExamAdmission",
      description: "navItems.categoryExamAdmissionDesc",
    },
  };
  const resolved = keys[slug];
  if (!resolved) {
    throw new Error(
      `No navigation keys defined for marketplace category slug "${slug}". Add them to navItems in the translation dictionaries.`
    );
  }
  return resolved as {
    title: `navItems.${string}`;
    description: `navItems.${string}`;
  };
}

/** Build the "Hire Assistance" category items from the marketplace config. */
function hireAssistanceItems(): NavItem[] {
  return ALL_MARKETPLACE_CATEGORIES.filter((category) => category.enabled).map(
    (category) => {
      const { title, description } = categoryNavKeys(category.slug);
      return {
        title,
        href: `/categories?category=${category.slug}`,
        description,
      };
    }
  );
}

export const publicNavigation: DropdownNavItem[] = [
  {
    title: "navItems.hireAssistance",
    href: "/categories",
    description: "navItems.hireAssistanceDesc",
    groups: [
      {
        title: "All categories",
        items: hireAssistanceItems(),
      },
    ],
  },
  {
    title: "navItems.findWork",
    href: "/assignments",
    description: "navItems.findWorkDesc",
    groups: [
      {
        title: "Browse Academic Jobs",
        description:
          "Find open student requests and submit proposals to earn money.",
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
    title: "navItems.resources",
    href: "/resources",
    description: "navItems.resourcesDesc",
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
