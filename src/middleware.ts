import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "bn"] as const;
const DEFAULT_LOCALE = "en";
const LOCALE_COOKIE = "preferred-language";

function isLocale(value: string): value is (typeof LOCALES)[number] {
  return LOCALES.includes(value as (typeof LOCALES)[number]);
}

function detectLocale(request: NextRequest): string {
  // 1. Cookie set by language provider / previous selection
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const primary = acceptLanguage.split(",")[0].split("-")[0].trim().toLowerCase();
    if (isLocale(primary)) {
      return primary;
    }
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static assets, Next.js internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // 1. Correlation ID: Inject or propagate unique request ID
  const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();
  response.headers.set("x-correlation-id", correlationId);

  // 2. Security Headers (Helmet-equivalent)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  // HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // 4. Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' blob: data: https:;
    font-src 'self' https: data:;
    connect-src 'self' https://koredao-server.onrender.com http://localhost:3000 http://localhost:3001 ws: wss:;
    frame-ancestors 'none';
    form-action 'self';
    base-uri 'self';
  `.replace(/\s{2,}/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  // 5. Locale detection and cookie persistence
  const existingCookie = request.cookies.get("preferred-language")?.value;
  if (!existingCookie || !["en", "bn"].includes(existingCookie)) {
    // Detect locale from cookie or Accept-Language header
    const cookieLocale = request.cookies.get("preferred-language")?.value;
    let locale = "en";
    if (cookieLocale && ["en", "bn"].includes(cookieLocale)) {
      locale = cookieLocale;
    } else {
      const acceptLanguage = request.headers.get("accept-language");
      if (acceptLanguage) {
        const primary = acceptLanguage.split(",")[0].split("-")[0].trim().toLowerCase();
        if (["en", "bn"].includes(primary)) {
          locale = primary;
        }
      }
    }
    response.cookies.set("preferred-language", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};