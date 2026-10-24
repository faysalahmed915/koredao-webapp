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

  // Detect and set locale cookie if not already set
  const existingCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!existingCookie || !isLocale(existingCookie)) {
    const locale = detectLocale(request);
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
