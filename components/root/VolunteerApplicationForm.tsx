"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    CheckCircle2,
    Loader2,
    Printer,
    Camera,
    Truck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import { UpcomingEvent } from "@/types/upcoming-event";
import "@/styles/root/VolunteerApplication.scss";

interface Props {
    event: UpcomingEvent;
}

// The ONLY two volunteer teams
export const VOLUNTEER_TEAMS = [
    {
        id: "content-publicity",
        title: "Content and publicity team",
        icon: Camera,
        desc: "Capture photos and videos, handle social media coverage, interview exhibitors, create TikTok/Reels, and broadcast live tradefair moments.",
    },
    {
        id: "venue-logistics",
        title: "Venue management and logistics team",
        icon: Truck,
        desc: "Coordinate exhibition floor flow, assist stallholders during setup, manage guest accreditation and passes, and ensure smooth on-ground logistics.",
    },
];

export const VolunteerApplicationForm = ({ event }: Props) => {
    // Selected team (the only two teams)
    const [selectedTeam, setSelectedTeam] = useState(VOLUNTEER_TEAMS[0].title);

    // Form fields: name, email, and phone number
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Submission states
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<{
        volunteerId: string;
        fullName: string;
        role: string;
        groupChatUrl: string;
    } | null>(null);

    const isFormValid =
        fullName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(email) &&
        phone.trim().length >= 7;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || loading) return;

        setLoading(true);
        const volunteerId = `SILO-VOL-${Math.floor(1000 + Math.random() * 9000)}`;
        const fallbackGroupUrl = event.whatsappUrl || "https://wa.me/2349063508366";
        let targetGroupUrl = fallbackGroupUrl;

        try {
            const res = await fetch(`/api/events/${event.slug}/volunteer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    volunteerId,
                    eventSlug: event.slug,
                    fullName: fullName.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    primaryRole: selectedTeam,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.groupChatUrl) {
                    targetGroupUrl = data.groupChatUrl;
                }
            }
        } catch (err) {
            console.error("Volunteer submission error:", err);
        } finally {
            setLoading(false);
            setSuccessData({
                volunteerId,
                fullName: fullName.trim(),
                role: selectedTeam,
                groupChatUrl: targetGroupUrl,
            });

            // Immediately redirect user to the volunteer group chat
            window.location.href = targetGroupUrl;
        }
    };

    if (successData) {
        return (
            <main className="volunteer-page">
                <div className="volunteer-success">
                    <div className="volunteer-success__icon">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="volunteer-success__title">Application Received!</h1>
                    <p className="volunteer-success__sub">
                        Welcome to the crew, <b>{successData.fullName}</b>! Your volunteer badge for{" "}
                        <b>{event.title}</b> has been generated and you are being added to the official volunteer group chat.
                    </p>

                    <div className="volunteer-success__card">
                        <div className="volunteer-success__row">
                            <span>Volunteer Crew ID</span>
                            <b className="volunteer-success__badge">{successData.volunteerId}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>Assigned Team</span>
                            <b>{successData.role}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>Venue</span>
                            <b>{event.venue}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>Dates</span>
                            <b>
                                {new Date(event.startDate).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                })}{" "}
                                –{" "}
                                {new Date(event.endDate).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </b>
                        </div>
                    </div>

                    <a
                        href={successData.groupChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="volunteer-success__whatsapp-cta"
                        id="volunteer-join-group-chat-cta"
                    >
                        <FaWhatsapp size={20} /> Join Volunteer WhatsApp Group Chat
                    </a>
                    <p style={{ fontSize: "12.5px", color: "var(--muted, #5b6485)", margin: "-4px 0 24px" }}>
                        If WhatsApp did not open automatically, tap the button above to join now.
                    </p>

                    <div className="volunteer-success__actions">
                        <button
                            type="button"
                            className="event-page__link-btn"
                            onClick={() => window.print()}
                        >
                            <Printer size={16} /> Print Confirmation
                        </button>
                        <Link
                            href={`/${event.slug}`}
                            className="upcoming-events__see-more"
                        >
                            Back to Exhibition Page
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="volunteer-page">
            <header className="volunteer-hero">
                <Link href={`/${event.slug}`} className="volunteer-hero__back">
                    <ArrowLeft size={16} /> Back to {event.title}
                </Link>
                <p className="volunteer-hero__kicker">Join The Crew.</p>
                <h1 className="volunteer-hero__title">
                    Volunteer at <mark>{event.title}</mark>
                </h1>
                <div className="volunteer-hero__meta">
                    <span>
                        <Calendar size={15} />
                        {new Date(event.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} –{" "}
                        {new Date(event.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span>
                        <MapPin size={15} />
                        {event.venue}
                    </span>
                </div>
                <p className="volunteer-hero__sub">
                    Be the heartbeat of the tradefair. Work alongside leading brands, gain
                    hands-on event production experience, and help thousands of attendees and exhibitors have an
                    unforgettable experience.
                </p>
            </header>

            {/* Volunteer Application Form */}
            <form onSubmit={handleSubmit} className="volunteer-section">
                <div className="volunteer-section__head">
                    <h2>Choose Your Volunteer Team</h2>
                    <p>Select which team matches your skills, then enter your name, email, and phone number to be added immediately to the group chat.</p>
                </div>

                {/* The only two teams for volunteers */}
                <div className="role-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: 28 }}>
                    {VOLUNTEER_TEAMS.map((team) => {
                        const isSelected = team.title === selectedTeam;
                        const Icon = team.icon;
                        return (
                            <div
                                key={team.id}
                                className={`role-card ${isSelected ? "is-selected" : ""}`}
                                onClick={() => setSelectedTeam(team.title)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setSelectedTeam(team.title);
                                    }
                                }}
                            >
                                <div className="role-card__head">
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                background: isSelected ? "#0015f8" : "#eaf3ff",
                                                color: isSelected ? "#fff" : "#0015f8",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            <Icon size={16} />
                                        </div>
                                        <h3 className="role-card__title" style={{ margin: 0 }}>
                                            {team.title}
                                        </h3>
                                    </div>
                                    <div className="role-card__radio" />
                                </div>
                                <p className="role-card__desc" style={{ marginTop: 6 }}>
                                    {team.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="volunteer-form-grid">
                    <div className="volunteer-field volunteer-form-grid__full">
                        <label htmlFor="vol-name">Full Name *</label>
                        <input
                            id="vol-name"
                            type="text"
                            required
                            placeholder="e.g. Chisom Nwankwo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="volunteer-field">
                        <label htmlFor="vol-email">Email Address *</label>
                        <input
                            id="vol-email"
                            type="email"
                            required
                            placeholder="e.g. chisom@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="volunteer-field">
                        <label htmlFor="vol-phone">WhatsApp / Phone Number *</label>
                        <input
                            id="vol-phone"
                            type="tel"
                            required
                            placeholder="e.g. 08012345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 28 }}>
                    <button
                        type="submit"
                        className="volunteer-submit-btn"
                        disabled={!isFormValid || loading}
                        id="volunteer-submit-btn"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="upcoming-exhibitions__spinner" />
                                Submitting &amp; Joining Group Chat...
                            </>
                        ) : (
                            <>
                                <FaWhatsapp size={19} />
                                Submit &amp; Join Group Chat
                            </>
                        )}
                    </button>
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "12.5px",
                            color: "var(--muted, #5b6485)",
                            marginTop: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                        }}
                    >
                        ⚡ You will be automatically redirected to the volunteer WhatsApp group chat right after submitting.
                    </p>
                </div>
            </form>
        </main>
    );
};
