// src/components/user-dashboard/icons.ts
import type { ComponentType } from "react";
import { CalendarDays, HandHeart, Hourglass, House, Settings, Store, Wallet } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { UserIconKey } from "@/lib/nav/user-nav";

export type NavIcon = ComponentType<{
  size?: number | string;
  className?: string;
  "aria-hidden"?: boolean;
}>;

export const USER_ICONS: Record<UserIconKey, NavIcon> = {
  home: House,
  bookings: Store,
  payments: Wallet,
  events: CalendarDays,
  volunteering: HandHeart,
  waitlists: Hourglass,
  account: Settings,
  help: FaWhatsapp,
};