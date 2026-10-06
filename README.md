# Enterprise Next.js Frontend Starter

> Production-grade, high-assurance Next.js 16 App Router starter architected with **defense-in-depth security as the highest priority**, accessible **shadcn/ui** design system, fullstack type-safe contracts with **Zod**, seamless **Better-Auth** session integration, and out-of-the-box pairing with the companion **NestJS Enterprise Backend**.

---

## Key Highlights

- 🛡️ **Defense-in-Depth Security**: Pre-configured with Edge security proxy (`src/proxy.ts`) enforcing **Content-Security-Policy (CSP)**, **HSTS** (2-year preload), **X-Frame-Options DENY**, MIME protection (`nosniff`), Referrer Policy, and Permissions Policy.
- ⚡ **Better-Auth Authentication**: Full integration with `@/lib/auth-client` session hooks, social login readiness (GitHub, Google), typed email/password signin & signup, and seamless token sync with the NestJS backend.
- 🎨 **shadcn/ui & Tailwind CSS v4**: Built upon modern accessible primitives, featuring dark/light/system theme switching (`next-themes`), custom OKLCH color palettes, and responsive mobile navigation drawer.
- 🌐 **Multi-Language Support (i18n)**: Zero-dependency, type-safe internationalization system supporting **English**, **Español**, **Français**, and **Deutsch** with persistent language preference.
- 📐 **Symmetric Fullstack Contracts**: Unified Zod schemas for forms and API routes (`src/lib/schemas`), mirroring the backend DTO validation pipe.
- 🔍 **Distributed Tracing & Auditability**: Unique `x-correlation-id` injected across all requests, response headers, and forwarded to backend services.
- 🚀 **Performance & SEO Excellence**: Turbopack-powered sub-second builds, dynamic metadata, XML sitemap (`/sitemap.xml`), robots directives (`/robots.txt`), and 100 Lighthouse-oriented Core Web Vitals.
- 🤖 **Comprehensive Developer & AI Agent Guides**: Complete documentation suite mirroring the NestJS starter standards for rapid onboarding.

---

## Documentation Hub

| Document | Purpose |
|---|---|
| 📐 [ARCHITECTURE.md](docs/ARCHITECTURE.md) | High-level system architecture, folder topology, request lifecycle, and backend pairing |
| 🤖 [AGENT_GUIDE.md](docs/AGENT_GUIDE.md) | Strict coding standards, conventions, page/form creation recipes, and verification protocol |
| 🛡️ [SECURITY.md](docs/SECURITY.md) | In-depth security manual, defensive controls matrix, OWASP Top 10 mitigation mapping, and headers |
| 🔑 [BETTER_AUTH_GUIDE.md](docs/BETTER_AUTH_GUIDE.md) | Step-by-step blueprint for Better-Auth client/server integration and session lifecycle |
| ⚙️ [.agent/context.json](.agent/context.json) | Machine-readable project metadata and rules for AI coding agents |

---

## Directory Topology

```
nextjs/
├── .agent/
│   └── context.json                   # Machine-readable metadata for AI agent tooling
├── docs/                              # Project architecture & workflow documentation
│   ├── ARCHITECTURE.md                # System topology, App Router layers, state & i18n
│   ├── AGENT_GUIDE.md                 # Explicit instructions & constraints for AI agents
│   ├── SECURITY.md                    # Defense-in-depth security manual & threat model
│   └── BETTER_AUTH_GUIDE.md           # Next.js Better-Auth integration and NestJS pairing
├── src/
│   ├── app/                           # Next.js 16 App Router hierarchy
│   │   ├── api/                       # API route handlers
│   │   │   ├── auth/[...all]/route.ts # Better-Auth server endpoint handler
│   │   │   └── contact/route.ts       # Contact inquiry API with Zod validation
│   │   ├── about/page.tsx             # About Us page with architecture, team & values
│   │   ├── contact/page.tsx           # Contact page with demo quick-fill & Zod validation
│   │   ├── login/page.tsx             # Enterprise Login page with demo credentials
│   │   ├── register/page.tsx          # Enterprise Register page with password meter
│   │   ├── layout.tsx                 # Root layout with ThemeProvider, I18nProvider, Header, Footer
│   │   ├── page.tsx                   # Prerendered Static Home page with rich aesthetics
│   │   ├── robots.ts                  # Dynamic SEO robots.txt crawler rules
│   │   ├── sitemap.ts                 # Dynamic XML sitemap generator
│   │   ├── not-found.tsx              # Zero-Trust custom 404 page
│   │   └── globals.css                # Tailwind v4 + shadcn design tokens
│   ├── components/
│   │   ├── layout/                    # Header, Footer, ThemeToggle, LanguageToggle
│   │   ├── providers/                 # ThemeProvider (next-themes), LanguageProvider (i18n)
│   │   ├── sections/                  # Hero, Features, SecurityShowcase, Stats, CtaBanner
│   │   └── ui/                        # Accessible shadcn UI primitives
│   ├── config/
│   │   ├── env.ts                     # Zod-validated environment config (fail-fast)
│   │   └── site.ts                    # Site metadata, navigation items, links
│   ├── i18n/                          # Multi-language dictionary system
│   │   ├── dictionaries/              # Type-safe translations (en, es, fr, de)
│   │   └── types.ts                   # Language types & dictionary contracts
│   ├── lib/
│   │   ├── auth.ts                    # Server-side Better-Auth instance
│   │   ├── auth-client.ts             # Client-side Better-Auth client & hooks
│   │   ├── schemas/                   # Zod schemas (auth.schema.ts, contact.schema.ts)
│   │   └── utils.ts                   # Class merging (cn) and helpers
│   └── proxy.ts                       # Edge security proxy (CSP, HSTS, x-correlation-id)
├── .env.example                       # Documented environment template (zero secrets)
├── .env                               # Local environment variables
└── package.json                       # Scripts & dependencies
```

---

## Quickstart

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **NPM**: v10+

### 2. Setup Environment
```bash
# If .env does not exist, copy from .env.example
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev -- -p 3001
```

The application will start on [http://localhost:3001](http://localhost:3001).
- **Home**: [http://localhost:3001/](http://localhost:3001/)
- **About**: [http://localhost:3001/about](http://localhost:3001/about)
- **Contact**: [http://localhost:3001/contact](http://localhost:3001/contact) (Includes **Fill Demo Inquiry** button)
- **Sign In**: [http://localhost:3001/login](http://localhost:3001/login) (Includes **Demo User** and **Demo Admin** buttons)
- **Register**: [http://localhost:3001/register](http://localhost:3001/register) (Includes real-time password strength meter)
- **Sitemap**: [http://localhost:3001/sitemap.xml](http://localhost:3001/sitemap.xml)
- **Robots**: [http://localhost:3001/robots.txt](http://localhost:3001/robots.txt)

---

## NPM Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start Next.js development server with Turbopack |
| `npm run build` | Build optimized production bundle and prerender static pages |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint across the codebase |

---

## Companion Backend Pairing

This frontend connects seamlessly with the backend in `../nestjs`:

1. Ensure the NestJS backend is running on `http://localhost:3000`.
2. The frontend `.env` points `BACKEND_URL="http://localhost:3000/api/v1"`.
3. The NestJS backend `CORS_ORIGIN` includes `http://localhost:3001`.
4. Authentication sessions via Better-Auth share cookie and token contexts across services.

---

## License
MIT
