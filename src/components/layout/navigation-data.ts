// src/components/layout/navigation-data.ts

export type NavItem = {
    title: string;
    href: string;
    description?: string;
};

export type NavGroup = {
    title: string;
    description: string;
    items: NavItem[];
};

export type DropdownNavItem = {
    title: string;
    href?: string;
    description?: string;
    groups?: NavGroup[];
};

export const dropdownNavigation: DropdownNavItem[] = [
    {
        title: "Services",
        href: "/gigs",
        description: "Explore academic services and find the right support.",
        groups: [
            {
                title: "Academic Services",
                description: "Browse services for your academic needs.",
                items: [
                    {
                        title: "Writing & Editing",
                        href: "/gigs/writing-editing",
                        description: "Essays, reports and proofreading",
                    },
                    {
                        title: "Assignment Support",
                        href: "/gigs/assignments",
                        description: "Get help understanding assignments",
                    },
                    {
                        title: "Presentation Design",
                        href: "/gigs/presentations",
                        description: "Slides and academic presentations",
                    },
                ],
            },
            {
                title: "Study & Learning",
                description: "Find learning resources and expert support.",
                items: [
                    {
                        title: "Online Tutoring",
                        href: "/gigs/tutoring",
                        description: "Learn with a subject specialist",
                    },
                    {
                        title: "Research Support",
                        href: "/gigs/research",
                        description: "Research guidance and formatting",
                    },
                    {
                        title: "Handwriting Matcher",
                        href: "/handwriting-matcher",
                        description: "Explore handwriting matching tools",
                    },
                ],
            },
        ],
    },
    {
        title: "Find Helpers",
        href: "/helpers",
        description: "Discover people who can help with your academic work.",
        groups: [
            {
                title: "Discover Talent",
                description: "Browse helpers by your needs.",
                items: [
                    {
                        title: "All Helpers",
                        href: "/helpers",
                        description: "Explore the helper directory",
                    },
                    {
                        title: "Top Rated Helpers",
                        href: "/helpers/top-rated",
                        description: "Discover highly rated profiles",
                    },
                    {
                        title: "Browse by Subject",
                        href: "/helpers/subjects",
                        description: "Find help for a specific subject",
                    },
                ],
            },
        ],
    },
    {
        title: "Job Board",
        href: "/assignments",
        description: "Explore opportunities and academic task listings.",
        groups: [
            {
                title: "Opportunities",
                description: "Explore available assignments and projects.",
                items: [
                    {
                        title: "Browse Jobs",
                        href: "/assignments",
                        description: "View available opportunities",
                    },
                    {
                        title: "Post a Job",
                        href: "/assignments/create",
                        description: "Create a new job listing",
                    },
                    {
                        title: "My Applications",
                        href: "/assignments/applications",
                        description: "Review your applications",
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
                description: "Helpful resources for the community.",
                items: [
                    {
                        title: "Study Guides",
                        href: "/resources/study-guides",
                        description: "Browse study materials",
                    },
                    {
                        title: "How It Works",
                        href: "/how-it-works",
                        description: "Learn how KoreDao works",
                    },
                    {
                        title: "About Us",
                        href: "/about",
                        description: "Get to know KoreDao",
                    },
                    {
                        title: "Contact",
                        href: "/contact",
                        description: "Get in touch with our team",
                    },
                ],
            },
        ],
    },
];