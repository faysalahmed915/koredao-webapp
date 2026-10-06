export const siteConfig = {
  name: "NextEnterprise",
  shortName: "NE",
  description:
    "Production-grade, highly secured Next.js starter engineered with defense-in-depth, shadcn/ui, Better-Auth, and strict Zod validation.",
  url: process.env.APP_URL || "http://localhost:3001",
  ogImage: "/og.png",
  links: {
    github: "https://github.com",
    docs: "/about",
  },
  author: {
    name: "Enterprise Core Team",
    url: "https://github.com",
  },
  mainNav: [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ],
  securityBadges: [
    { title: "Defense-in-Depth", desc: "Strict CSP, HSTS, Sanitized Inputs" },
    { title: "Session Security", desc: "Better-Auth HTTP-Only Cookies" },
    { title: "Type-Safe Contracts", desc: "Zod Schema Validation Everywhere" },
    { title: "NestJS Paired", desc: "Seamless Backend Ready Architecture" },
  ],
};

export type SiteConfig = typeof siteConfig;
