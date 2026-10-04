# Enterprise Security Architecture & Defense-in-Depth

> Security manual detailing the defensive controls, threat mitigations, and hygiene practices implemented across the NextEnterprise frontend starter.

---

## 1. Security Philosophy: Defense-in-Depth

This frontend starter enforces security at multiple layers, operating under a **Zero-Trust** posture:

1. **Transport Layer**: Strict-Transport-Security (HSTS) with 2-year preloading and `includeSubDomains`.
2. **Browser Execution Layer**: Content Security Policy (CSP), frameguard `DENY`, and MIME type sniffing prevention.
3. **Session & Identity Layer**: HTTP-only, secure, SameSite cookies managed via Better-Auth.
4. **Data Input Layer**: Strict Zod schema validation on both client forms and API route handlers.
5. **Observability Layer**: End-to-end `x-correlation-id` propagation to trace requests into the NestJS backend logs.

---

## 2. Defensive Controls Matrix

| Defensive Control | Implementation | OWASP Mitigation |
|---|---|---|
| **Content Security Policy** | `src/proxy.ts` headers | Prevents Cross-Site Scripting (XSS) and unauthorized script injection |
| **HSTS** | `max-age=63072000; includeSubDomains; preload` | Eliminates SSL-stripping and man-in-the-middle downgrade attacks |
| **Anti-Clickjacking** | `X-Frame-Options: DENY` | Prevents iframe embedding and UI redressing attacks |
| **MIME Sniffing Block** | `X-Content-Type-Options: nosniff` | Forces browser to honor declared MIME types |
| **Permissions Policy** | Restricts camera, mic, geolocation | Prevents unauthorized hardware sensor access |
| **Input Validation** | Zod `safeParse` on all payloads | Rejects malformed, injected, or oversized payloads |
| **Mass-Assignment Guard** | Strict DTO parsing | Prevents privilege escalation and unexpected attribute mutation |
| **Correlation Tracing** | `x-correlation-id` injection | Enables full auditability across distributed services |

---

## 3. Better-Auth Security Guardrails

- **Cookie Flags**: In production (`NODE_ENV=production`), session cookies are automatically stamped with `HttpOnly`, `Secure`, and `SameSite=Lax`.
- **Secret Entropy**: The `BETTER_AUTH_SECRET` must be a high-entropy string of at least 32 random characters.
- **Trusted Origins**: The `trustedOrigins` array in `src/lib/auth.ts` restricts incoming auth actions to verified domains and local development ports.

---

## 4. Frontend & Backend Security Alignment

| Protection Category | Next.js Frontend | NestJS Companion Backend |
|---|---|---|
| HTTP Headers | `src/proxy.ts` | `helmet()` in `main.ts` |
| Rate Limiting | Edge Proxy & Backend delegation | `@nestjs/throttler` |
| Validation | Zod schemas in `src/lib/schemas` | `class-validator` + `AppValidationPipe` |
| Error Leakage Prevention | Sanitized user toast messages | `HttpExceptionFilter` (strips DB errors & stack traces) |
| Distributed Tracing | Injects `x-correlation-id` | Logs `x-correlation-id` with PII masking |
