// src/lib/rbac.ts
// Pure role helpers — safe on server and client.
import { roles, type Role } from "@/lib/permissions";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super admin",
  event_manager: "Event manager",
  gate_staff: "Gate staff",
  logistics_lead: "Logistics lead",
  user: "No role assigned",
};

/** Better Auth stores roles as a string, possibly comma-separated. */
export function parseRoles(field: string | null | undefined): Role[] {
  return (field ?? "user")
    .split(",")
    .map((r) => r.trim())
    .filter((r): r is Role => r in roles);
}

/** True if ANY of the user's roles grants the permission. */
export function roleCan(
  field: string | null | undefined,
  permission: Record<string, string[]>,
): boolean {
  return parseRoles(field).some(
    (r) => roles[r].authorize(permission as never).success,
  );
}

/** Staff = has at least one real role (not just the default "user"). */
export function isStaff(field: string | null | undefined): boolean {
  return parseRoles(field).some((r) => r !== "user");
}

export function roleLabel(field: string | null | undefined): string {
  return parseRoles(field).map((r) => ROLE_LABELS[r]).join(", ");
}