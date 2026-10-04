# Agent & Developer Workflow Guide

This document contains strict conventions, rules, and workflows for **AI Coding Agents** (and human engineers) operating within this Next.js frontend repository.

---

## 1. Core Directives for AI Agents

1. **Security Guardrails are Non-Negotiable**:
   - Never disable the edge security proxy in `src/proxy.ts`.
   - Always ensure form inputs and API payloads are validated with Zod schemas.
   - Never commit API secrets or credentials to source control.
   - Always propagate the `x-correlation-id` header when making outgoing HTTP requests to the backend.

2. **App Router & Server/Client Boundary**:
   - Keep pages and layouts as **Server Components** by default to maximize SEO and minimize client bundle size.
   - Add `"use client"` **only** to leaves in the component tree that require state, event listeners, or browser APIs (e.g. form handlers, toggles).

3. **Styling & Design System**:
   - Use **shadcn/ui** components located in `src/components/ui`.
   - Never use ad-hoc inline styles or unvetted CSS-in-JS.
   - When styling links as buttons, use `buttonVariants({ variant, size })` from `@/components/ui/button`.
   - Ensure all interactive elements support both **light** and **dark** modes seamlessly.

4. **Internationalization (i18n)**:
   - When adding new user-facing strings, add them to `src/i18n/types.ts` and all 4 dictionary files:
     - `src/i18n/dictionaries/en.json`
     - `src/i18n/dictionaries/es.json`
     - `src/i18n/dictionaries/fr.json`
     - `src/i18n/dictionaries/de.json`

---

## 2. Recipe: Adding a New Page

When creating a new route (e.g. `/pricing`), follow this layout:

```
src/app/pricing/
├── page.tsx          # Server Component with Metadata & OpenGraph tags
└── components/       # Client components if interactivity is needed
```

### Checklist for New Pages:
- [ ] Export `metadata: Metadata` with descriptive title, description, and openGraph properties
- [ ] Include a single semantic `<h1>` tag
- [ ] Verify responsive layout across mobile, tablet, and desktop
- [ ] Add route to `src/app/sitemap.ts`
- [ ] Verify `npm run build` passes with zero errors

---

## 3. Recipe: Adding a New Form

1. Define the Zod schema in `src/lib/schemas/feature.schema.ts`.
2. Infer the TypeScript type: `export type FeatureInput = z.infer<typeof featureSchema>`.
3. Use `useForm<FeatureInput>({ resolver: zodResolver(featureSchema) })`.
4. Provide a "Fill Demo Data" helper button for rapid testing and QA review.
5. Display user-friendly notifications via `toast` from `sonner`.

---

## 4. Verification Protocol

Before declaring any coding task complete, run this verification sequence in terminal:

```bash
# 1. Check TypeScript compilation and production build
npm run build

# 2. Run linter
npm run lint
```
