"use client";
// src/components/user-dashboard/MenuDrawer.tsx
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { USER_MENU, groupUserNav, isActive } from "@/lib/nav/user-nav";
import { NavLink, SignOutButton, UserBadge, type DashboardUser } from "./shared";

export function MenuDrawer({
  open,
  onClose,
  user,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  user: DashboardUser;
  pathname: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <div className={`ud-drawer${open ? " ud-drawer--open" : ""}`} inert={!open}>
      <div className="ud-drawer__scrim" onClick={onClose} aria-hidden />

      <div id="ud-drawer" className="ud-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="ud-drawer__head">
          <UserBadge user={user} />
          <button ref={closeRef} type="button" className="ud-icon-button" onClick={onClose} aria-label="Close menu">
            <X size={22} aria-hidden />
          </button>
        </div>

        <nav className="ud-drawer__nav" aria-label="More">
          {groupUserNav(USER_MENU).map((g) => (
            <section key={g.group} aria-labelledby={g.label ? `ud-dr-${g.group}` : undefined}>
              {g.label && (
                <h2 id={`ud-dr-${g.group}`} className="ud-group-label">
                  {g.label}
                </h2>
              )}
              <ul className="ud-list">
                {g.items.map((item) => (
                  <li key={item.id}>
                    <NavLink item={item} active={isActive(pathname, item)} onNavigate={onClose} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <div className="ud-drawer__foot">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}