import "dotenv/config";
import { prisma } from "./lib/prisma";
import { getUserVendorRegistrations, getUserVolunteerApplications } from "./lib/vendor-registrations";
import { getUpcomingEventsPage } from "./lib/upcoming-events";

async function test() {
  console.log("=== Testing Data Retrieval for User Dashboard ===");
  const user = await prisma.user.findFirst();
  console.log("User found:", user?.email, user?.name);

  if (user) {
    const regs = await getUserVendorRegistrations(user.id, user.email);
    console.log("Vendor registrations count:", regs.length);
    if (regs.length > 0) {
      console.log("Sample registration:", {
        bookingCode: regs[0].bookingCode,
        businessName: regs[0].businessName,
        stallTitle: regs[0].stallTitle,
        dueNow: regs[0].dueNow,
        paymentStatus: regs[0].paymentStatus,
        eventTitle: regs[0].event?.title,
      });
    }

    const vols = await getUserVolunteerApplications(user.id, user.email);
    console.log("Volunteer applications count:", vols.length);
  }

  const upcoming = await getUpcomingEventsPage(1, 10);
  console.log("Upcoming events count:", upcoming.events.length);
  upcoming.events.forEach((e) => {
    console.log(`- ${e.title} (${e.status}) @ ${e.venue}`);
  });

  console.log("=== All User Dashboard Data Queries Passed Successfully! ===");
}

test().catch(console.error).finally(() => process.exit(0));
