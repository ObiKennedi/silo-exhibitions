import { prisma } from "@/lib/prisma";
import { UpcomingEvent, UpcomingEventStatus } from "@/types/upcoming-event";

export interface UpcomingEventsPage {
    events: UpcomingEvent[];
    hasMore: boolean;
    total: number;
}

/**
 * Maps a Prisma Event record (with relations) to the UpcomingEvent frontend interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPrismaToUpcomingEvent(event: any): UpcomingEvent {
    const statusMap: Record<string, UpcomingEventStatus> = {
        REGISTRATION_OPEN: "Registration open",
        COMING_SOON: "Coming soon",
        SOLD_OUT: "Sold out",
        CLOSED: "Sold out",
    };

    const startDateStr =
        event.startDate instanceof Date
            ? event.startDate.toISOString().split("T")[0]
            : String(event.startDate || "");

    const endDateStr =
        event.endDate instanceof Date
            ? event.endDate.toISOString().split("T")[0]
            : event.endDate
            ? String(event.endDate)
            : startDateStr;

    return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        venue: event.venue || event.location || "",
        startDate: startDateStr,
        endDate: endDateStr,
        flier: event.flierUrl || event.coverImageUrl || "",
        flierPublicId: event.flierPublicId || undefined,
        coverImageUrl: event.coverImageUrl || undefined,
        coverImagePublicId: event.coverImagePublicId || undefined,
        status: statusMap[event.registrationStatus] || "Registration open",
        writeUp: event.writeUp || "",

        vendorCall: {
            enabled: Boolean(event.vendorCallEnabled),
            description:
                event.vendorCallDescription ||
                "Apply for a stall at this exhibition. Select your booth size and payment plan.",
            applyUrl: `/${event.slug}/apply-vendor`,
        },

        volunteerCall: {
            enabled: Boolean(event.volunteerCallEnabled),
            description:
                event.volunteerCallDescription ||
                "Join our on-ground crew, ushering, logistics and stage team.",
            applyUrl: `/${event.slug}/volunteer`,
        },

        waitlistEnabled: Boolean(event.waitlistEnabled),
        whatsappUrl: event.whatsappUrl || "",

        rideBooking: event.rideBookingEnabled
            ? {
                  enabled: true,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  pickupPoints: (event.pickupPoints || []).map((p: any) => ({
                      id: p.id,
                      name: p.name,
                      time: p.time,
                  })),
                  bookUrl: event.rideBookingUrl || `/${event.slug}/book-ride`,
              }
            : undefined,

        cashlessPolicy: event.cashlessPolicy || undefined,
        importantTerms: event.importantTerms || undefined,

        exhibitionPlan: {
            summary: event.exhibitionPlanSummary || "",
            documentUrl: event.exhibitionPlanDocUrl || undefined,
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sponsors: (event.sponsors || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            tier: s.tier,
            logoUrl: s.logoUrl,
            logoPublicId: s.logoPublicId,
        })),
    };
}

/**
 * Pulls a paginated list of upcoming exhibitions directly from the database.
 * If the database has no records or is unreachable, safely returns empty array.
 */
export async function getUpcomingEventsPage(page = 1, limit = 12): Promise<UpcomingEventsPage> {
    try {
        const skip = Math.max(0, (page - 1) * limit);
        const now = new Date();

        const upcomingWhere = {
            status: "PUBLISHED" as const,
            AND: [
                {
                    // Exclude events manually moved to PAST for galleries
                    OR: [
                        { eventType: null },
                        { eventType: { not: "PAST" as const } },
                    ],
                },
                {
                    // Date is ongoing or future
                    OR: [
                        { endDate: { gte: now } },
                        { endDate: null, startDate: { gte: now } },
                    ],
                },
            ],
        };

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where: upcomingWhere,
                include: {
                    pickupPoints: {
                        orderBy: { order: "asc" },
                    },
                    sponsors: {
                        orderBy: { order: "asc" },
                    },
                },
                orderBy: {
                    startDate: "asc",
                },
                skip,
                take: limit,
            }),
            prisma.event.count({
                where: upcomingWhere,
            }),
        ]);

        return {
            events: events.map(mapPrismaToUpcomingEvent),
            hasMore: skip + events.length < total,
            total,
        };
    } catch (err) {
        console.warn("[getUpcomingEventsPage] Database query returned empty / offline:", err);
        return {
            events: [],
            hasMore: false,
            total: 0,
        };
    }
}

/**
 * Used by the homepage strip, which fetches the first N upcoming exhibitions.
 */
export async function getUpcomingEvents(limit = 3): Promise<UpcomingEvent[]> {
    const { events } = await getUpcomingEventsPage(1, limit);
    return events;
}

/**
 * Looks up a single upcoming exhibition by its URL slug or location directly from the database.
 * Supports exact slugs as well as friendly location shortcuts (e.g. /futo, /owerri, /unilag, /unn).
 * Only returns PUBLISHED events unless includeDrafts is true (e.g. for staff preview).
 */
export async function getUpcomingEventBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
): Promise<UpcomingEvent | null> {
    try {
        const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

        // 1. Direct match by exact slug
        let event = await prisma.event.findFirst({
            where: {
                slug: cleanSlug,
                ...(options?.includeDrafts ? {} : { status: "PUBLISHED" }),
            },
            include: {
                pickupPoints: {
                    orderBy: { order: "asc" },
                },
                sponsors: {
                    orderBy: { order: "asc" },
                },
            },
        });

        // 2. If not found by exact slug, match by location, venue, or title keyword
        if (!event) {
            event = await prisma.event.findFirst({
                where: {
                    OR: [
                        { slug: { equals: cleanSlug, mode: "insensitive" } },
                        { slug: { contains: cleanSlug, mode: "insensitive" } },
                        { location: { contains: cleanSlug, mode: "insensitive" } },
                        { venue: { contains: cleanSlug, mode: "insensitive" } },
                        { title: { contains: cleanSlug, mode: "insensitive" } },
                    ],
                    ...(options?.includeDrafts ? {} : { status: "PUBLISHED" }),
                },
                include: {
                    pickupPoints: {
                        orderBy: { order: "asc" },
                    },
                    sponsors: {
                        orderBy: { order: "asc" },
                    },
                },
                orderBy: {
                    startDate: "asc",
                },
            });
        }

        if (!event) return null;
        return mapPrismaToUpcomingEvent(event);
    } catch (err) {
        console.warn(`[getUpcomingEventBySlug] Unable to load event "${slug}" from database:`, err);
        return null;
    }
}

/**
 * Submits an email to the waitlist for a specific event.
 */
export async function joinWaitlist(slug: string, email: string): Promise<boolean> {
    try {
        const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

        const event = await prisma.event.findFirst({
            where: {
                OR: [
                    { slug: cleanSlug },
                    { slug: { equals: cleanSlug, mode: "insensitive" } },
                    { location: { contains: cleanSlug, mode: "insensitive" } },
                    { venue: { contains: cleanSlug, mode: "insensitive" } },
                ],
                status: "PUBLISHED",
            },
            select: { id: true },
        });

        if (!event) return false;

        await prisma.eventWaitlist.upsert({
            where: {
                eventId_email: {
                    eventId: event.id,
                    email: email.trim().toLowerCase(),
                },
            },
            create: {
                eventId: event.id,
                email: email.trim().toLowerCase(),
            },
            update: {},
        });

        return true;
    } catch (err) {
        console.error("[joinWaitlist] Error recording waitlist entry:", err);
        return false;
    }
}