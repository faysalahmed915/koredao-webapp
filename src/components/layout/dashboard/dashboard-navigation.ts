// src/components/layout/dashboard/dashboard-navigation.ts

/**
 * Role-based dashboard sidebar navigation.
 *
 * This is the authenticated counterpart of
 * `@/components/layout/navigation-data` (which only describes the public
 * marketing navigation). Every role gets its own professional grouping, and
 * paid actions carry `requiresMembership` so the sidebar can show a lock chip
 * and route the user to `/membership` instead of hiding the destination.
 */

import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BadgeCheck,
  Briefcase,
  ClipboardCheck,
  Compass,
  FileText,
  Gauge,
  Gavel,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  PenTool,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { UserRole } from "@/types";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  /** Match the route exactly instead of treating it as a prefix. */
  exact?: boolean;
  /** Short status chip rendered on the right (e.g. a count or "New"). */
  badge?: string;
  /** Paid marketplace action — locked until the user holds MEMBER. */
  requiresMembership?: boolean;
  /** Only meaningful once the user is an approved, verified helper. */
  requiresVerifiedHelper?: boolean;
}

export interface DashboardNavSection {
  title: string;
  items: DashboardNavItem[];
}

export interface DashboardNavContext {
  isMember: boolean;
  isVerifiedHelper: boolean;
}

/**
 * The sidebar flavour a user should see.
 *
 * A subscribed customer is shown the MEMBER workspace (they can now post jobs),
 * while their stored role intentionally stays CUSTOMER on the server.
 */
export function resolveDashboardRole(
  role: UserRole | null,
  isMember: boolean
): UserRole {
  if (!role) return UserRole.CUSTOMER;
  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return UserRole.ADMIN;
  }
  if (role === UserRole.MODERATOR) return UserRole.MODERATOR;
  if (role === UserRole.VENDOR) return UserRole.VENDOR;
  if (role === UserRole.MEMBER) return UserRole.MEMBER;
  return isMember ? UserRole.MEMBER : UserRole.CUSTOMER;
}

const accountSection = (): DashboardNavSection => ({
  title: "Account",
  items: [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      description: "Your identity, campus and verification details.",
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
      description: "Escrow-safe conversations with your counterpart.",
    },
  ],
});

const CUSTOMER_NAVIGATION: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "My Orders",
        href: "/orders",
        icon: Receipt,
        description: "Track escrow-funded projects end to end.",
      },
    ],
  },
  {
    title: "Buy & Hire",
    items: [
      {
        title: "Browse Services",
        href: "/gigs",
        icon: Compass,
        description: "Pre-packaged academic services from verified helpers.",
      },
      {
        title: "Browse Jobs",
        href: "/assignments",
        icon: Briefcase,
        description: "Open student requests and proposals.",
      },
      {
        title: "Post a Job",
        href: "/assignments/create",
        icon: PlusCircle,
        description: "Publish a brief and receive competitive bids.",
        requiresMembership: true,
      },
      {
        title: "Handwriting Matcher",
        href: "/handwriting-matcher",
        icon: PenTool,
        description: "Match a helper's handwriting to your own.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        title: "Wallet & Transactions",
        href: "/customer/wallet",
        icon: Wallet,
        description: "Escrow deposits, releases, refunds and payment history.",
      },
    ],
  },
  {
    title: "Membership",
    items: [
      {
        title: "Plans & Pricing",
        href: "/membership",
        icon: Sparkles,
        description: "Unlock posting jobs and taking jobs.",
      },
      {
        title: "Become a Helper",
        href: "/vendor/apply",
        icon: BadgeCheck,
        description: "Get verified to bid on jobs and sell gigs.",
      },
    ],
  },
  accountSection(),
];

const VENDOR_NAVIGATION: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "My Orders",
        href: "/orders",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Work",
    items: [
      {
        title: "Find Jobs",
        href: "/assignments",
        icon: Briefcase,
        description: "Open briefs you can bid on.",
        requiresMembership: true,
      },
      {
        title: "Create a Gig",
        href: "/vendor/gigs/create",
        icon: FileText,
        description: "Publish a new service package.",
        requiresMembership: true,
      },
      {
        title: "Handwriting Matcher",
        href: "/handwriting-matcher",
        icon: PenTool,
      },
    ],
  },
  {
    title: "Earnings",
    items: [
      {
        title: "Wallet & Payouts",
        href: "/vendor/wallet",
        icon: Wallet,
        description: "Escrow balance, ledger and withdrawals.",
      },
    ],
  },
  {
    title: "Membership",
    items: [
      {
        title: "Plans & Pricing",
        href: "/membership",
        icon: Sparkles,
        description: "Required to bid on jobs and publish gigs.",
      },
    ],
  },
  accountSection(),
];

