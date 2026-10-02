"use client"

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Shirt,
    Utensils,
    Award,
    Sparkles,
    CheckCircle2,
    Loader2,
    Users,
    Printer,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

import { UpcomingEvent } from "@/types/upcoming-event";
import "@/styles/root/VolunteerApplication.scss";

interface Props {
    event: UpcomingEvent;
}

const VOLUNTEER_ROLES = [
    {
        id: "ushering",
        title: "Ushering & Guest Experience",
        desc: "Welcome visitors, VIP guests and guide attendees smoothly through exhibition zones and seats.",
    },
    {
        id: "logistics",
        title: "Vendor Relations & Logistics",
        desc: "Assist stand owners during setup, deliver exhibitor badges, and coordinate loading dock flow.",
    },
    {
        id: "ticketing",
        title: "Gate & Accreditation Crew",
        desc: "Scan QR codes, verify attendee registration passes, and distribute official wristbands.",
    },
    {
        id: "media",
        title: "Media & Social Content Team",
        desc: "Capture photos, record TikTok/Reels, interview stand vendors, and share live event highlights.",
    },
    {
        id: "stage",
        title: "Stage & Sound Coordination",
        desc: "Manage stage cues, assist speakers and performers, and support live pitch contest sessions.",
    },
    {
        id: "safety",
        title: "Crowd Safety & Information Desk",
        desc: "Staff the central help desk, provide directions, manage lost items, and support first-aid crew.",
    },
];

