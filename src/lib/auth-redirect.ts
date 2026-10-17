/**
 * Post-auth return point preservation.
 *
 * When a visitor clicks a link that requires authentication, they are sent to
 * /login or /register. After successful sign-in / sign-up they should come back
 * to the exact page (and scroll position) they left.
 *
 * The return path is carried in the `?redirect=` query parameter (handled by
 * `safeRedirectPath` and the login/register pages). The scroll position is
 * stored in sessionStorage so it survives the cross-origin-style redirect flow.
 */

import { getUserRole } from "@/lib/access-control";
import { safeRedirectPath } from "@/lib/safe-redirect";

const RETURN_PATH_KEY = "koredao:return_path";
const SCROLL_POS_KEY = "koredao:scroll_pos";

/**
 * Save the current location and scroll position before navigating to an auth
 * page. Call this from link click handlers or layout guards that redirect to
 * /login or /register. Pass `path` to record a specific destination (must match
 * the `?redirect=` value generated for the same link).
 */
export function saveReturnPoint(scrollY: number, path?: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      RETURN_PATH_KEY,
      path ?? window.location.pathname + window.location.search
    );
    sessionStorage.setItem(SCROLL_POS_KEY, String(scrollY));
  } catch {
    // sessionStorage may be unavailable in private browsing; fail silently.
  }
}

/**
 * Read and clear the saved return point. Returns null if none was saved.
 * Call this on login/register pages after successful authentication.
 */
export function getReturnPoint(): { path: string; scrollY: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const path = sessionStorage.getItem(RETURN_PATH_KEY);
    const scrollYRaw = sessionStorage.getItem(SCROLL_POS_KEY);
    if (!path) return null;
    sessionStorage.removeItem(RETURN_PATH_KEY);
    sessionStorage.removeItem(SCROLL_POS_KEY);
    return {
      path,
      scrollY: parseInt(scrollYRaw || "0", 10) || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Clear any saved return point without consuming it.
 */
export function clearReturnPoint(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RETURN_PATH_KEY);
    sessionStorage.removeItem(SCROLL_POS_KEY);
  } catch {
    // fail silently
  }
}

/**
 * Restore scroll position after a navigation. The destination page may render
 * asynchronously (data fetches, images), so a single frame can be too early —
 * the browser clamps the scroll and the position is lost. Retry a few times
 * until the scroll sticks or attempts are exhausted.
 */
export function restoreScrollPosition(scrollY: number): void {
  if (typeof window === "undefined" || scrollY <= 0) return;
  let attempts = 0;
  const maxAttempts = 8;
  const tryScroll = () => {
    window.scrollTo(0, scrollY);
    attempts += 1;
    if (Math.abs(window.scrollY - scrollY) > 1 && attempts < maxAttempts) {
      setTimeout(tryScroll, 120);
    }
  };
  requestAnimationFrame(tryScroll);
}

/** Minimal router surface used by the helpers below. */
interface AuthRouter {
  push: (href: string) => void;
  replace: (href: string) => void;
  refresh: () => void;
}

/**
 * Final step of a successful login/registration.
 *
 * Destination priority:
 *  1. Explicit `?redirect=` query param (route guard, cross-link from the
 *     other auth page) — validated by `safeRedirectPath` before use.
 *  2. `fallback` — the caller's role-aware default landing (header Sign In).
 *
 * The saved return point supplies the scroll offset only: when the final
 * destination equals the saved path (the page + position the visitor left
 * when an access-denied flow sent them to auth), the scroll is restored.
 * The return point is consumed (cleared) exactly once.
 *
 * Use `replace` when completing a navigation that should not remain in the
 * history stack (e.g. redirecting an already-signed-in visitor away from
 * /login), `push` after an actual sign-in/sign-up submit.
 */
export function finishAuthNavigation(
  router: AuthRouter,
  opts: { redirectParam: string | null; fallback: string },
  method: "push" | "replace" = "push"
): void {
  const returnPoint = getReturnPoint();
  const destination =
    opts.redirectParam !== null ? safeRedirectPath(opts.redirectParam) : opts.fallback;

  router[method](destination);
  router.refresh();
  if (returnPoint && returnPoint.path === destination && returnPoint.scrollY > 0) {
    restoreScrollPosition(returnPoint.scrollY);
  }
}

/**
 * Build a login URL that carries the current page as `?redirect=` and saves
 * the scroll position, so successful sign-in returns the visitor to exactly
 * where they were. Use for every programmatic push/replace to /login:
 *
 *   router.push(buildLoginHref());
 *   router.replace(buildLoginHref());
 *
 * NOTE: saving the scroll position is a side effect — only call this from
 * event handlers or effects, never during render (e.g. not in a `<Link href>`).
 * For `<Link>`-based auth entry points, use `href="/login?redirect=…"` with
 * `onClick={() => saveReturnPoint(window.scrollY)}` instead.
 */
export function buildLoginHref(): string {
  if (typeof window === "undefined") return "/login";
  saveReturnPoint(window.scrollY);
  return `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

/**
 * Role-aware default landing page used when authentication completes without an
 * explicit `?redirect=` (e.g. the visitor clicked "Sign In" in the header).
 * Staff land in the operations area; everyone else in the workspace dashboard,
 * which itself renders role-specific widgets.
 */
export function roleBasedLandingPath(user: unknown): string {
  const role = getUserRole(user);
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "MODERATOR") {
    return "/admin";
  }
  return "/dashboard";
}