const MEMBER_NAVIGATION: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        title: "My Orders",
        href: "/orders",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Buy & Hire",
    items: [
      {
        title: "Post a Job",
        href: "/assignments/create",
        icon: PlusCircle,
        description: "Member perk — publish unlimited briefs.",
      },
      {
        title: "Browse Services",
        href: "/gigs",
        icon: Compass,
      },
      {
        title: "Handwriting Matcher",
        href: "/handwriting-matcher",
        icon: PenTool,
      },
    ],
  },
  {
    title: "Work & Earn",
    items: [
      {
        title: "Find Jobs",
        href: "/assignments",
        icon: Briefcase,
        description: "Bid on open student requests.",
        requiresVerifiedHelper: true,
      },
      {
        title: "Create a Gig",
        href: "/vendor/gigs/create",
        icon: FileText,
        description: "Publish service packages for students.",
        requiresVerifiedHelper: true,
      }
    ],
  },
  {
    title: "Wallet & Transactions",
    items: [
      {
        title: "My Wallet",
        href: "/member/wallet",
        icon: Wallet,
        description: "Escrow payments, refunds and membership billing history.",
      },
    ],
  },
  {
    title: "Membership",
    items: [
      {
        title: "My Membership",
        href: "/membership",
        icon: Sparkles,
        description: "Plan, billing period and renewal.",
      },
    ],
  },
  accountSection(),
];

const MODERATOR_NAVIGATION: DashboardNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Gauge,
        exact: true,
        description: "Monitor moderation activity and trust & safety metrics.",
      },
      {
        title: "My Orders",
        href: "/orders",
        icon: Receipt,
        description: "Track your orders and project progress.",
      },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      {
        title: "Moderation Queue",
        href: "/admin/moderation",
        icon: Gavel,
        description: "Review reported content, conversations and disputes.",
      },
      {
        title: "Helper Verifications",
        href: "/admin/verifications",
        icon: ClipboardCheck,
        description: "Review helper applications and verification evidence.",
      },
    ],
  },
  accountSection(),
];

const ADMIN_NAVIGATION: DashboardNavSection[] = [
  {
    title: "Command Centre",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Gauge,
        exact: true,
        description: "Monitor platform performance, GMV and escrow health.",
      },
      {
        title: "My Orders",
        href: "/orders",
        icon: Receipt,
        description: "Track your orders and project progress.",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Helper Verifications",
        href: "/admin/verifications",
        icon: UserCheck,
        description: "Approve or reject helper applications.",
      },
      {
        title: "Moderation Queue",
        href: "/admin/moderation",
        icon: ShieldCheck,
        description: "Manage disputes, reports and platform safety incidents.",
      },
      {
        title: "Membership Plans",
        href: "/membership",
        icon: Handshake,
        description: "Manage membership plans, pricing and benefits.",
      },
    ],
  },
  {
    title: "Finance & Support",
    items: [
      {
        title: "Payouts & Ledger",
        href: "/admin/wallet",
        icon: Banknote,
        description: "Review platform-wide wallet transactions and payouts.",
      },
      {
        title: "Support Desk",
        href: "/contact",
        icon: LifeBuoy,
        description: "Handle escalations and platform support issues.",
      },
    ],
  },
  accountSection(),
];

const SUPER_ADMIN_NAVIGATION: DashboardNavSection[] = [
  {
    title: "Command Centre",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Gauge,
        exact: true,
        description: "Oversee platform performance, GMV and escrow health.",
      },
      {
        title: "My Orders",
        href: "/orders",
        icon: Receipt,
        description: "Track your orders and project progress.",
      },
    ],
  },
  {
    title: "Platform Management",
    items: [
      {
        title: "Helper Verifications",
        href: "/admin/verifications",
        icon: UserCheck,
        description: "Oversee helper applications and verification decisions.",
      },
      {
        title: "Moderation Queue",
        href: "/admin/moderation",
        icon: ShieldCheck,
        description: "Oversee disputes, reports and platform safety incidents.",
      },
      {
        title: "Membership Plans",
        href: "/membership",
        icon: Handshake,
        description: "Manage membership plans, pricing and benefits.",
      },
    ],
  },
  {
    title: "Finance & Support",
    items: [
      {
        title: "Payouts & Ledger",
        href: "/admin/wallet",
        icon: Banknote,
        description: "Audit platform-wide transactions, escrow and payouts.",
      },
      {
        title: "Support Desk",
        href: "/contact",
        icon: LifeBuoy,
        description: "Oversee escalations and platform support operations.",
      },
    ],
  },
  accountSection(),
];

export const DASHBOARD_NAVIGATION: Record<UserRole, DashboardNavSection[]> = {
  [UserRole.SUPER_ADMIN]: SUPER_ADMIN_NAVIGATION,
  [UserRole.ADMIN]: ADMIN_NAVIGATION,
  [UserRole.MODERATOR]: MODERATOR_NAVIGATION,
  [UserRole.VENDOR]: VENDOR_NAVIGATION,
  [UserRole.MEMBER]: MEMBER_NAVIGATION,
  [UserRole.CUSTOMER]: CUSTOMER_NAVIGATION,
};

/**
 * Resolves the sidebar sections for a user, dropping items they cannot use yet
 * (`requiresMembership` / `requiresVerifiedHelper`) and any section left empty.
 */
export function getDashboardNavigation(
  role: UserRole | null,
  ctx: DashboardNavContext
): DashboardNavSection[] {
  const sections =
    DASHBOARD_NAVIGATION[resolveDashboardRole(role, ctx.isMember)] ?? [];

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.requiresMembership && !ctx.isMember) return false;
        if (item.requiresVerifiedHelper && !ctx.isVerifiedHelper) return false;
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);
}
