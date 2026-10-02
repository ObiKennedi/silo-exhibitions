import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import {
    CalendarDays,
    MapPin,
    Users,
    Megaphone,
    Bus,
    Wallet,
    FileText,
    Download,
    Layers,
} from "lucide-react";

import { getUpcomingEventBySlug } from "@/lib/upcoming-events";
import { WaitlistForm } from "@/components/root/WaitlistForm";
import { WhatsAppButton } from "@/components/root/WhatsAppButton";
import { EventCountdown } from "@/components/root/EventCountdown";

import "@/styles/root/EventMicroPage.scss";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
    params: Promise<{ slug: string }>;
}

const RESERVED_SLUGS = new Set([
    "api",
    "admin",
    "dashboard",
    "home",
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "verify-otp",
    "upcoming-exhibitions",
    "past-exhibitions",
    "privacy",
    "terms",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    if (RESERVED_SLUGS.has(slug.toLowerCase())) return {};

    const event = await getUpcomingEventBySlug(slug);
    if (!event) return {};

    return {
        title: `${event.title} | Silo Exhibitions`,
        description: event.writeUp.slice(0, 150),
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

export default async function EventMicroPage({ params }: Props) {
    const { slug } = await params;

    // Friendly root redirects
    if (slug === "about") redirect("/#about");
    if (slug === "contact") redirect("/#contact");
    if (RESERVED_SLUGS.has(slug.toLowerCase())) notFound();

    const event = await getUpcomingEventBySlug(slug);
    if (!event) notFound();

    return (
        <main className="event-page">
            {/* ---------- Hero ---------- */}
            <section className="event-page__hero">
                <div className="event-page__poster">
                    <Image src={event.flier} alt={`${event.title} flier`} fill sizes="(max-width: 900px) 100vw, 380px" priority />
                </div>

                <div className="event-page__intro">
                    <p className="event-page__kicker">Upcoming Exhibition.</p>
                    <span className="event-page__status">{event.status}</span>
                    <h1 className="event-page__title">{event.title}</h1>

                    <ul className="event-page__meta">
                        <li>
                            <CalendarDays size={16} />
                            {dateRange(event.startDate, event.endDate)}
                        </li>
                        <li>
                            <MapPin size={16} />
                            {event.venue}
                        </li>
                    </ul>

                    <EventCountdown
                        targetDate={event.startDate}
                        title="Countdown to Exhibition"
                    />

                    <div className="event-page__cta">
                        {event.waitlistEnabled && <WaitlistForm slug={event.slug} />}
                        <WhatsAppButton url={event.whatsappUrl} />
                    </div>
                </div>
            </section>

            {/* ---------- Dynamic Cashless policy & Important Terms (uploaded by admin) ---------- */}
            {(event.cashlessPolicy || event.importantTerms) && (
                <div className="event-page__notice">
                    <Wallet size={18} />
                    <div className="event-page__notice-content">
                        {event.cashlessPolicy && <p>{event.cashlessPolicy}</p>}
                        {event.importantTerms && (
                            <div className="event-page__notice-terms">
                                <strong>Important Notice &amp; Terms:</strong>
                                {event.importantTerms.includes("\n") ? (
                                    <ul className="event-page__notice-terms-list">
                                        {event.importantTerms
                                            .split("\n")
                                            .map((t: string) => t.trim())
                                            .filter(Boolean)
                                            .map((term: string, idx: number) => (
                                                <li key={idx}>{term}</li>
                                            ))}
                                    </ul>
                                ) : (
                                    <span> {event.importantTerms}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ---------- Write-up ---------- */}
            <section className="event-page__section">
                <h2>About this exhibition</h2>
                <p className="event-page__writeup">{event.writeUp}</p>
            </section>

            {/* ---------- Get involved: vendors + volunteers ---------- */}
            <section className="event-page__section">
                <h2>Get involved</h2>
                <div className="event-page__cards">
                    {event.vendorCall.enabled && (
                        <div className="event-page__card">
                            <span className="event-page__card-icon">
                                <Megaphone size={20} />
                            </span>
                            <h3>Call for vendors</h3>
                            <p>{event.vendorCall.description}</p>
                            <a className="event-page__link-btn" href={event.vendorCall.applyUrl}>
                                Become a vendor
                            </a>
                        </div>
                    )}

                    {event.volunteerCall.enabled && (
                        <div className="event-page__card">
                            <span className="event-page__card-icon">
                                <Users size={20} />
                            </span>
                            <h3>Call for volunteers</h3>
                            <p>{event.volunteerCall.description}</p>
                            <a className="event-page__link-btn" href={event.volunteerCall.applyUrl}>
                                Become a volunteer
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* ---------- Ride booking (optional) ---------- */}
            {event.rideBooking?.enabled && (
                <section className="event-page__section">
                    <h2>Book a ride to the venue</h2>
                    <div className="event-page__ride">
                        <ul className="event-page__pickups">
                            {event.rideBooking.pickupPoints.map((p) => (
                                <li key={p.id}>
                                    <Bus size={16} />
                                    <div>
                                        <b>{p.name}</b>
                                        <span>{p.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <a className="event-page__link-btn" href={event.rideBooking.bookUrl}>
                            Book a seat
                        </a>
                    </div>
                </section>
            )}

            {/* ---------- Exhibition plan & Stand Plans ---------- */}
            <section className="event-page__section">
                <h2>Exhibition &amp; Stand Plans</h2>
                <div className="event-page__plan">
                    <FileText size={18} />
                    <p>{event.exhibitionPlan.summary || "Official vendor stand allocations, packages, and payment schedules."}</p>
                </div>

                {event.stallsConfig && event.stallsConfig.length > 0 && (
                    <div className="event-page__stalls-grid">
                        {event.stallsConfig.map((stall) => (
                            <div key={stall.id} className="event-page__stall-card">
                                <div className="event-page__stall-card-head">
                                    <strong>{stall.title}</strong>
                                    <span>{stall.size}</span>
                                </div>
                                <div className="event-page__stall-card-price">
                                    ₦{(stall.price || 0).toLocaleString()}
                                </div>
                                <p className="event-page__stall-card-desc">
                                    {stall.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="event-page__downloads">
                    <a
                        href={`/api/events/${event.slug}/terms-pdf`}
                        download
                        className="event-page__pdf-download-btn"
                        title="Download official exhibitor terms & conditions document as PDF"
                    >
                        <Download size={16} />
                        <span>Download Terms &amp; Conditions (PDF)</span>
                    </a>

                    {event.exhibitionPlan.documentUrl && (
                        <a
                            href={event.exhibitionPlan.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-page__pdf-download-btn event-page__pdf-download-btn--secondary"
                            title="Open official stand plan and floor layout document"
                        >
                            <Layers size={16} />
                            <span>Official Stand Plan &amp; Floor Layout (PDF)</span>
                        </a>
                    )}
                </div>
            </section>

            {/* ---------- Sponsors ---------- */}
            {event.sponsors.length > 0 && (
                <section className="event-page__section event-page__section--sponsors">
                    <h2>Meet our sponsors</h2>
                    <ul className="event-page__sponsors">
                        {event.sponsors.map((s) => (
                            <li key={s.id}>
                                <span>{s.name}</span>
                                {s.tier && <small>{s.tier}</small>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <WhatsAppButton url={event.whatsappUrl} variant="floating" />
        </main>
    );
}
