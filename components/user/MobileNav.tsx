"use client";
// src/components/user-dashboard/MobileNav.tsx
import Link from "next/link";
import { Menu } from "lucide-react";
import { USER_TABS, isActive } from "@/lib/nav/user-nav";
import { USER_ICONS } from "./icons";

export function MobileTopBar({
  title,
  menuOpen,
  onOpenMenu,
}: {
  title: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
}) {
  return (
    <header className="ud-topbar">
      <Link href="/" className="ud-brand ud-brand--compact" aria-label="Silo Exhibitions home">
        <span className="ud-brand__mark">SILO</span>
      </Link>
      <p className="ud-topbar__title">{title}</p>
      <button
        type="button"
        className="ud-icon-button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="ud-drawer"
      >
        <Menu size={24} aria-hidden />
      </button>
    </header>
  );
}

export function FootNav({ pathname }: { pathname: string }) {
  return (
    <nav className="ud-footnav" aria-label="Primary">
      <ul className="ud-footnav__list">
        {USER_TABS.map((item) => {
          const Icon = USER_ICONS[item.icon];
          const active = isActive(pathname, item);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`ud-footnav__link${active ? " ud-footnav__link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="ud-footnav__icon">
                  <Icon size={22} aria-hidden />
                </span>
                <span className="ud-footnav__label">{item.shortLabel ?? item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}