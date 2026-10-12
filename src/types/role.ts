/**
 * Application User Roles (Single Source of Truth)
 * Matches backend Prisma schema and auth definitions.
 */

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  VENDOR = "VENDOR",
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
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 80,
  [UserRole.MODERATOR]: 60,
  [UserRole.VENDOR]: 40,
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
  [UserRole.CUSTOMER]: "Customer",
} as const;

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