export const VolunteerApplicationForm = ({ event }: Props) => {
    // Role selection
    const [primaryRole, setPrimaryRole] = useState(VOLUNTEER_ROLES[0].title);
    const [secondaryRole, setSecondaryRole] = useState(VOLUNTEER_ROLES[1].title);

    // Form fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [institution, setInstitution] = useState("");
    const [tshirtSize, setTshirtSize] = useState("L");
    const [daysAvailable, setDaysAvailable] = useState<string[]>([
        "Day 1 (Friday)",
        "Day 2 (Saturday)",
        "Day 3 (Sunday)",
    ]);
    const [motivation, setMotivation] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");

    // Terms
    const [conductAccepted, setConductAccepted] = useState(false);

    // Submission states
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<{
        volunteerId: string;
        fullName: string;
        role: string;
    } | null>(null);

    const toggleDay = (day: string) => {
        setDaysAvailable((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const isFormValid =
        fullName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(email) &&
        phone.trim().length >= 10 &&
        daysAvailable.length > 0 &&
        conductAccepted;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        const volunteerId = `SILO-VOL-${Math.floor(1000 + Math.random() * 9000)}`;

        try {
            await fetch(`/api/events/${event.slug}/volunteer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    volunteerId,
                    eventSlug: event.slug,
                    fullName,
                    email,
                    phone,
                    institution,
                    primaryRole,
                    secondaryRole,
                    daysAvailable,
                    tshirtSize,
                    motivation,
                    emergencyContact,
                }),
            });
        } catch (err) {
            console.error("Volunteer submission error:", err);
        } finally {
            setLoading(false);
            setSuccessData({
                volunteerId,
                fullName,
                role: primaryRole,
            });
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
                        <b>{event.title}</b> has been generated.
                    </p>

                    <div className="volunteer-success__card">
                        <div className="volunteer-success__row">
                            <span>Volunteer Crew ID</span>
                            <b className="volunteer-success__badge">{successData.volunteerId}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>Assigned Primary Role</span>
                            <b>{successData.role}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>T-Shirt Size</span>
                            <b>Size {tshirtSize}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>Venue</span>
                            <b>{event.venue}</b>
                        </div>
                        <div className="volunteer-success__row">
                            <span>Mandatory Virtual Briefing</span>
                            <b>Thursday, Nov 12 @ 7:00 PM (Google Meet)</b>
                        </div>
                    </div>

                    <a
                        href={event.whatsappUrl || "https://wa.me/2349063508366"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="volunteer-success__whatsapp-cta"
                    >
                        <FaWhatsapp size={20} /> Join Volunteer WhatsApp Group
                    </a>

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
                    Be the heartbeat of the largest campus tradefair. Work alongside leading brands, gain
                    hands-on event production experience, and help thousands of students and visitors have an
                    unforgettable weekend.
                </p>
            </header>

            {/* Volunteer Perks */}
            <div className="volunteer-perks">
                <div className="volunteer-perks__item">
                    <div className="volunteer-perks__icon">
                        <Shirt size={22} />
                    </div>
                    <h4>Official Crew T-Shirt</h4>
                    <p>Branded Silo crew gear and personalized volunteer access badge.</p>
                </div>
                <div className="volunteer-perks__item">
                    <div className="volunteer-perks__icon">
                        <Utensils size={22} />
                    </div>
                    <h4>Daily Meals &amp; Drinks</h4>
                    <p>Complimentary lunch packs and drinks provided for every shift.</p>
                </div>
                <div className="volunteer-perks__item">
                    <div className="volunteer-perks__icon">
                        <Award size={22} />
                    </div>
                    <h4>Official Certificate</h4>
                    <p>Certificate of Leadership &amp; Service for your CV and LinkedIn.</p>
                </div>
                <div className="volunteer-perks__item">
                    <div className="volunteer-perks__icon">
                        <Sparkles size={22} />
                    </div>
                    <h4>VIP Networking</h4>
                    <p>Direct exposure to over 100+ business founders and sponsors.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* STEP 1: Role Selection */}
                <section className="volunteer-section">
                    <div className="volunteer-section__head">
                        <h2>Step 1: Choose Your Preferred Role</h2>
                        <p>Select the team where your strengths and interests will shine brightest.</p>
                    </div>

                    <div className="role-grid">
                        {VOLUNTEER_ROLES.map((role) => {
                            const isSelected = role.title === primaryRole;
                            return (
                                <div
                                    key={role.id}
                                    className={`role-card ${isSelected ? "is-selected" : ""}`}
                                    onClick={() => setPrimaryRole(role.title)}
                                >
                                    <div className="role-card__head">
                                        <h3 className="role-card__title">{role.title}</h3>
                                        <div className="role-card__radio" />
                                    </div>
                                    <p className="role-card__desc">{role.desc}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="volunteer-field" style={{ maxWidth: "420px" }}>
                        <label htmlFor="sec-role">Secondary Role Choice (Backup)</label>
                        <select
                            id="sec-role"
                            value={secondaryRole}
                            onChange={(e) => setSecondaryRole(e.target.value)}
                        >
                            {VOLUNTEER_ROLES.map((r) => (
                                <option key={r.id} value={r.title}>
                                    {r.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* STEP 2: Personal Details */}
                <section className="volunteer-section">
                    <div className="volunteer-section__head">
                        <h2>Step 2: Your Contact &amp; Details</h2>
                        <p>We need your contact information to coordinate your orientation and shift scheduling.</p>
                    </div>

                    <div className="volunteer-form-grid">
                        <div className="volunteer-field">
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

                        <div className="volunteer-field">
                            <label htmlFor="vol-inst">Campus / University / Occupation *</label>
                            <input
                                id="vol-inst"
                                type="text"
                                required
                                placeholder="e.g. FUTO / IMSU / Freelancer"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                            />
                        </div>

                        <div className="volunteer-field">
                            <label htmlFor="vol-shirt">Crew T-Shirt Size</label>
                            <select
                                id="vol-shirt"
                                value={tshirtSize}
                                onChange={(e) => setTshirtSize(e.target.value)}
                            >
                                <option value="S">Small (S)</option>
                                <option value="M">Medium (M)</option>
                                <option value="L">Large (L)</option>
                                <option value="XL">Extra Large (XL)</option>
                                <option value="XXL">Double Extra Large (XXL)</option>
                            </select>
                        </div>

                        <div className="volunteer-field">
                            <label htmlFor="vol-emergency">Emergency Contact (Name &amp; Phone)</label>
                            <input
                                id="vol-emergency"
                                type="text"
                                placeholder="e.g. Emeka (Brother) - 08099887766"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)}
                            />
                        </div>

                        <div className="volunteer-field volunteer-form-grid__full">
                            <label>Days Available *</label>
                            <div className="volunteer-days">
                                {["Day 1 (Friday)", "Day 2 (Saturday)", "Day 3 (Sunday)"].map((day) => (
                                    <label key={day}>
                                        <input
                                            type="checkbox"
                                            checked={daysAvailable.includes(day)}
                                            onChange={() => toggleDay(day)}
                                        />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="volunteer-field volunteer-form-grid__full">
                            <label htmlFor="vol-motivation">Why would you like to volunteer? (Optional)</label>
                            <textarea
                                id="vol-motivation"
                                placeholder="Tell us briefly about any past event experience or what you hope to learn..."
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* STEP 3: Volunteer Code of Conduct */}
                <section className="volunteer-section">
                    <div className="volunteer-section__head">
                        <h2>Step 3: Volunteer Code of Conduct</h2>
                        <p>Our commitment to an organized, respectful, and safe event environment.</p>
                    </div>

                    <div className="volunteer-conduct">
                        <h4>Volunteer Agreement:</h4>
                        <ul>
                            <li>
                                <b>Punctuality:</b> Arrive at the venue by 7:30 AM on your assigned shift days for morning briefing.
                            </li>
                            <li>
                                <b>Professionalism:</b> Wear your official crew T-shirt and lanyard at all times. Treat all exhibitors, guests, and fellow volunteers with utmost courtesy.
                            </li>
                            <li>
                                <b>Attendance at Orientation:</b> Attend the 45-minute virtual onboarding session held 24 hours prior to Day 1.
                            </li>
                            <li>
                                <b>Safety &amp; Teamwork:</b> Follow supervisor guidelines and immediately report any emergencies to the safety desk.
                            </li>
                        </ul>
                    </div>

                    <label className="volunteer-agreement">
                        <input
                            type="checkbox"
                            checked={conductAccepted}
                            onChange={(e) => setConductAccepted(e.target.checked)}
                        />
                        <span>
                            I agree to the <strong>Silo Exhibitions Volunteer Code of Conduct</strong> and commit
                            to fulfilling my assigned responsibilities with enthusiasm, punctuality, and teamwork.
                        </span>
                    </label>

                    <button
                        type="submit"
                        className="volunteer-submit-btn"
                        disabled={!isFormValid || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="upcoming-exhibitions__spinner" />
                                Submitting Application...
                            </>
                        ) : (
                            "Submit Volunteer Application"
                        )}
                    </button>
                </section>
            </form>
        </main>
    );
};
