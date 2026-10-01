import { prisma } from "@/lib/prisma";
import { PastEvent } from "@/types/event";

export interface PastEventsPage {
    events: PastEvent[];
    hasMore: boolean;
    total: number;
}

/**
 * Maps a Prisma Event record (with relations) to the PastEvent frontend interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPrismaToPastEvent(event: any): PastEvent {
    const dateStr =
        event.startDate instanceof Date
            ? event.startDate.toISOString().split("T")[0]
            : String(event.startDate || "");

    return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        location: event.location || event.venue || "",
        date: dateStr,
        coverImage: event.coverImageUrl || event.flierUrl || "",
        coverImagePublicId: event.coverImagePublicId || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        media: (event.media || []).map((m: any) => ({
            id: m.id,
            type: (m.type === "VIDEO" || m.type === "video" ? "video" : "image") as "image" | "video",
            url: m.url,
            thumbnail: m.thumbnailUrl || m.url,
            alt: m.alt || event.title,
            cloudinaryPublicId: m.cloudinaryPublicId || undefined,
        })),
    };
}

/**
 * Empty placeholder for backward compatibility.
 */
export const PLACEHOLDER_EVENTS: PastEvent[] = [];

/**
 * Pulls a paginated list of past exhibitions directly from the database.
 * If the database has no records or is unreachable, returns empty array.
 */
export async function getPastEventsPage(page = 1, limit = 12): Promise<PastEventsPage> {
    try {
        const skip = Math.max(0, (page - 1) * limit);
        const now = new Date();

        const pastWhere = {
            status: "PUBLISHED" as const,
            OR: [
                { endDate: { lt: now } },
                { endDate: null, startDate: { lt: now } },
                { eventType: "PAST" as const },
            ],
        };

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where: pastWhere,
                include: {
                    media: {
                        orderBy: { order: "asc" },
                    },
                },
                orderBy: {
                    startDate: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.event.count({
                where: pastWhere,
            }),
        ]);

        return {
            events: events.map(mapPrismaToPastEvent),
            hasMore: skip + events.length < total,
            total,
        };
    } catch (err) {
        console.warn("[getPastEventsPage] Database query returned empty / offline:", err);
        return {
            events: [],
            hasMore: false,
            total: 0,
        };
    }
}

/**
 * Used by the homepage strip, which fetches the first N past exhibitions.
 */
export async function getPastEvents(limit = 6): Promise<PastEvent[]> {
    const { events } = await getPastEventsPage(1, limit);
    return events;
}

/**
 * Looks up a single past exhibition by its URL slug from the database.
 * Only returns PUBLISHED events unless includeDrafts is true (e.g. for staff preview).
 */
export async function getPastEventBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
): Promise<PastEvent | null> {
    try {
        const event = await prisma.event.findFirst({
            where: {
                slug,
                ...(options?.includeDrafts ? {} : { status: "PUBLISHED" }),
            },
            include: {
                media: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!event) return null;
        return mapPrismaToPastEvent(event);
    } catch (err) {
        console.warn(`[getPastEventBySlug] Unable to load event "${slug}" from database:`, err);
        return null;
    }
}