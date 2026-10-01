// src/lib/nav/user-nav.ts
// User dashboard navigation. Client-safe.

export type UserIconKey =
  | "home"
  | "bookings"
  | "payments"
  | "events"
  | "volunteering"
  | "waitlists"
  | "account"
  | "help";

export type UserNavGroup = "yours" | "take-part" | "support";

export type UserNavItem = {
  id: string;
  label: string;
  /** Shorter label for the mobile tab bar */
  shortLabel?: string;
  href: string;
  icon: UserIconKey;
  group: UserNavGroup;
  exact?: boolean;
  /** Position in the mobile tab bar. Omit = lives in the hamburger menu. */
  tab?: number;
  external?: boolean;
};

export const USER_NAV_GROUP_LABELS: Record<UserNavGroup, string | null> = {
  yours: "Your space",
  "take-part": "Take part",
  support: null, // pinned to the bottom, no heading
};

export const USER_NAV: UserNavItem[] = [
  // Your space
  { id: "home", label: "Home", href: "/home", icon: "home", group: "yours", exact: true, tab: 1 },
  { id: "bookings", label: "Stall bookings", shortLabel: "Bookings", href: "/home?view=bookings", icon: "bookings", group: "yours", tab: 2 },
  { id: "payments", label: "Payments", href: "/home?view=payments", icon: "payments", group: "yours", tab: 4 },

  // Take part
  { id: "events", label: "Upcoming events", shortLabel: "Events", href: "/home?view=upcoming", icon: "events", group: "take-part", tab: 3 },
  { id: "volunteering", label: "Volunteering", href: "/home?view=volunteering", icon: "volunteering", group: "take-part" },
  { id: "waitlists", label: "Waitlists", href: "/home?view=waitlists", icon: "waitlists", group: "take-part" },

  // Support
  { id: "account", label: "Account settings", href: "/home?view=account", icon: "account", group: "support" },
  {
    id: "help",
    label: "Help on WhatsApp",
    href: "https://wa.me/2349063508366",
    icon: "help",
    group: "support",
    external: true,
  },
];

export function isActive(pathname: string, item: UserNavItem, searchView?: string | null): boolean {
  if (item.external) return false;
  if (searchView) {
    if (item.href.includes(`view=${searchView}`)) return true;
    if (item.id === "home" && (!searchView || searchView === "overview")) return true;
    return false;
  }
  const itemPath = item.href.split("?")[0];
  if (item.exact) return pathname === itemPath;
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function groupUserNav(items: UserNavItem[]) {
  return (Object.keys(USER_NAV_GROUP_LABELS) as UserNavGroup[])
    .map((group) => ({
      group,
      label: USER_NAV_GROUP_LABELS[group],
      items: items.filter((i) => i.group === group),
    }))
    .filter((g) => g.items.length > 0);
}

export const USER_TABS = USER_NAV.filter((i) => i.tab !== undefined).sort((a, b) => a.tab! - b.tab!);
export const USER_MENU = USER_NAV.filter((i) => i.tab === undefined);