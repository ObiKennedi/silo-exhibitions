import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
    ArrowLeft,
    Bus,
    CalendarDays,
    MapPin,
    Clock,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import { getUpcomingEventBySlug } from "@/lib/upcoming-events";
import "@/styles/root/VolunteerApplication.scss";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = await getUpcomingEventBySlug(slug);
    if (!event) return {};

    return {
        title: `Book a Ride | ${event.title} | Silo Exhibitions`,
        description: `Scheduled shuttle transit and pickup points for ${event.title} at ${event.venue}. Coming soon.`,
    };
}

const dateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
    return s.toDateString() === e.toDateString()
        ? s.toLocaleDateString("en-GB", opts)
        : `${s.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${e.toLocaleDateString("en-GB", opts)}`;
};

export default async function BookRideComingSoonPage({ params }: Props) {
    const { slug } = await params;
    const event = await getUpcomingEventBySlug(slug);

    if (!event) notFound();

    const whatsappLink = event.whatsappUrl || "https://wa.me/2349063508366";

    return (
        <main className="volunteer-page">
            {/* Top Navigation Back */}
            <div className="volunteer-hero">
                <Link href={`/${event.slug}`} className="volunteer-hero__back">
                    <ArrowLeft size={16} /> Back to {event.title}
                </Link>
                <p className="volunteer-hero__kicker">Silo Transit &amp; Logistics ~</p>
                <h1 className="volunteer-hero__title">
                    Campus &amp; City <mark>Shuttle Service</mark>
                </h1>

                <div className="volunteer-hero__meta">
                    <span>
                        <CalendarDays size={16} />
                        {dateRange(event.startDate, event.endDate)}
                    </span>
                    <span>
                        <MapPin size={16} />
                        {event.venue}
                    </span>
                </div>
            </div>

            {/* Coming Soon Card */}
            <div
                style={{
                    background: "#ffffff",
                    border: "1.5px solid #dce6f5",
                    borderRadius: "24px",
                    padding: "44px 32px",
                    boxShadow: "0 10px 30px rgba(10, 15, 46, 0.05)",
                    textAlign: "center",
                    maxWidth: "760px",
                    margin: "0 auto",
                }}
            >
                {/* Badge & Icon */}
                <div
                    style={{
                        width: "68px",
                        height: "68px",
                        borderRadius: "20px",
                        background: "#eff6ff",
                        color: "#0015f8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 6px 18px rgba(0, 21, 248, 0.15)",
                    }}
                >
                    <Bus size={34} />
                </div>

                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#e0e7ff",
                        color: "#3730a3",
                        fontSize: "12px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "5px 14px",
                        borderRadius: "999px",
                        marginBottom: "16px",
                    }}
                >
                    <Sparkles size={14} /> Coming Soon
                </span>

                <h2
                    style={{
                        fontFamily: "var(--font-display, 'Anton', sans-serif)",
                        fontSize: "clamp(26px, 4vw, 36px)",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        color: "#0a0f2e",
                        margin: "0 0 12px",
                    }}
                >
                    Ride Booking Will Open Soon
                </h2>

                <p
                    style={{
                        fontSize: "15px",
                        lineHeight: 1.7,
                        color: "#5b6485",
                        maxWidth: "600px",
                        margin: "0 auto 28px",
                    }}
                >
                    Online seat reservations, student campus shuttles, and central city pickup passes
                    for <strong>{event.title}</strong> will be opened closer to the event dates.
                    Stay tuned or connect with us on WhatsApp to be the first to know when booking launches!
                </p>

                {/* Key Benefits Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "14px",
                        textAlign: "left",
                        background: "#f8fbff",
                        border: "1.5px dashed #bfdbfe",
                        borderRadius: "16px",
                        padding: "20px",
                        marginBottom: "32px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <CheckCircle2 size={18} color="#0015f8" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                            <strong style={{ fontSize: "13.5px", color: "#0a0f2e", display: "block" }}>
                                Designated Pickup Hubs
                            </strong>
                            <small style={{ fontSize: "12px", color: "#64748b" }}>
                                Safe, convenient boarding points across key campus and town spots.
                            </small>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <Clock size={18} color="#0015f8" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                            <strong style={{ fontSize: "13.5px", color: "#0a0f2e", display: "block" }}>
                                Scheduled Departures
                            </strong>
                            <small style={{ fontSize: "12px", color: "#64748b" }}>
                                Timed runs synchronized with daily gate opening and closing sessions.
                            </small>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <ShieldCheck size={18} color="#0015f8" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                            <strong style={{ fontSize: "13.5px", color: "#0a0f2e", display: "block" }}>
                                Verified Transit
                            </strong>
                            <small style={{ fontSize: "12px", color: "#64748b" }}>
                                Official Silo accredited drivers and comfortable buses.
                            </small>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "14px",
                        flexWrap: "wrap",
                    }}
                >
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="volunteer-success__whatsapp-cta"
                        style={{ margin: 0 }}
                    >
                        <FaWhatsapp size={18} />
                        <span>Get Notified on WhatsApp</span>
                    </a>

                    <Link
                        href={`/${event.slug}`}
                        className="event-page__link-btn"
                        style={{
                            background: "#ffffff",
                            color: "var(--ink, #0a0f2e)",
                            border: "1.5px solid #cbd5e1",
                        }}
                    >
                        Return to Exhibition
                    </Link>

                    {event.vendorCall.enabled && (
                        <Link
                            href={event.vendorCall.applyUrl}
                            className="event-page__link-btn"
                        >
                            Become a Vendor
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
