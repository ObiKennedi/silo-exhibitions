import { Metadata } from "next";
import { requireUser } from "@/lib/session";
import {
  getUserVendorRegistrations,
  getUserVolunteerApplications,
} from "@/lib/vendor-registrations";
import { getUpcomingEventsPage } from "@/lib/upcoming-events";
import { UserDashboardView } from "@/components/user/UserDashboardView";
import "@/styles/user/UserHome.scss";

export const metadata: Metadata = {
  title: "Exhibitor Dashboard | Silo Exhibitions",
  description:
    "View and manage your campus tradefair stall registrations, digital exhibitor passes, and upcoming exhibitions.",
};

interface PageProps {
  searchParams?: Promise<{ view?: string }>;
}

export default async function UserHomePage(props: PageProps) {
  const { user } = await requireUser();
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const initialView = searchParams?.view;

  // Concurrently fetch user's registrations, volunteer applications, and upcoming tradefairs
  const [registrations, volunteerApplications, upcomingResult] = await Promise.all([
    getUserVendorRegistrations(user.id, user.email),
    getUserVolunteerApplications(user.id, user.email),
    getUpcomingEventsPage(1, 50),
  ]);

  return (
    <UserDashboardView
      user={{
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      }}
      registrations={registrations}
      volunteerApplications={volunteerApplications}
      upcomingEvents={upcomingResult.events}
      initialView={initialView}
    />
  );
}
