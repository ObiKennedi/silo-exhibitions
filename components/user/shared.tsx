"use client";
// src/components/user-dashboard/shared.tsx
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { UserNavItem } from "@/lib/nav/user-nav";
import { USER_ICONS } from "./icons";

export type DashboardUser = {
  name: string;
  email: string;
  image: string | null;
};

export function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: UserNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = USER_ICONS[item.icon];
  const cls = `ud-navlink${active ? " ud-navlink--active" : ""}`;
  const content = (
    <>
      <Icon size={20} aria-hidden className="ud-navlink__icon" />
      <span className="ud-navlink__label">{item.label}</span>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} className={cls} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={cls} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      {content}
    </Link>
  );
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join("") || "?"
  );
}

export function Avatar({ user, size = 36 }: { user: DashboardUser; size?: number }) {
  return user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="ud-avatar"
      src={user.image}
      alt=""
      width={size}
      height={size}
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="ud-avatar ud-avatar--initials" style={{ width: size, height: size }} aria-hidden>
      {initials(user.name)}
    </span>
  );
}

export function UserBadge({ user }: { user: DashboardUser }) {
  return (
    <div className="ud-user">
      <Avatar user={user} />
      <span className="ud-user__text">
        <span className="ud-user__name">{user.name}</span>
        <span className="ud-user__email">{user.email}</span>
      </span>
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <button type="button" className="ud-navlink ud-navlink--quiet" onClick={handleSignOut} disabled={pending}>
      <LogOut size={20} aria-hidden className="ud-navlink__icon" />
      <span className="ud-navlink__label">{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}