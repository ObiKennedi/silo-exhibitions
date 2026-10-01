"use client";
// src/components/user-dashboard/Sidebar.tsx
import Link from "next/link";
import { USER_NAV, groupUserNav, isActive } from "@/lib/nav/user-nav";
import { NavLink, SignOutButton, UserBadge, type DashboardUser } from "./shared";

export function Sidebar({ user, pathname }: { user: DashboardUser; pathname: string }) {
  const groups = groupUserNav(USER_NAV);
  const main = groups.filter((g) => g.group !== "support");
  const support = groups.find((g) => g.group === "support");

  return (
    <aside className="ud-sidebar" aria-label="Dashboard">
      {/* Swap for the Silo logo SVG when you have it */}
      <Link href="/" className="ud-brand" aria-label="Silo Exhibitions home">
        <span className="ud-brand__mark">SILO</span>
        <span className="ud-brand__tagline">building businesses</span>
      </Link>

      <nav className="ud-sidebar__nav" aria-label="Main">
        {main.map((g) => (
          <section key={g.group} aria-labelledby={`ud-sb-${g.group}`}>
            <h2 id={`ud-sb-${g.group}`} className="ud-group-label">
              {g.label}
            </h2>
            <ul className="ud-list">
              {g.items.map((item) => (
                <li key={item.id}>
                  <NavLink item={item} active={isActive(pathname, item)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <div className="ud-sidebar__foot">
        <ul className="ud-list">
          {support?.items.map((item) => (
            <li key={item.id}>
              <NavLink item={item} active={isActive(pathname, item)} />
            </li>
          ))}
          <li>
            <SignOutButton />
          </li>
        </ul>
        <UserBadge user={user} />
      </div>
    </aside>
  );
}