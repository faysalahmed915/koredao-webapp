
// src/components/layout/navigation-data.ts

export type NavItem = {
    title: string;
    href: string;
    description?: string;
    children?: NavItem[];
};

export type NavGroup = {
    title: string;
    description: string;
    items: NavItem[];
};

export type DropdownNavItem = {
    title: string;
    href: string;
    description?: string;
    groups?: NavGroup[];
};

export const dropdownNavigation: DropdownNavItem[] = [
    {
        title: "Hire Assistance",
        href: "/assistance",
        description:
            "Discover academic assistance for your practicals and coursework.",
        groups: [
            {
                title: "Discover Assistance",
                description: "Choose your academic level and practical category.",
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
                        title: "Top Rated Helpers",
                        href: "/helpers/top-rated",
                        description: "Discover highly rated helpers.",
                    },
                    {
                        title: "Browse by Subject",
                        href: "/helpers/subjects",
                        description: "Find assistance by subject.",
                        children: [
                            {
                                title: "Mathematics",
                                href: "/helpers/subjects/mathematics",
                            },
                            {
                                title: "Physics",
                                href: "/helpers/subjects/physics",
                            },
                            {
                                title: "Chemistry",
                                href: "/helpers/subjects/chemistry",
                            },
                        ],
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
];



// {
//         title: "Services",
//         href: "/gigs",
//         description: "Explore academic services and find the right support.",
//         groups: [
//             {
//                 title: "Academic Services",
//                 description: "Browse services for your academic needs.",
//                 items: [
//                     {
//                         title: "Writing & Editing",
//                         href: "/gigs/writing-editing",
//                         description: "Essays, reports and proofreading",
//                     },
//                     {
//                         title: "Assignment Support",
//                         href: "/gigs/assignments",
//                         description: "Get help understanding assignments",
//                     },
//                     {
//                         title: "Presentation Design",
//                         href: "/gigs/presentations",
//                         description: "Slides and academic presentations",
//                     },
//                 ],
//             },
//             {
//                 title: "Study & Learning",
//                 description: "Find learning resources and expert support.",
//                 items: [
//                     {
//                         title: "Online Tutoring",
//                         href: "/gigs/tutoring",
//                         description: "Learn with a subject specialist",
//                     },
//                     {
//                         title: "Research Support",
//                         href: "/gigs/research",
//                         description: "Research guidance and formatting",
//                     },
//                     {
//                         title: "Handwriting Matcher",
//                         href: "/handwriting-matcher",
//                         description: "Explore handwriting matching tools",
//                     },
//                 ],
//             },
//         ],
//     },
//     {
//         title: "Find Work",
//         href: "/assistance",
//         description: "Discover people who can help with your academic work.",
//         groups: [
//             {
//                 title: "Discover Talent",
//                 description: "Browse helpers by your needs.",
//                 items: [
//                     {
//                         title: "All Helpers",
//                         href: "/helpers",
//                         description: "Explore the helper directory",
//                     },
//                     {
//                         title: "Top Rated Helpers",
//                         href: "/helpers/top-rated",
//                         description: "Discover highly rated profiles",
//                     },
//                     {
//                         title: "Browse by Subject",
//                         href: "/helpers/subjects",
//                         description: "Find help for a specific subject",
//                     },
//                 ],
//             },
//         ],
//     },
//     {
//         title: "Job Board",
//         href: "/assignments",
//         description: "Explore opportunities and academic task listings.",
//         groups: [
//             {
//                 title: "Opportunities",
//                 description: "Explore available assignments and projects.",
//                 items: [
//                     {
//                         title: "Browse Jobs",
//                         href: "/assignments",
//                         description: "View available opportunities",
//                     },
//                     {
//                         title: "Post a Job",
//                         href: "/assignments/create",
//                         description: "Create a new job listing",
//                     },
//                     {
//                         title: "My Applications",
//                         href: "/assignments/applications",
//                         description: "Review your applications",
//                     },
//                 ],
//             },
//         ],
//     },