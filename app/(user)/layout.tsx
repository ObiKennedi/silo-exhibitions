// src/app/(user)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/styles/user/Dashboard.scss";
import { requireUser } from "@/lib/session";
import { UserShell } from "@/components/user/UserShell";
import { Suspense } from "react";
import Loader from "@/components/essentials/Loader";

export const metadata: Metadata = {
  title: "Dashboard | Silo Exhibitions",
  robots: { index: false, follow: false },
};

export default async function UserLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();

  return (
    <UserShell user={{ name: user.name, email: user.email, image: user.image ?? null }}>
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </UserShell>
  );
}