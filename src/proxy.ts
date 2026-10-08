import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 1. Correlation Tracing: Inject or propagate unique request ID
  const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();

  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // 2. Set Correlation ID on response
  response.headers.set("x-correlation-id", correlationId);

  // 3. Defense-in-depth Security Headers (Helmet-equivalent)
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

  return response;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
