
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

