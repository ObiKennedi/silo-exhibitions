"use client";
// src/components/user-dashboard/UserShell.tsx
import { useCallback, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { USER_NAV, isActive } from "@/lib/nav/user-nav";
import { Sidebar } from "./Sidebar";
import { FootNav, MobileTopBar } from "./MobileNav";
import { MenuDrawer } from "./MenuDrawer";
import type { DashboardUser } from "./shared";

export function UserShell({ user, children }: { user: DashboardUser; children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const current = USER_NAV.find((i) => isActive(pathname, i));

  return (
    <div className="ud-shell">
      <a href="#ud-main" className="ud-skip">
        Skip to content
      </a>

      <Sidebar user={user} pathname={pathname} />

      <MobileTopBar title={current?.label ?? "Dashboard"} menuOpen={menuOpen} onOpenMenu={openMenu} />

      <main id="ud-main" className="ud-shell__main" tabIndex={-1}>
        {children}
      </main>

      <FootNav pathname={pathname} />

      <MenuDrawer open={menuOpen} onClose={closeMenu} user={user} pathname={pathname} />
    </div>
  );
}