import { UpcomingEvent } from "@/types/upcoming-event";

export interface UpcomingEventsPage {
    events: UpcomingEvent[];
    hasMore: boolean;
    total: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();

export const UPCOMING_EVENTS: UpcomingEvent[] = [
    {
        id: "evt_upcoming_1",
        slug: "silo-campus-tradefair-2026",
        title: "Silo Campus Tradefair 2026",
        venue: "Main Campus Arena, Owerri",
        startDate: "2026-11-14",
        endDate: "2026-11-16",
        flier: "/events/silo-campus-tradefair-2026/flier.jpg",
        status: "Registration open",

        writeUp:
            "Three days of stalls, live stage shows and pitch sessions from campus businesses. " +
            "The Silo Campus Tradefair brings together vetted vendors and thousands of students " +
            "and residents looking for real deals — food, fashion, tech, beauty and more, all in " +
            "one arena. Whether you're coming to shop or to sell, this is where campus business happens.",

        vendorCall: {
            enabled: true,
            description:
                "Stalls are open to any registered business. Reserve your spot, get your vendor code, and meet thousands of buyers over three days.",
            applyUrl: "/upcoming-exhibitions/silo-campus-tradefair-2026/apply-vendor",
        },

        volunteerCall: {
            enabled: true,
            description:
                "Ushers, gate staff and stage crew get a meal, a T-shirt and a certificate of participation.",
            applyUrl: "/upcoming-exhibitions/silo-campus-tradefair-2026/volunteer",
        },

        waitlistEnabled: true,

        whatsappUrl: "https://wa.me/2348000000000",

        rideBooking: {
            enabled: true,
            pickupPoints: [
                { id: "p1", name: "Main Gate", time: "Every 15 mins, 9am–7pm" },
                { id: "p2", name: "Hostel Road", time: "Every 15 mins, 9am–7pm" },
                { id: "p3", name: "Junction Park", time: "Every 30 mins, 9am–7pm" },
            ],
            bookUrl: "/upcoming-exhibitions/silo-campus-tradefair-2026/book-ride",
        },

        cashlessPolicy:
            "This is a cashless event. All stalls accept transfers and card payments only — please come prepared to pay digitally.",

        exhibitionPlan: {
            summary:
                "Stalls are allocated on a first-come basis by size and category. Vendors are expected to arrive by 8:30am for gate checks and keep their stall staffed through closing time each day.",
            documentUrl: "/events/silo-campus-tradefair-2026/exhibition-plan.pdf",
        },

        sponsors: [
            { id: "s1", name: "Aethelon Trades", tier: "Headline" },
            { id: "s2", name: "Navy & Orange Investments", tier: "Gold" },
            { id: "s3", name: "Slasham", tier: "Gold" },
            { id: "s4", name: "Campus Kicks", tier: "Silver" },
        ],
    },
];

/**
 * Pulls one page of upcoming events.
 * Falls back to UPCOMING_EVENTS directly when API_BASE is unset or invalid,
 * preventing server-side relative fetch errors.
 */
export async function getUpcomingEventsPage(page = 1, limit = 12): Promise<UpcomingEventsPage> {
    if (API_BASE && (API_BASE.startsWith("http://") || API_BASE.startsWith("https://"))) {
        try {
            const res = await fetch(`${API_BASE}/api/events/upcoming?page=${page}&limit=${limit}`, {
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
                return data as UpcomingEventsPage;
            }
        } catch (err) {
            console.error("getUpcomingEventsPage fetch error:", err);
        }
    }

    const total = UPCOMING_EVENTS.length;
    const start = (page - 1) * limit;
    const events = UPCOMING_EVENTS.slice(start, start + limit);
    const hasMore = start + limit < total;

    return {
        events,
        hasMore,
        total,
    };
}

/** Used by the homepage strip, which just wants the first N events flat. */
export async function getUpcomingEvents(limit = 3): Promise<UpcomingEvent[]> {
    const { events } = await getUpcomingEventsPage(1, limit);
    return events;
}

/** Single event lookup by slug. */
export async function getUpcomingEventBySlug(slug: string): Promise<UpcomingEvent | null> {
    if (API_BASE && (API_BASE.startsWith("http://") || API_BASE.startsWith("https://"))) {
        try {
            const res = await fetch(`${API_BASE}/api/events/${slug}`, {
                next: { revalidate: 60 },
            });

            if (res.ok) {
                return (await res.json()) as UpcomingEvent;
            }
        } catch (err) {
            console.error("getUpcomingEventBySlug fetch error:", err);
        }
    }

    return UPCOMING_EVENTS.find((e) => e.slug === slug) ?? null;
}

/** Joins the waitlist for a specific event (runs from client). */
export async function joinWaitlist(slug: string, email: string): Promise<boolean> {
    try {
        const base =
            API_BASE && (API_BASE.startsWith("http://") || API_BASE.startsWith("https://"))
                ? API_BASE
                : "";
        const res = await fetch(`${base}/api/events/${slug}/waitlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return res.ok;
    } catch (err) {
        console.error("joinWaitlist:", err);
        return false;
    }
}