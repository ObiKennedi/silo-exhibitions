// src/lib/session.ts (server only)
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/home");
  if (session.user.banned) redirect("/");
  return session;
}

export async function requireStaff() {
  const session = await getSession();
  if (!session) redirect("/staff/sign-in");
  if (session.user.banned || !isStaff(session.user.role)) redirect("/");
  return session;
}