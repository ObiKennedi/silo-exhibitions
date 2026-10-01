"use client"

import { useState } from "react";
import Link from "next/link";
import {
    Check,
    CheckCircle2,
    Calendar,
    MapPin,
    ArrowLeft,
    AlertTriangle,
    ShieldCheck,
    Sparkles,
    Lock,
    Printer,
    Download,
} from "lucide-react";

import { UpcomingEvent, StallConfig, StallPaymentPlan } from "@/types/upcoming-event";
import { MonnifyModal, MonnifyPaymentSuccess } from "./MonnifyModal";
import { EventCountdown } from "./EventCountdown";
import "@/styles/root/StallApplication.scss";

interface Props {
    event: UpcomingEvent;
}

const DEFAULT_STALL_CONFIGS: StallConfig[] = [
    {
        id: "compact",
        title: "Standard Booth",
        size: "2m × 2m (4 sqm)",
        price: 35000,
        description: "Ideal for student entrepreneurs, solo artisans, apparel & craft vendors.",
        features: [
            "1 Display table + 2 chairs",
            "1 Standard electrical socket (500W)",
            "2 Official Vendor passes",
            "Basic directory listing in campus program",
        ],
        availablePlans: [
            {
                id: "full",
                name: "Full Upfront Payment",
                dueNow: 35000,
                totalAmountText: "₦35,000 one-off",
                description: "Pay 100% now for instant confirmed allocation.",
            },
            {
                id: "installment",
                name: "2-Part Installment Plan",
                dueNow: 20000,
                totalAmountText: "₦20,000 now + ₦15,000 later",
                description: "Pay ₦20,000 deposit today to hold your space. Remainder due 7 days prior.",
            },
        ],
    },
    {
        id: "corner",
        title: "Prime Corner Stall",
        size: "3m × 3m (9 sqm)",
        badge: "High Foot Traffic",
        description: "Corner placement at corridor intersections with high attendee flow.",
        features: [
            "2 Display tables + 4 chairs",
            "Dual high-capacity electrical sockets (1500W)",
            "4 Official Vendor passes",
            "Highlighted boundary on physical & digital event maps",
            "1 Live DJ shoutout per day",
        ],
        availablePlans: [
            {
                id: "full",
                name: "Full Upfront Payment",
                dueNow: 65000,
                totalAmountText: "₦65,000 one-off",
                description: "Lock corner booth priority and save on installment admin costs.",
            },
            {
                id: "installment",
                name: "2-Part Installment Plan",
                dueNow: 35000,
                totalAmountText: "₦35,000 now + ₦30,000 later",
                description: "Pay ₦35,000 today to reserve corner stall. Final balance due 7 days before event.",
            },
        ],
    },
    {
        id: "mega",
        title: "Grand Mega Pavilion",
        size: "5m × 5m (25 sqm)",
        badge: "Largest Stall · Anchor Brand",
        description: "Prime center-arena anchor pavilion designed for flagship campus brands and high-volume sales.",
        features: [
            "Massive 25 sqm center-court pavilion space",
            "Dedicated high-amp electrical line (3000W)",
            "8 VIP Vendor badges with early setup privileges",
            "Stage spotlight interview & continuous MC mentions",
            "Priority loading dock & logistics assistance",
            "Full feature page in official exhibition digital guide",
        ],
        availablePlans: [
            {
                id: "full",
                name: "Option 1: Flat Rate (Pay Once)",
                dueNow: 120000,
                totalAmountText: "₦120,000 one-off flat rate",
                description: "Pay once upfront for all 3 days. No daily revenue percentage or daily remittance required — keep 100% of your sales.",
            },
            {
                id: "revenue_percentage",
                name: "Option 2: Pay Daily (10% Daily Gross Revenue)",
                dueNow: 25000,
                totalAmountText: "₦25,000 Setup Deposit + 10% Daily Gross Revenue",
                description: "Lower initial commitment. Pay a ₦25,000 setup deposit today, then remit 10% of your total daily gross revenue at the end of each day.",
                isRevenueShare: true,
                revenuePercentage: 10,
            },
        ],
    },
];

