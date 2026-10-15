/**
 * Post-login redirect safety.
 *
 * The `?redirect=` query parameter is attacker-controllable (it is just a URL),
 * so it must never be handed to `router.push`/`router.replace` verbatim. Next.js
 * treats a non-local destination as an MPA navigation and calls
 * `location.assign(...)`, which would turn the login page into an open redirect —
 * exploitable without any credentials against a victim who is already signed in.
 *
 * Only same-origin, path-style destinations are accepted. Protocol-relative
 * (`//evil.example`), backslash-obfuscated (`/\evil.example`), absolute
 * (`https://…`) and scheme (`javascript:`) values all fall back to the default.
 */

export const DEFAULT_AUTH_REDIRECT = "/dashboard";

/** Auth routes that must never be a post-login destination (redirect loops). */
const REDIRECT_LOOP_PREFIXES = ["/login", "/register"];

export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (typeof candidate !== "string") return fallback;

  const value = candidate.trim();
  if (value.length === 0 || value.length > 512) return fallback;

  // Must be a rooted, single-slash absolute path.
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  // Reject control characters and encoded scheme separators.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;
  if (/^\/%2f/i.test(value)) return fallback;

  // Avoid bouncing an authenticated user back to the auth pages forever.
  const pathOnly = value.split("?")[0].split("#")[0];
  if (REDIRECT_LOOP_PREFIXES.some((prefix) => pathOnly.startsWith(prefix))) {
    return fallback;
  }

  return value;
}

/**
 * Guards a gateway-supplied checkout URL before the browser is navigated to it.
 * Only http(s) is allowed, so a compromised/misconfigured gateway response can
 * never become a `javascript:` navigation.
 */
export function isSafeExternalUrl(candidate: string | null | undefined): boolean {
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
