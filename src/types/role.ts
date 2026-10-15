/**
 * Application User Roles (Single Source of Truth)
 * Mirrors the backend Prisma schema and Better-Auth definitions.
 *
 * Membership model
 * ----------------
 * `MEMBER` is a subscription-backed role layered ON TOP of a user's base role.
 * A subscribed customer stays `CUSTOMER` on the server and additionally counts
 * as MEMBER for the paid marketplace actions (posting a job, taking a job).
 * Use the helpers in `@/lib/access-control` — never test `role === MEMBER`
 * alone — so membership is derived from both the role and the subscription.
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  VENDOR = "VENDOR",
  MEMBER = "MEMBER",
  CUSTOMER = "CUSTOMER",
}

/**
 * Union type representing all valid role values (supports both UPPERCASE and lowercase variants).
 */
export type Role =
  | `${UserRole}`
  | "super_admin"
  | "admin"
  | "moderator"
  | "vendor"
  | "member"
  | "customer";

/**
 * Constant list of all roles in array format for validation and iteration.
 */
export const USER_ROLES: readonly UserRole[] = Object.freeze(
  Object.values(UserRole)
);

/**
 * Default role assigned to standard signups / registrations.
 */
export const DEFAULT_ROLE: UserRole = UserRole.CUSTOMER;

/**
 * Numerical hierarchy levels for Role-Based Access Control (RBAC).
 * Higher numerical value represents higher operational privilege.
 *
 * MEMBER (30) sits between CUSTOMER (20) and VENDOR (40): subscribing widens what
 * a user may do on the marketplace without granting unvetted vendor authority.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MODERATOR]: 60,
  [UserRole.VENDOR]: 40,
  [UserRole.MEMBER]: 30,
  [UserRole.CUSTOMER]: 20,
} as const;

/**
 * Human-readable display labels for UI presentation, badges, and dropdowns.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "Administrator",
  [UserRole.MODERATOR]: "Moderator",
  [UserRole.VENDOR]: "Vendor",
  [UserRole.MEMBER]: "Member",
  [UserRole.CUSTOMER]: "Customer",
} as const;

/**
 * Roles that are never gated by a paid membership: platform staff must always be
 * able to operate and moderate the marketplace.
 */
export const MEMBERSHIP_EXEMPT_ROLES: readonly UserRole[] = Object.freeze([
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.MODERATOR,
]);

/**
 * Normalizes an arbitrary role string (handles uppercase, lowercase, spaces) to a canonical UserRole enum value.
 */
export function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;
  const upper = role.trim().toUpperCase();
  if (Object.values(UserRole).includes(upper as UserRole)) {
    return upper as UserRole;
  }
  return null;
}

/**
 * Type guard to check if an arbitrary value is a valid UserRole.
 */
export function isValidRole(value: unknown): value is UserRole {
  return normalizeRole(value) !== null;
}
