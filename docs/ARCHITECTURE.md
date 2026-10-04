# Next.js Enterprise Frontend Architecture

> Production-grade, high-assurance Next.js App Router architecture engineered with **defense-in-depth security**, fullstack type safety, **Better-Auth**, **shadcn/ui**, and seamless pairing with the companion **NestJS Enterprise Backend**.

---

## 1. System Topology & Layering

```
nextjs/
├── .agent/
│   └── context.json                   # Machine-readable metadata for AI agent tooling
├── docs/                              # Project architecture & workflow documentation
│   ├── ARCHITECTURE.md                # System topology, App Router layers, state & i18n
│   ├── AGENT_GUIDE.md                 # Strict coding standards, conventions & verification
│   ├── SECURITY.md                    # Defense-in-depth, security headers, auth hygiene
│   └── BETTER_AUTH_GUIDE.md           # Next.js Better-Auth integration and NestJS pairing
├── src/
│   ├── app/                           # Next.js 16 App Router hierarchy
│   │   ├── api/                       # API route handlers (Better-Auth, Contact)
│   │   ├── about/                     # About Us page with architecture and team
│   │   ├── contact/                   # Contact page with demo quick-fill and Zod validation
│   │   ├── login/                     # Secure Login page with demo credentials
│   │   ├── register/                  # Secure Register page with password strength meter
│   │   ├── layout.tsx                 # Root layout with ThemeProvider, I18nProvider, Header, Footer
│   │   ├── page.tsx                   # Prerendered Static Home page
│   │   ├── robots.ts                  # SEO robots crawler rules
│   │   ├── sitemap.ts                 # Dynamic XML sitemap generator
│   │   ├── not-found.tsx              # Zero-Trust custom 404 page
│   │   └── globals.css                # Tailwind v4 + shadcn design tokens & OKLCH colors
│   ├── components/                    # Design system & modular components
│   │   ├── layout/                    # Header, Footer, ThemeToggle, LanguageToggle
│   │   ├── providers/                 # ThemeProvider, LanguageProvider
│   │   ├── sections/                  # Hero, Features, SecurityShowcase, Stats, CtaBanner
│   │   └── ui/                        # Accessible shadcn UI primitives (button, card, dialog, etc.)
│   ├── config/                        # Strict configuration namespaces
│   │   ├── env.ts                     # Zod-validated environment config (fail-fast)
│   │   └── site.ts                    # Site metadata, navigation items, links
│   ├── i18n/                          # Multi-language dictionary system
│   │   ├── dictionaries/              # Type-safe translations (en, es, fr, de)
│   │   └── types.ts                   # Language types & dictionary contracts
│   ├── lib/                           # Core utilities & domain logic
│   │   ├── auth.ts                    # Server-side Better-Auth instance
│   │   ├── auth-client.ts             # Client-side Better-Auth client & hooks
│   │   ├── schemas/                   # Zod schemas (auth.schema.ts, contact.schema.ts)
│   │   └── utils.ts                   # Class merging (cn) and helpers
│   └── proxy.ts                       # Edge security proxy (CSP, HSTS, x-correlation-id)
├── .env.example                       # Documented environment template
├── .env                               # Local development configuration
└── package.json                       # Dependencies & scripts
```

---

## 2. Request Lifecycle & Security Flow

Every request entering the application traverses multiple defensive layers:

```
User Request
     │
     ▼
[Edge Security Proxy (src/proxy.ts)]
     ├─ Inject / propagate `x-correlation-id`
     ├─ Enforce Content-Security-Policy (CSP)
     ├─ Enforce HSTS (Strict-Transport-Security)
     ├─ Enforce X-Frame-Options: DENY (anti-clickjacking)
     └─ Enforce X-Content-Type-Options: nosniff
     │
     ▼
[Next.js App Router (src/app)]
     ├─ Server Components (Prerendered SSG / Dynamic SSR)
     │   └─ Zero client JavaScript overhead where possible
     └─ Client Components (Wrapped in Providers)
         ├─ ThemeProvider (next-themes: dark/light/system)
         └─ LanguageProvider (i18n: en/es/fr/de)
     │
     ▼
[Form / API Ingestion]
     └─ Strict Zod safeParse validation
     │
     ▼
[Authentication & Session (Better-Auth)]
     ├─ HTTP-Only session cookies
     └─ Synchronized with NestJS backend (/api/v1/auth)
```

---

## 3. NestJS Companion Backend Pairing

This frontend is designed as the direct client counterpart to the `nestjs` enterprise backend:

| Frontend Responsibility | Backend Counterpart |
|---|---|
| Injects `x-correlation-id` header | `CorrelationIdMiddleware` captures and attaches to logs |
| Zod form validation | `AppValidationPipe` with whitelist and mass-assignment protection |
| `src/lib/auth-client.ts` | NestJS `AuthModule` & `AuthGuard` |
| Port 3001 | Port 3000 (`/api/v1`) |
| CORS origin configured in backend `.env` | Backend URL configured in frontend `NEXT_PUBLIC_BACKEND_URL` |