export const StallApplicationForm = ({ event }: Props) => {
    const stallList: StallConfig[] = (event.stallsConfig && event.stallsConfig.length > 0)
        ? event.stallsConfig
        : DEFAULT_STALL_CONFIGS;

    // Selection state
    const [selectedStallId, setSelectedStallId] = useState<string>(() => stallList[0]?.id || "compact");
    const [selectedPlanId, setSelectedPlanId] = useState<string>(() => stallList[0]?.availablePlans?.[0]?.id || "full");
    const [showForm, setShowForm] = useState(false);

    // Form inputs state
    const [businessName, setBusinessName] = useState("");
    const [category, setCategory] = useState("Fashion & Apparel");
    const [contactName, setContactName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [instagram, setInstagram] = useState("");
    const [description, setDescription] = useState("");
    const [powerNeeds, setPowerNeeds] = useState("Standard (phone/POS charging)");

    // Terms agreement
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Monnify checkout modal state
    const [isMonnifyOpen, setIsMonnifyOpen] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState<{
        bookingCode: string;
        payment: MonnifyPaymentSuccess;
        stallTitle: string;
        planName: string;
    } | null>(null);

    const activeStall = stallList.find((s) => s.id === selectedStallId) ?? stallList[0];
    const activePlan =
        activeStall?.availablePlans?.find((p) => p.id === selectedPlanId) ??
        activeStall?.availablePlans?.[0] ?? {
            id: "full",
            name: "Full Upfront Payment",
            dueNow: activeStall?.price || 0,
            totalAmountText: `₦${(activeStall?.price || 0).toLocaleString()} one-off`,
            description: "Pay 100% now for instant confirmed allocation.",
        };

    const handleStallSelect = (stallId: string) => {
        setSelectedStallId(stallId);
        const stall = stallList.find((s) => s.id === stallId) || stallList[0];
        if (stall?.availablePlans?.length) {
            setSelectedPlanId(stall.availablePlans[0].id);
        }
    };

    const handleChoosePlan = (stallId: string, planId: string) => {
        setSelectedStallId(stallId);
        setSelectedPlanId(planId);
        setShowForm(true);
        setTimeout(() => {
            document.getElementById("vendor-form-section")?.scrollIntoView({ behavior: "smooth" });
        }, 60);
    };

    const isFormValid =
        businessName.trim().length > 1 &&
        contactName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(email) &&
        phone.trim().length >= 10 &&
        termsAccepted;

    const handleOpenMonnify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsMonnifyOpen(true);
    };

    const handlePaymentSuccess = async (payment: MonnifyPaymentSuccess) => {
        setIsMonnifyOpen(false);

        const bookingCode = `SILO-VND-${Math.floor(1000 + Math.random() * 9000)}`;

        // Post record to backend
        try {
            await fetch(`/api/events/${event.slug}/apply-vendor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingCode,
                    eventSlug: event.slug,
                    stallId: selectedStallId,
                    stallTitle: activeStall.title,
                    planId: selectedPlanId,
                    planName: activePlan.name,
                    dueNow: activePlan.dueNow,
                    isRevenueShare: activePlan.isRevenueShare ?? false,
                    revenuePercentage: activePlan.revenuePercentage ?? null,
                    businessName,
                    category,
                    contactName,
                    email,
                    phone,
                    instagram,
                    description,
                    powerNeeds,
                    paymentReference: payment.reference,
                    transactionId: payment.transactionId,
                    paidAmount: payment.paidAmount,
                    channel: payment.channel,
                    paymentDate: payment.paymentDate,
                }),
            });
        } catch (err) {
            console.error("Failed to post vendor booking:", err);
        }

        setBookingSuccess({
            bookingCode,
            payment,
            stallTitle: activeStall.title,
            planName: activePlan.name,
        });
    };

    // If successfully booked and paid
    if (bookingSuccess) {
        return (
            <main className="stall-page">
                <div className="stall-success">
                    <div className="stall-success__icon">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="stall-success__title">Stall Reserved!</h1>
                    <p className="stall-success__sub">
                        Your vendor application and deposit for <b>{event.title}</b> have been confirmed via Monnify.
                    </p>

                    <div className="stall-success__ticket">
                        <div className="stall-success__ticket-row">
                            <span>Vendor Pass Code</span>
                            <b className="stall-success__ticket-badge">{bookingSuccess.bookingCode}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Business Name</span>
                            <b>{businessName}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Stall Allocated</span>
                            <b>{bookingSuccess.stallTitle} ({activeStall.size})</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Selected Plan</span>
                            <b>{bookingSuccess.planName}</b>
                        </div>
                        {activePlan.isRevenueShare && (
                            <div className="stall-success__ticket-row">
                                <span>Daily Gross Revenue Share</span>
                                <b style={{ color: "#d97706" }}>10% Daily Gross Revenue (remitted by 8:30pm)</b>
                            </div>
                        )}
                        <div className="stall-success__ticket-row">
                            <span>Monnify Ref</span>
                            <b>{bookingSuccess.payment.reference}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Amount Paid Today</span>
                            <b>₦{bookingSuccess.payment.paidAmount.toLocaleString()}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Event Venue</span>
                            <b>{event.venue}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Event Dates</span>
                            <b>{new Date(event.startDate).toLocaleDateString("en-GB")} – {new Date(event.endDate).toLocaleDateString("en-GB")}</b>
                        </div>
                    </div>

                    <div className="stall-success__actions">
                        <button
                            type="button"
                            className="event-page__link-btn"
                            onClick={() => window.print()}
                        >
                            <Printer size={16} /> Print Receipt
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
        <main className="stall-page">
            {/* Header Hero */}
            <header className="stall-hero">
                <Link href={`/${event.slug}`} className="stall-hero__back">
                    <ArrowLeft size={16} /> Back to {event.title}
                </Link>
                <p className="stall-hero__kicker">Vendor Stall Application.</p>
                <h1 className="stall-hero__title">
                    Book your stall &amp; <mark>sell to thousands.</mark>
                </h1>
                <div className="stall-hero__meta">
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
                <p className="stall-hero__sub">
                    Reserve your booth at Silo Exhibitions. Select your stall size, choose your preferred payment
                    schedule, accept the vendor terms, and complete your reservation instantly via Monnify.
                </p>

                <EventCountdown
                    targetDate={event.startDate}
                    title="Exhibition Starts In"
                    subtitle="Secure your stall package before registration closes"
                />
            </header>

            <form onSubmit={handleOpenMonnify}>
                {/* STEP 1: Select Stall Size */}
                <section id="stall-packages-section" className="stall-section">
                    <div className="stall-section__head">
                        <h2>Step 1: Choose Your Stall Size &amp; Plan</h2>
                        <p>Select the booth dimension that fits your merchandise and brand presence, then click &quot;I want this&quot; to open the application.</p>
                    </div>

                    <div className="stall-grid">
                        {stallList.map((stall) => {
                            const isSelected = stall.id === selectedStallId;
                            const defaultPlan = stall.availablePlans?.[0];
                            const revPlan = stall.availablePlans?.find((p) => p.isRevenueShare);

                            return (
                                <div
                                    key={stall.id}
                                    className={`stall-card ${isSelected ? "is-selected" : ""}`}
                                    onClick={() => handleStallSelect(stall.id)}
                                >
                                    {stall.badge && <span className="stall-card__badge-top">{stall.badge}</span>}

                                    <div className="stall-card__header">
                                        <div>
                                            <h3 className="stall-card__title">{stall.title}</h3>
                                            <span className="stall-card__size">{stall.size}</span>
                                        </div>
                                        <div className="stall-card__radio" />
                                    </div>

                                    <div className="stall-card__price-wrap">
                                        <div className="stall-card__price-main">
                                            {revPlan ? (
                                                <div style={{ fontSize: "19px", lineHeight: "1.25" }}>
                                                    <span>₦{(stall.price || defaultPlan?.dueNow || 0).toLocaleString()} <small style={{ fontSize: "12px", color: "var(--muted)", fontWeight: 500 }}>flat once</small></span>
                                                    <span style={{ fontSize: "12px", color: "var(--muted)", margin: "0 4px", fontWeight: 400 }}>or</span>
                                                    <span style={{ color: "#d97706" }}>₦{revPlan.dueNow.toLocaleString()} <small style={{ fontSize: "12px", color: "#d97706", fontWeight: 600 }}>+ {revPlan.revenuePercentage || 10}% daily</small></span>
                                                </div>
                                            ) : (
                                                `₦${(stall.price || defaultPlan?.dueNow || 0).toLocaleString()}`
                                            )}
                                        </div>
                                        <div className="stall-card__price-sub">
                                            {revPlan
                                                ? "Two payment options: Flat rate once OR Pay daily"
                                                : defaultPlan?.totalAmountText || `₦${(stall.price || 0).toLocaleString()} one-off`}
                                        </div>
                                    </div>

                                    <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px", lineHeight: "1.5" }}>
                                        {stall.description}
                                    </p>

                                    <ul className="stall-card__features">
                                        {stall.features.map((feat, i) => (
                                            <li key={i}>
                                                <Check size={14} />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        className="stall-card__want-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (defaultPlan) {
                                                handleChoosePlan(stall.id, defaultPlan.id);
                                            } else {
                                                handleStallSelect(stall.id);
                                                setShowForm(true);
                                            }
                                        }}
                                    >
                                        I want this
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Payment Plan Options for Selected Stall */}
                    <div className="stall-plans">
                        <h3 className="stall-plans__title">
                            Payment Plans for {activeStall?.title || "Selected Stall"}:
                        </h3>

                        <div className="stall-plans__options">
                            {activeStall?.availablePlans?.map((plan) => {
                                const isPlanSelected = plan.id === selectedPlanId;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`plan-option ${isPlanSelected ? "is-active" : ""}`}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                    >
                                        <div className="plan-option__head">
                                            <span className="plan-option__name">{plan.name}</span>
                                            <div className="plan-option__radio" />
                                        </div>
                                        <div className="plan-option__due-now">
                                            ₦{plan.dueNow.toLocaleString()} <small style={{ fontSize: "12px", color: "#64748b" }}>due now</small>
                                        </div>
                                        <p className="plan-option__desc">{plan.description}</p>

                                        <button
                                            type="button"
                                            className="plan-option__want-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleChoosePlan(activeStall.id, plan.id);
                                            }}
                                        >
                                            I want this
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Flat rate info box for mega */}
                        {selectedStallId === "mega" && selectedPlanId === "full" && (
                            <div style={{ marginTop: "16px", padding: "14px 18px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
                                <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0 }} />
                                <p style={{ fontSize: "13.5px", color: "#166534", margin: 0, lineHeight: 1.5 }}>
                                    <b>Option 1 Selected: One-time Flat Rate.</b> Pay ₦120,000 once today. Zero daily audits, no revenue sharing — keep 100% of your sales throughout the 3-day exhibition.
                                </p>
                            </div>
                        )}

                        {/* CRITICAL REVENUE PERCENTAGE WARNING CALLOUT FOR LARGEST STALL */}
                        {selectedStallId === "mega" && selectedPlanId === "revenue_percentage" && (
                            <div className="revenue-warning-box">
                                <AlertTriangle size={24} className="revenue-warning-box__icon" />
                                <div className="revenue-warning-box__content">
                                    <h4>Important Policy: 10% of Daily Gross Revenue (Not Profit)</h4>
                                    <p>
                                        Under the Grand Mega Pavilion Daily Revenue Share plan, you pay a{" "}
                                        <b>₦25,000 reservation &amp; setup deposit today via Monnify</b>. At the close
                                        of each day (8:30 PM), exactly <b>10% of your TOTAL GROSS REVENUE</b> must be
                                        remitted to the Silo Exhibitions Audit Desk.
                                        <br />
                                        <br />
                                        <strong>PLEASE NOTE:</strong> This 10% is calculated on your{" "}
                                        <strong>TOTAL DAILY REVENUE</strong> (all incoming sales money across cash, POS,
                                        and transfers), <strong>NOT ON NET PROFIT</strong>. Operational overhead, stock cost,
                                        or vendor expenses are NOT deductible from this calculation.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* PROMPT (when form not yet opened) OR FORM (when 'I want this' is clicked) */}
                {!showForm ? (
                    <div className="stall-choose-prompt">
                        <Sparkles size={28} className="stall-choose-prompt__icon" />
                        <div className="stall-choose-prompt__content">
                            <h3>Ready to register your brand?</h3>
                            <p>
                                Choose your stall package above and click <strong>&quot;I want this&quot;</strong> to open the vendor application and secure your space.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div id="vendor-form-section" className="stall-form-section-wrapper">
                        {/* Selected Plan Callout Banner */}
                        <div className="stall-selected-banner">
                            <div className="stall-selected-banner__info">
                                <CheckCircle2 size={26} className="stall-selected-banner__check" />
                                <div>
                                    <span className="stall-selected-banner__kicker">Selected Package:</span>
                                    <h3 className="stall-selected-banner__title">
                                        {activeStall.title} ({activeStall.size}) — {activePlan.name}
                                    </h3>
                                    <p className="stall-selected-banner__price">
                                        <strong>₦{activePlan.dueNow.toLocaleString()}</strong> due now to confirm booking
                                        {activePlan.isRevenueShare && " (+ 10% daily gross revenue share)"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="stall-selected-banner__change-btn"
                                onClick={() => {
                                    document.getElementById("stall-packages-section")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                Change Plan
                            </button>
                        </div>

                        {/* STEP 2: Vendor Business Information */}
                        <section className="stall-section">
                            <div className="stall-section__head">
                                <h2>Step 2: Business &amp; Contact Details</h2>
                                <p>Tell us about your brand and products so we can prepare your exhibitor materials.</p>
                            </div>

                            <div className="stall-form-grid">
                                <div className="stall-field">
                                    <label htmlFor="biz-name">Brand / Business Name *</label>
                                    <input
                                        id="biz-name"
                                        type="text"
                                        required
                                        placeholder="e.g. Campus Kicks / Shiloh Grills"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                    />
                                </div>

                                <div className="stall-field">
                                    <label htmlFor="category">Business Category *</label>
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Fashion & Apparel">Fashion &amp; Apparel (Shoes, Clothes, Bags)</option>
                                        <option value="Food & Drinks">Food, Confectionery &amp; Drinks</option>
                                        <option value="Tech & Gadgets">Tech, Phones &amp; Accessories</option>
                                        <option value="Beauty & Skincare">Beauty, Perfumes &amp; Skincare</option>
                                        <option value="Art & Crafts">Art, Books &amp; Handmade Crafts</option>
                                        <option value="Services & Agency">Digital Services, Media &amp; Printing</option>
                                        <option value="Other">Other Retail Goods</option>
                                    </select>
                                </div>

                                <div className="stall-field">
                                    <label htmlFor="contact-name">Contact Person (Full Name) *</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        placeholder="e.g. Obi Kennedy"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </div>

                                <div className="stall-field">
                                    <label htmlFor="contact-phone">WhatsApp / Phone Number *</label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        required
                                        placeholder="e.g. 08012345678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div className="stall-field">
                                    <label htmlFor="contact-email">Email Address *</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        placeholder="e.g. business@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="stall-field">
                                    <label htmlFor="instagram">Instagram / Website Handle</label>
                                    <input
                                        id="instagram"
                                        type="text"
                                        placeholder="@yourbrandname or www.yourbrand.com"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                    />
                                </div>

                                <div className="stall-field stall-form-grid__full">
                                    <label htmlFor="description">Products or Services You Will Be Selling *</label>
                                    <textarea
                                        id="description"
                                        required
                                        placeholder="Briefly describe what items or services you will showcase at your stall..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="stall-field stall-form-grid__full">
                                    <label htmlFor="power">Power &amp; Electrical Requirements</label>
                                    <select
                                        id="power"
                                        value={powerNeeds}
                                        onChange={(e) => setPowerNeeds(e.target.value)}
                                    >
                                        <option value="Standard (phone/POS charging)">
                                            Standard (Phone charging, POS terminal, lighting)
                                        </option>
                                        <option value="Medium (laptops, display screens, blenders)">
                                            Medium (Laptops, display monitors, low-power appliances)
                                        </option>
                                        <option value="Heavy (fryers, microwaves, sound speakers)">
                                            Heavy (Electric fryers, microwaves, sound equipment — requires approval)
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* STEP 3: Terms & Conditions Agreement */}
                        <section className="stall-section">
                            <div className="stall-section__head">
                                <h2>Step 3: Review Terms &amp; Conditions</h2>
                                <p>You must review and accept the official exhibitor terms prior to payment.</p>
                            </div>

                            <div className="stall-terms">
                                <h4 className="stall-terms__title">Silo Exhibitions Vendor Stall Agreement &amp; Rules</h4>

                                {/* Dynamically Rendered Important Terms Uploaded by Admin */}
                                {event.importantTerms && (
                                    <div className="stall-terms__admin-box">
                                        <div className="stall-terms__admin-badge">
                                            <ShieldCheck size={14} /> Official Terms for {event.title}
                                        </div>
                                        <div className="stall-terms__admin-content">
                                            {event.importantTerms.split("\n").filter(Boolean).map((term, i) => (
                                                <p key={i}>• {term}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <ol>
                                    <li>
                                        <b>Stall Setup &amp; Timing:</b> Vendors must complete stall setup between 7:30 AM
                                        and 8:30 AM each morning. Stalls must remain active and staffed until the official
                                        closing time of 7:30 PM daily.
                                    </li>
                                    <li>
                                        <b>Payment Structure for Largest Store (Grand Mega Pavilion):</b> Vendors booking the
                                        largest store (Grand Mega Pavilion) have two clear options:
                                        (a) <b>Flat Rate (Pay Once):</b> A single ₦120,000 one-time flat fee with zero daily revenue sharing; OR 
                                        (b) <b>Pay Daily:</b> A ₦25,000 setup deposit paid today via Monnify, followed by daily remittance of 
                                        <b>10% of total daily gross sales revenue</b> submitted to the Silo Exhibitions Audit Desk every evening by 8:30 PM. 
                                        <b>The percentage applies to total gross sales revenue, NOT net profit.</b> Failure to submit daily sales logs or underreporting results in stall cancellation and forfeiture of deposit.
                                    </li>
                                    <li>
                                        <b>Cashless &amp; Digital Payment Policy:</b> {event.cashlessPolicy || "This tradefair operates under a digital cashless policy. All stalls must offer buyers bank transfer or card/POS payment methods to maintain quick lines and safety."}
                                    </li>
                                    <li>
                                        <b>Booth Cleanliness &amp; Safety:</b> Vendors must maintain their space in a clean, hygienic
                                        manner and dispose of waste in designated bins. Open flames without fire clearance are strictly
                                        prohibited.
                                    </li>
                                    <li>
                                        <b>Cancellation &amp; Refunds:</b> Stall reservation fees and deposits are non-refundable within
                                        14 days of the scheduled exhibition opening date.
                                    </li>
                                </ol>
                            </div>

                            <label className="stall-agreement">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span>
                                    I have read, understood, and accept the <strong>Silo Exhibitions Vendor Stall Terms &amp; Conditions</strong>.
                                    {selectedStallId === "mega" && selectedPlanId === "revenue_percentage" && (
                                        <> I explicitly acknowledge and agree that the 10% daily share is calculated strictly on <strong>TOTAL GROSS REVENUE and NOT on profit</strong>.</>
                                    )}
                                </span>
                            </label>

                            {/* Summary & Checkout Action */}
                            <div className="stall-summary-bar">
                                <div className="stall-summary-bar__info">
                                    <div>Selected Booking Summary</div>
                                    <h3>₦{activePlan.dueNow.toLocaleString()}</h3>
                                    <p>
                                        {activeStall.title} · {activePlan.name}
                                        {activePlan.isRevenueShare && " (+ 10% Daily Gross Revenue)"}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="stall-summary-bar__btn"
                                    disabled={!isFormValid}
                                >
                                    <Lock size={16} /> Pay ₦{activePlan.dueNow.toLocaleString()} via Monnify
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </form>

            {/* Monnify Checkout Modal */}
            <MonnifyModal
                isOpen={isMonnifyOpen}
                amount={activePlan.dueNow}
                customerName={contactName || businessName}
                customerEmail={email}
                customerPhone={phone}
                paymentDescription={`${activeStall.title} Stall Deposit - ${event.title}`}
                reference={`SILO-STALL-${Date.now().toString().slice(-6)}`}
                onClose={() => setIsMonnifyOpen(false)}
                onSuccess={handlePaymentSuccess}
            />
        </main>
    );
};
