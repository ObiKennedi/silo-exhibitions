import "dotenv/config";
import { prisma } from "../lib/prisma";

async function seed() {
  console.log("Checking existing events...");
  const count = await prisma.event.count();
  if (count > 0) {
    console.log(`Already have ${count} events. Skipping event seed.`);
  } else {
    console.log("Seeding sample upcoming tradefairs...");

    const event1 = await prisma.event.create({
      data: {
        slug: "futo",
        title: "Silo Tradefair 2026 — FUTO Edition",
        tagline: "The Biggest Commercial & Entrepreneur Exhibition in Eastern Nigeria",
        venue: "FUTO International Convention Arena",
        location: "Owerri, Imo State",
        startDate: new Date("2026-11-12T09:00:00Z"),
        endDate: new Date("2026-11-15T18:00:00Z"),
        status: "PUBLISHED",
        registrationStatus: "REGISTRATION_OPEN",
        isFeatured: true,
        coverImageUrl: "/hero/hero1.jpeg",
        flierUrl: "/events/silo-campus-tradefair-2026/flier.jpg",
        writeUp:
          "Silo Tradefair brings together over 120 brands, tech startups, artisans, and food vendors for 4 days of explosive commerce and networking.",
        cashlessPolicy: "All stalls are equipped with Silo instant QR cashless paypoints for seamless tradefair sales.",
        whatsappUrl: "https://wa.me/2349063508366",
        vendorCallEnabled: true,
        vendorCallDescription:
          "Book your booth now! Choose between Standard Booth, Prime Corner, or Food Hub.",
        volunteerCallEnabled: true,
        volunteerCallDescription: "Join our Content & Publicity team or Venue Management & Logistics team.",
        rideBookingEnabled: true,
        exhibitionPlanSummary: "Indoor main pavilion with 80 stalls and outdoor food village with 40 stalls.",
        pickupPoints: {
          create: [
            { name: "FUTO Main Gate", time: "8:00 AM, 10:00 AM, 1:00 PM", order: 1 },
            { name: "Ihiagwa Junction", time: "8:30 AM, 10:30 AM, 1:30 PM", order: 2 },
            { name: "Eziobodo Market", time: "9:00 AM, 11:00 AM, 2:00 PM", order: 3 },
          ],
        },
        sponsors: {
          create: [
            { name: "Monnify", tier: "Headline", order: 1 },
            { name: "FUTO Student Union", tier: "Gold", order: 2 },
          ],
        },
      },
    });

    const event2 = await prisma.event.create({
      data: {
        slug: "unilag",
        title: "Silo Trade Expo — UNILAG",
        tagline: "Lagos Innovation & Lifestyle Trade Fair",
        venue: "Multipurpose Hall, University of Lagos",
        location: "Akoka, Lagos State",
        startDate: new Date("2026-12-04T09:00:00Z"),
        endDate: new Date("2026-12-07T18:00:00Z"),
        status: "PUBLISHED",
        registrationStatus: "REGISTRATION_OPEN",
        isFeatured: true,
        coverImageUrl: "/hero/hero2.jpeg",
        flierUrl: "/hero/hero2.jpeg",
        writeUp:
          "The flagship Lagos trade exhibition connecting leading consumer brands, makers, fashion designers and fintech innovators.",
        cashlessPolicy: "Strictly cashless event supported by digital payment partners.",
        whatsappUrl: "https://wa.me/2349063508366",
        vendorCallEnabled: true,
        volunteerCallEnabled: true,
        rideBookingEnabled: false,
      },
    });

    const event3 = await prisma.event.create({
      data: {
        slug: "unn",
        title: "Silo Tradefair — UNN Lions Arena",
        tagline: "Enugu Commerce & Innovation Festival",
        venue: "Princess Alexandria Auditorium, University of Nigeria",
        location: "Nsukka, Enugu State",
        startDate: new Date("2027-02-18T09:00:00Z"),
        endDate: new Date("2027-02-21T18:00:00Z"),
        status: "PUBLISHED",
        registrationStatus: "COMING_SOON",
        isFeatured: false,
        coverImageUrl: "/hero/hero3.jpeg",
        flierUrl: "/hero/hero3.jpeg",
        writeUp: "4-day immersive marketplace, live product demos, and youth entrepreneur showcase.",
        vendorCallEnabled: true,
        volunteerCallEnabled: false,
      },
    });

    console.log("Successfully seeded 3 events:", event1.slug, event2.slug, event3.slug);
  }

  // Also check if any users exist to associate a sample vendor application with if they want
  const users = await prisma.user.findMany({ take: 5 });
  console.log(`Found ${users.length} users in database:`, users.map((u) => ({ id: u.id, email: u.email, name: u.name })));

  if (users.length > 0) {
    const primaryUser = users[0];
    const existingApps = await prisma.vendorApplication.count({
      where: {
        OR: [{ userId: primaryUser.id }, { email: primaryUser.email }],
      },
    });

    if (existingApps === 0) {
      console.log("Creating a sample vendor application for test user...");
      const event = await prisma.event.findFirst({
        where: { slug: "futo" },
      });

      await prisma.vendorApplication.create({
        data: {
          bookingCode: "SILO-VND-8492",
          eventSlug: "futo",
          eventId: event?.id,
          userId: primaryUser.id,
          businessName: "Kicks & Fits",
          category: "Fashion & Footwear",
          contactName: primaryUser.name,
          email: primaryUser.email,
          phone: "+234 812 345 6789",
          instagram: "@kicksandfits_ng",
          description: "Premium sneakers, streetwear, and vintage varsity jackets tailored for urban fashion enthusiasts.",
          powerNeeds: "Standard power outlet for display lighting",
          stallId: "corner",
          stallTitle: "Prime Corner Stall (3m × 3m)",
          planId: "full",
          planName: "Full Upfront Payment",
          dueNow: 55000,
          paymentStatus: "SUCCESS",
          paymentReference: "MNFY_REF_99847123",
          transactionId: "TXN_7741294812",
          paidAmount: 55000,
          channel: "CARD",
          paidAt: new Date(),
        },
      });
      console.log("Sample vendor application created successfully!");
    }
  }
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
