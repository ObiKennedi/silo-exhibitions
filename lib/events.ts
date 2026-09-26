import { PastEvent } from "@/types/event";

export interface PastEventsPage {
    events: PastEvent[];
    hasMore: boolean;
    total: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();

export const PLACEHOLDER_EVENTS: PastEvent[] = [
    {
        id: "evt_1",
        slug: "owerri-tradefair-2025",
        title: "Owerri Campus Tradefair",
        location: "Main Campus Arena, Owerri",
        date: "2025-11-15",
        coverImage: "/events/owerri-2025/cover.jpg",
        media: [
            { id: "m1", type: "image", url: "/events/owerri-2025/1.jpg" },
            { id: "m2", type: "image", url: "/events/owerri-2025/2.jpg" },
            { id: "m3", type: "image", url: "/events/owerri-2025/cover.jpg" },
        ],
    },
    {
        id: "evt_2",
        slug: "uyo-food-fest-2025",
        title: "Uyo Food & Lifestyle Expo",
        location: "Students' Union Square, Uyo",
        date: "2025-08-02",
        coverImage: "/events/uyo-2025/cover.jpg",
        media: [
            { id: "m1", type: "image", url: "/events/uyo-2025/1.jpg" },
            { id: "m2", type: "image", url: "/events/uyo-2025/2.jpg" },
            { id: "m3", type: "image", url: "/events/uyo-2025/cover.jpg" },
        ],
    },
    {
        id: "evt_3",
        slug: "enugu-tech-tradefair-2025",
        title: "Enugu Campus Tradefair",
        location: "Convocation Grounds, Enugu",
        date: "2025-06-20",
        coverImage: "/events/enugu-2025/cover.jpg",
        media: [
            { id: "m1", type: "image", url: "/events/enugu-2025/1.jpg" },
            { id: "m2", type: "image", url: "/events/enugu-2025/2.jpg" },
            { id: "m3", type: "image", url: "/events/enugu-2025/cover.jpg" },
        ],
    },
];

/**
 * Pulls one page of past events, each with its uploaded gallery media.
 * Supports pagination and falls back to PLACEHOLDER_EVENTS if API_BASE is unset.
 */
export async function getPastEventsPage(page = 1, limit = 12): Promise<PastEventsPage> {
    if (API_BASE && (API_BASE.startsWith("http://") || API_BASE.startsWith("https://"))) {
        try {
            const res = await fetch(`${API_BASE}/api/events/past?page=${page}&limit=${limit}`, {
                next: { revalidate: 60 },
            });

            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const start = (page - 1) * limit;
                    return {
                        events: data.slice(start, start + limit),
                        hasMore: start + limit < data.length,
                        total: data.length,
                    };
                }
                return data as PastEventsPage;
            }
        } catch (err) {
            console.error("getPastEventsPage fetch error:", err);
        }
    }

    const total = PLACEHOLDER_EVENTS.length;
    const start = (page - 1) * limit;
    const events = PLACEHOLDER_EVENTS.slice(start, start + limit);
    const hasMore = start + limit < total;

    return {
        events,
        hasMore,
        total,
    };
}

/** Used by the homepage strip, which just wants the first N events flat. */
export async function getPastEvents(limit = 6): Promise<PastEvent[]> {
    const { events } = await getPastEventsPage(1, limit);
    return events;
}

/** Single event, used if a past event ever gets its own share-able page. */
export async function getPastEventBySlug(slug: string): Promise<PastEvent | null> {
    if (API_BASE && (API_BASE.startsWith("http://") || API_BASE.startsWith("https://"))) {
        try {
            const res = await fetch(`${API_BASE}/api/events/past/${slug}`, {
                next: { revalidate: 60 },
            });

            if (res.ok) {
                return (await res.json()) as PastEvent;
            }
        } catch (err) {
            console.error("getPastEventBySlug fetch error:", err);
        }
    }

    return PLACEHOLDER_EVENTS.find((e) => e.slug === slug) ?? null;
}