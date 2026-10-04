# Better-Auth Fullstack Integration Guide

> Explains the client-backend architecture between the **Next.js Frontend** and the **NestJS Backend**.

---

## 1. Architectural Model

```
+------------------------------------+        +------------------------------------+
|       Next.js Frontend (:3001)     |        |       NestJS Backend (:3000)       |
|                                    |        |                                    |
|  - Pure client consumer            |        |  - BETTER_AUTH_SECRET owner        |
|  - NO secret required in Next.js   | HTTP   |  - Better-Auth mounted on Express  |
|  - createAuthClient(better-auth)   |=======>|  - Prisma PostgreSQL Adapter       |
|  - useSession(), signIn, signUp    |        |  - AuthGuard / @CurrentUser()      |
|  - credentials: "include"          |        |  - Sets HttpOnly Session Cookies   |
+------------------------------------+        +------------------------------------+
```

### Key Takeaways:
1. **Zero Secret in Frontend**: The `BETTER_AUTH_SECRET` resides strictly in the `nestjs` backend. Next.js does not need or store this secret.
2. **CORS & Trusted Origins**:
   - `nestjs/.env` configures `CORS_ORIGIN="http://localhost:3000,http://localhost:3001,http://localhost:5173"`.
   - `nestjs/.env` configures `BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:5173,http://localhost:3001"`.
3. **Session Cookies**:
   - NestJS sets the session cookie with `credentials: true`.
   - The Next.js client passes `credentials: "include"` on every auth call, allowing seamless session persistence across origins.

---

## 2. Using Better-Auth in Next.js

Import from `@/lib/auth-client`:

```tsx
"use client";

import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";

// 1. Read Current Session:
const { data: session, isPending } = useSession();

// 2. Sign In:
const result = await signIn.email({
  email: "user@example.com",
  password: "Password123!",
  rememberMe: true,
});

// 3. Sign Up:
const result = await signUp.email({
  email: "newuser@example.com",
  password: "Password123!",
  name: "Jane Doe",
});

// 4. Sign Out:
await signOut();
```

---

## 3. NestJS Backend Endpoints

Better-Auth natively handles routes mounted at `http://localhost:3000/api/auth`:
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET /api/auth/get-session`
- `GET /api/auth/ok`
