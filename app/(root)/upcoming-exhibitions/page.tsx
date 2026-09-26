import { Metadata } from "next";
import { getUpcomingEventsPage } from "@/lib/upcoming-events";
import { UpcomingEventCard } from "@/components/root/UpcomingEventCard";
import "@/styles/root/UpcomingEvents.scss";

export const metadata: Metadata = {
    title: "Upcoming Exhibitions | Silo Exhibitions",
    description:
        "Discover upcoming tradefairs, exhibitions, vendor calls and dates from Silo Exhibitions.",
};

export default async function UpcomingExhibitionsPage() {
    const { events } = await getUpcomingEventsPage(1, 12);

    return (
        <main className="upcoming-exhibitions-page" style={{ padding: "8rem 2rem 5rem", maxWidth: "1280px", margin: "0 auto" }}>
            <header style={{ marginBottom: "3rem" }}>
                <p style={{ color: "var(--primary, #f97316)", fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    Upcoming Exhibitions.
                </p>
                <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1rem" }}>
                    Don&apos;t miss what&apos;s next.
                </h1>
                <p style={{ color: "var(--muted, #64748b)", maxWidth: "600px", fontSize: "1.05rem" }}>
                    Discover upcoming campus tradefairs, apply for vendor stalls, join waitlists, and reserve your spot.
                </p>
            </header>

            {events.length === 0 ? (
                <p className="upcoming-events__empty">
                    New exhibitions will show up here as soon as they&apos;re announced.
                </p>
            ) : (
                <div className="upcoming-events__grid">
                    {events.map((event) => (
                        <UpcomingEventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </main>
    );
}
