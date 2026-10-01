import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  event: ["create", "update", "publish", "delete"],
  ticket: ["scan"],
  checkin: ["view"],
  logistics: ["manage"],
} as const;

export const ac = createAccessControl(statement);

export const superAdmin = ac.newRole({
  ...adminAc.statements,
  event: ["create", "update", "publish", "delete"],
  ticket: ["scan"],
  checkin: ["view"],
  logistics: ["manage"],
});

export const eventManager = ac.newRole({
  event: ["create", "update", "publish"],
  checkin: ["view"],
  logistics: ["manage"],
});

export const gateStaff = ac.newRole({
  ticket: ["scan"],
});

export const logisticsLead = ac.newRole({
  checkin: ["view"],
  logistics: ["manage"],
});
export const user = ac.newRole({});

export const roles = {
  super_admin: superAdmin,
  event_manager: eventManager,
  gate_staff: gateStaff,
  logistics_lead: logisticsLead,
  user,
};

export type Role = keyof typeof roles;