
// src/components/layout/navigation-data.ts

import { UserRole } from "@/types";

export type NavItem = {
    title: string;
    href: string;
    description?: string;
    children?: NavItem[];
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

export function isRouteActive(pathname: string, item: NavItem): boolean {
    return (
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`) ||
        (item.children?.some((child) => isRouteActive(pathname, child)) ?? false)
    );
}

export const dropdownNavigation: DropdownNavItem[] = [
    {
        title: "Hire Assistance",
        href: "/assistance",
        description:
            "Discover academic assistance for your practicals and coursework.",
        groups: [
            {
                // title: "Discover Assistance",
                // description: "Choose your academic level and practical category.",
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
                                    {
                                        title: "SSC ICT",
                                        href: "/assistance/practical/ssc/ict",
                                    },
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
                            {
                                title: "Survey",
                                href: "/assistance/research-and-survey/survey",
                            },
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
            "Browse academic jobs, submit bids, and monetize your skills as an assistant.",
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
                            {
                                title: "SSC Practicals",
                                href: "/assistance/practical/ssc",
                            },
                            {
                                title: "HSC Practicals",
                                href: "/assistance/practical/hsc",
                            },
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
                description:
                    "Manage your gig offerings, fulfillment tools, and earnings.",
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
                        roles: [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
                        requireAuth: true,
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
                        requireAuth: true,
                    },
                    {
                        title: "Assistant Wallet & Payouts",
                        href: "/vendor/wallet",
                        description:
                            "Track escrow balances and withdraw earnings via bKash, Nagad, or Bank.",
                        roles: [UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
                        requireAuth: true,
                    },
                    {
                        title: "Become a Verified Assistant",
                        href: "/vendor/apply",
                        description:
                            "Submit your academic credentials and handwriting sample to start earning.",
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
                            {
                                title: "SSC Guides",
                                href: "/resources/study-guides/ssc",
                            },
                            {
                                title: "HSC Guides",
                                href: "/resources/study-guides/hsc",
                            },
                            {
                                title: "University Guides",
                                href: "/resources/study-guides/university",
                            },
                        ],
                    },
                    {
                        title: "How It Works",
                        href: "/how-it-works",
                    },
                    {
                        title: "About Us",
                        href: "/about",
                    },
                    {
                        title: "Contact",
                        href: "/contact",
                    },
                ],
            },
        ],
    },
    {
        title: "Admin",
        href: "/admin",
        roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        requireAuth: true,
    },
    {
        title: "Moderation",
        href: "/admin/moderation",
        roles: [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN],
        requireAuth: true,
    },
    {
        title: "Gigs",
        href: "/gigs",
    },
    {
        title: "Handwriting Matcher",
        href: "/handwriting-matcher",
    },
    {
        title: "Messages",
        href: "/messages",
        requireAuth: true,
    },
    {
        title: "Orders",
        href: "/orders",
        requireAuth: true,
    },
    {
        title: "Dashboard",
        href: "/dashboard",
        requireAuth: true,
    },
];

