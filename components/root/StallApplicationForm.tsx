"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    Layers,
    FileText,
    Building2,
    Clock,
    CreditCard,
    Search,
    X,
} from "lucide-react";

import { UpcomingEvent, StallConfig, StallPaymentPlan } from "@/types/upcoming-event";
import { computeStallPlans } from "@/lib/stall-plans";
import { BankTransferModal } from "./BankTransferModal";
import { PaymentConditionModal } from "./PaymentConditionModal";
import { EventCountdown } from "./EventCountdown";
import "@/styles/root/StallApplication.scss";

// Cleanly splits features pasted or typed with newlines or wide space gaps
export const parseFeatures = (featuresList?: string[]): string[] => {
    if (!featuresList || !Array.isArray(featuresList)) return [];
    return featuresList.flatMap((item) => {
        if (!item || typeof item !== "string") return [];
        return item
            .split(/\r?\n|\s{3,}/)
            .map((s) => s.trim())
            .filter(Boolean);
    });
};

// 35 Official Trade Fair Categories
export const VENDOR_CATEGORIES = [
    "Female Adult Ready to wear",
    "Female Adult Boutique wear",
    "Male Adult Boutique Wears",
    "Male Adult Ready to Wear",
    "Casual Wears (T-shirts, jean wears)",
    "Lounge Wears/Underwears (Lingerie, night wears, gym wears)",
    "Children Boutique Wears",
    "Children Ready to Wear",
    "Bags and Shoes",
    "Hair and Hair Services",
    "Mothercare Essentials",
    "Jewelry and Fashion Accessories",
    "Household Essentials",
    "Native/Local Dishes (Abacha, Agbugbu na ji, Nkwobi, Ugba, palm wine)",
    "Grills",
    "Pastries",
    "Conventional Dishes",
    "Drinks (Water, Juices, Parfait etc)",
    "Educational Materials",
    "Fabrics",
    "Adult Thrift Wears",
    "Children's Thrift Wears",
    "Toys and Gadgets",
    "Perfumes and Deodorants",
    "Cosmetics and Skincare",
    "Interior and Beddings",
    "Foodstuff",
    "Packaging",
    "Electronics and Home Appliances",
    "Telecommunications",
    "Financial Institutions",
    "Broadcasting",
    "Travel and Tours",
    "Logistics",
    "Sex and Adult Products",
    "Other",
] as const;

interface Props {
    event: UpcomingEvent;
}

export const StallApplicationForm = ({ event }: Props) => {
    const searchParams = useSearchParams();
    const paramStall = searchParams.get("stall");
    const paramPlan = searchParams.get("plan");

    // Strictly derive stall list from uploaded exhibition data — NEVER fall back to dummy presets!
    const stallList: StallConfig[] = (event.stallsConfig && event.stallsConfig.length > 0)
        ? event.stallsConfig.map((s) => ({
            ...s,
            availablePlans: (Array.isArray(s.availablePlans) && s.availablePlans.length > 0)
                ? s.availablePlans
                : computeStallPlans(s),
          }))
        : [];

    const initialStall = (paramStall ? stallList.find((s) => s.id === paramStall) : null) || stallList[0] || null;
    const initialPlan = (paramPlan ? initialStall?.availablePlans?.find((p) => p.id === paramPlan) : null) || initialStall?.availablePlans?.[0] || null;

    // Selection state
    const [selectedStallId, setSelectedStallId] = useState<string>(() => initialStall?.id || "");
    const [selectedPlanId, setSelectedPlanId] = useState<string>(() => initialPlan?.id || "full");
    const [showForm, setShowForm] = useState<boolean>(() => Boolean(stallList.length > 0 && (paramStall || paramPlan)));

    useEffect(() => {
        if (paramStall && stallList.length > 0) {
            const matchedStall = stallList.find((s) => s.id === paramStall);
            if (matchedStall) {
                setSelectedStallId(matchedStall.id);
                if (paramPlan) {
                    const matchedPlan = matchedStall.availablePlans?.find((p) => p.id === paramPlan);
                    if (matchedPlan) {
                        setSelectedPlanId(matchedPlan.id);
                    }
                } else if (matchedStall.availablePlans?.length) {
                    setSelectedPlanId(matchedStall.availablePlans[0].id);
                }
                setShowForm(true);
            }
        }
    }, [paramStall, paramPlan, stallList]);

    // Form inputs state
    const [ownerName, setOwnerName] = useState("");
    const [phone, setPhone] = useState("");
    const [brandName, setBrandName] = useState("");
    const [email, setEmail] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [socialHandle, setSocialHandle] = useState("");
    const [category, setCategory] = useState<string>(VENDOR_CATEGORIES[0]);
    const [productsSelling, setProductsSelling] = useState("");
    const [estimatedGoodsWorth, setEstimatedGoodsWorth] = useState("");
    const [majorProductPrice, setMajorProductPrice] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState("");

    // Terms agreement
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Payment Condition popup modal state
    const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<StallPaymentPlan | null>(null);

    // Bank Transfer checkout modal state
    const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
    const [applicationReviewState, setApplicationReviewState] = useState<{
        bookingCode: string;
        senderAccountName: string;
        stallTitle: string;
        planName: string;
        dueNow: number;
        paymentProofUrl?: string;
    } | null>(null);

    // Categories Available browsing modal state
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
    const [categoryFilterQuery, setCategoryFilterQuery] = useState("");

    const activeStall = stallList.find((s) => s.id === selectedStallId) ?? stallList[0];
    const activePlan =
        activeStall?.availablePlans?.find((p) => p.id === selectedPlanId) ??
        activeStall?.availablePlans?.[0] ?? {
            id: "full",
            name: "Option 1 • Pay Once",
            dueNow: activeStall?.price || 0,
            totalAmountText: `₦${(activeStall?.price || 0).toLocaleString()} one-off`,
            description: "Pay 100% now for instant confirmed allocation.",
        };

    const scrollToSection = (id: string, delay = 80) => {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, delay);
    };

    const handleStallSelect = (stallId: string, autoScroll = true) => {
        setSelectedStallId(stallId);
        const stall = stallList.find((s) => s.id === stallId) || stallList[0];
        if (stall?.availablePlans?.length) {
            setSelectedPlanId(stall.availablePlans[0].id);
        }
        if (autoScroll) {
            scrollToSection("payment-plans-section", 80);
        }
    };

    const handleOpenPlanConditions = (stallId: string, plan: StallPaymentPlan) => {
        setSelectedStallId(stallId);
        setSelectedPlanId(plan.id);
        setPendingPlan(plan);
        setIsConditionModalOpen(true);
    };

    const handleAcceptPlanConditions = (stallId: string, planId: string) => {
        setSelectedStallId(stallId);
        setSelectedPlanId(planId);
        setIsConditionModalOpen(false);
        setShowForm(true);
        scrollToSection("vendor-form-section", 120);
    };

    const handleChoosePlan = (stallId: string, planId: string) => {
        setSelectedStallId(stallId);
        setSelectedPlanId(planId);
        const targetPlan = activeStall?.availablePlans?.find((p) => p.id === planId) || activePlan;
        setPendingPlan(targetPlan);
        setIsConditionModalOpen(true);
    };

    const isFormValid =
        ownerName.trim().length > 1 &&
        phone.trim().length >= 8 &&
        brandName.trim().length > 1 &&
        /^\S+@\S+\.\S+$/.test(email) &&
        businessAddress.trim().length > 2 &&
        socialHandle.trim().length > 1 &&
        category.trim().length > 0 &&
        productsSelling.trim().length > 1 &&
        estimatedGoodsWorth.trim().length > 0 &&
        majorProductPrice.trim().length > 0 &&
        discountPercentage.trim().length > 0 &&
        termsAccepted;

    const handleOpenBankTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsBankTransferOpen(true);
    };

    const handleSubmitBankTransfer = async (senderAccountName: string, paymentProofUrl?: string) => {
        setIsSubmittingTransfer(true);
        const bookingCode = `SILO-VND-${Math.floor(1000 + Math.random() * 9000)}`;

        try {
            await fetch(`/api/events/${event.slug}/apply-vendor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingCode,
                    eventSlug: event.slug,
                    eventTitle: event.title,
                    stallId: selectedStallId,
                    stallTitle: activeStall.title,
                    planId: selectedPlanId,
                    planName: activePlan.name,
                    dueNow: activePlan.dueNow,
                    isRevenueShare: activePlan.isRevenueShare ?? false,
                    revenuePercentage: activePlan.revenuePercentage ?? null,
                    ownerName,
                    contactName: ownerName,
                    phone,
                    brandName,
                    businessName: brandName,
                    email,
                    businessAddress,
                    socialHandle,
                    instagram: socialHandle,
                    category,
                    productsSelling,
                    description: productsSelling,
                    estimatedGoodsWorth,
                    majorProductPrice,
                    discountPercentage,
                    powerNeeds: null,
                    senderAccountName,
                    paymentProofUrl: paymentProofUrl || null,
                    channel: "OPay Bank Transfer",
                    paymentReference: `OPAY-${Date.now().toString().slice(-6)}`,
                }),
            });
        } catch (err) {
            console.error("Failed to post vendor booking:", err);
        } finally {
            setIsSubmittingTransfer(false);
            setIsBankTransferOpen(false);
        }

        setApplicationReviewState({
            bookingCode,
            senderAccountName,
            stallTitle: activeStall.title,
            planName: activePlan.name,
            dueNow: activePlan.dueNow,
            paymentProofUrl,
        });
    };

    // If successfully submitted payment notice
    if (applicationReviewState) {
        return (
            <main className="stall-page">
                <div className="stall-success">
                    <div className="stall-success__icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                        <Clock size={40} />
                    </div>
                    <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "12px", padding: "4px 14px", borderRadius: 999, marginBottom: 12 }}>
                        🟡 PAYMENT &amp; APPLICATION UNDER REVIEW
                    </div>
                    <h1 className="stall-success__title">Registration Submitted!</h1>
                    <p className="stall-success__sub">
                        Thank you <b>{brandName}</b>! We have received your stand application and bank transfer payment notice for <b>{event.title}</b>.
                    </p>

                    <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "16px 20px", margin: "16px auto 24px", maxWidth: 520, textAlign: "left" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13.5px", color: "#1e3a8a", fontWeight: 700 }}>
                            What happens next?
                        </p>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#334155", lineHeight: 1.55 }}>
                            We sent a confirmation email to <b>{email}</b>. Our finance team is currently reconciling your transfer of <b>₦{applicationReviewState.dueNow.toLocaleString()}</b> from <b>{applicationReviewState.senderAccountName}</b> with our OPay account records. Once verified, your stand will be formally approved and your official Exhibitor Stall Pass will be issued.
                        </p>
                    </div>

                    <div className="stall-success__ticket">
                        <div className="stall-success__ticket-row">
                            <span>Booking Reference</span>
                            <b className="stall-success__ticket-badge">{applicationReviewState.bookingCode}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Business Name</span>
                            <b>{brandName}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Owner / Contact</span>
                            <b>{ownerName} ({phone})</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Stand Allocated</span>
                            <b>{applicationReviewState.stallTitle} ({activeStall.size})</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Selected Structure</span>
                            <b>{applicationReviewState.planName}</b>
                        </div>
                        {activePlan.isRevenueShare && (
                            <div className="stall-success__ticket-row">
                                <span>Daily Share of Total Sales</span>
                                <b style={{ color: "#d97706" }}>{activePlan.revenuePercentage || 18}% of Daily Total Sales (remitted by 8:30pm)</b>
                            </div>
                        )}
                        <div className="stall-success__ticket-row">
                            <span>Amount Transferred</span>
                            <b style={{ color: "#16a34a", fontSize: 16 }}>₦{applicationReviewState.dueNow.toLocaleString()}</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Transfer Sender Name</span>
                            <b style={{ color: "#0f172a" }}>{applicationReviewState.senderAccountName}</b>
                        </div>
                        {applicationReviewState.paymentProofUrl && (
                            <div className="stall-success__ticket-row">
                                <span>Proof of Payment</span>
                                <a
                                    href={applicationReviewState.paymentProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        color: "#2563eb",
                                        fontWeight: 600,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        textDecoration: "underline",
                                    }}
                                >
                                    View Receipt Image ↗
                                </a>
                            </div>
                        )}
                        <div className="stall-success__ticket-row">
                            <span>Bank Paid To</span>
                            <b>OPay (6105607790 - Silo campus tradefair)</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Verification Status</span>
                            <b style={{ color: "#b45309" }}>Pending Bank Reconciliation</b>
                        </div>
                        <div className="stall-success__ticket-row">
                            <span>Event Venue</span>
                            <b>{event.venue}</b>
                        </div>
                    </div>

                    <div className="stall-success__actions">
                        <button
                            type="button"
                            className="stall-success__btn stall-success__btn--print"
                            onClick={() => window.print()}
                        >
                            <Printer size={16} />
                            <span>Print Confirmation Slip</span>
                        </button>
                        <Link
                            href={`/${event.slug}`}
                            className="stall-success__btn stall-success__btn--back"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Exhibition Page</span>
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
                <p className="stall-hero__kicker">Vendor Stand Application.</p>
                <h1 className="stall-hero__title">
                    Book your stand &amp; <mark>sell to thousands.</mark>
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
                    Reserve your booth at Silo Exhibitions. Select your stand size, choose your preferred payment
                    schedule, accept the vendor terms, and complete your reservation via direct bank transfer.
                </p>

                <EventCountdown
                    targetDate={event.startDate}
                    title="Exhibition Starts In"
                    subtitle="Secure your stand package before registration closes"
                />
            </header>

            <form onSubmit={handleOpenBankTransfer}>
                {/* STEP 1: Choose Your Stand */}
                <section id="stall-packages-section" className="stall-section">
                    <div className="stall-section__head">
                        <h2>Step 1: Choose Your Stand</h2>
                        <p>Select the booth dimension that fits your goods and brand perception and capacity , then click &quot;I want this&quot; to choose your payment structure.</p>
                    </div>

                    {/* Official Stand Plan & Floor Layout Document Link */}
                    {event.exhibitionPlan?.documentUrl && (
                        <div className="stall-plan-doc-banner">
                            <div className="stall-plan-doc-banner__info">
                                <Layers size={22} className="stall-plan-doc-banner__icon" />
                                <div>
                                    <h4>Official Stand Plan &amp; Floor Layout Document Available</h4>
                                    <p>Exhibition hall blueprint, walkways, and numbered booth allocations for {event.title}.</p>
                                </div>
                            </div>
                            <a
                                href={event.exhibitionPlan.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="stall-plan-doc-banner__btn"
                            >
                                <Download size={14} /> View Stand Plan (PDF)
                            </a>
                        </div>
                    )}

                    {stallList.length === 0 ? (
                        <div className="stall-empty-state">
                            <Layers size={38} className="stall-empty-state__icon" />
                            <h3>Stand Prices &amp; Packages Coming Soon</h3>
                            <p>
                                Official exhibitor booth packages and pricing for <strong>{event.title}</strong> will be announced shortly.
                                To register early vendor interest or request special pavilion requirements, contact our exhibition desk.
                            </p>
                            {event.whatsappUrl && (
                                <a
                                    href={event.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="stall-empty-state__btn"
                                >
                                    Inquire on WhatsApp
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="stall-grid">
                            {stallList.map((stall) => {
                                const isSelected = stall.id === selectedStallId;
                                const defaultPlan = stall.availablePlans?.[0];
                                const revPlan = stall.availablePlans?.find((p) => p.isRevenueShare);
                                const features = parseFeatures(stall.features);

                                return (
                                    <div
                                        key={stall.id}
                                        className={`stall-card ${isSelected ? "is-selected" : ""}`}
                                        onClick={() => handleStallSelect(stall.id, true)}
                                    >
                                        {stall.badge && (
                                            <div className="stall-card__badge-wrap">
                                                <span className="stall-card__badge-pill">
                                                    <Sparkles size={12} /> {stall.badge}
                                                </span>
                                            </div>
                                        )}

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
                                                        <span style={{ color: "#d97706" }}>₦{revPlan.dueNow.toLocaleString()} <small style={{ fontSize: "12px", color: "#d97706", fontWeight: 600 }}>+ {revPlan.revenuePercentage || 18}% daily sales</small></span>
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

                                        {stall.description && (
                                            <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "14px", lineHeight: "1.5" }}>
                                                {stall.description}
                                            </p>
                                        )}

                                        {features.length > 0 && (
                                            <ul className="stall-card__features">
                                                {features.map((feat, i) => (
                                                    <li key={i}>
                                                        <Check size={14} />
                                                        <span>{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <button
                                            type="button"
                                            className="stall-card__want-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStallSelect(stall.id, true);
                                            }}
                                        >
                                            I want this &rarr;
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* STEP 2: Select a Payment Structure */}
                    {stallList.length > 0 && activeStall && (
                        <div id="payment-plans-section" className="stall-plans">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                                <h3 className="stall-plans__title" style={{ margin: 0 }}>
                                    Step 2: Select a Payment Structure for {activeStall?.title || "Selected Stand"}:
                                </h3>
                                <span style={{ fontSize: "12px", color: "var(--blue, #0015f8)", background: "#eff6ff", padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>
                                    {activeStall?.availablePlans?.length || 1} Option{(activeStall?.availablePlans?.length || 1) > 1 ? "s" : ""} Available
                                </span>
                            </div>

                            <div className="stall-plans__options">
                                {activeStall?.availablePlans?.map((plan, index) => {
                                    const isPlanSelected = plan.id === selectedPlanId;
                                    const optionLabel =
                                        plan.id === "full"
                                            ? "Option 1 • Pay Once"
                                            : plan.id === "installment"
                                            ? "Option 2 • Pay Twice"
                                            : plan.id === "revenue_percentage"
                                            ? "Option 3 • Pay As You Go"
                                            : plan.name;

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`plan-option ${isPlanSelected ? "is-active" : ""}`}
                                            onClick={() => handleOpenPlanConditions(activeStall.id, plan)}
                                        >
                                            <div className="plan-option__head">
                                                <span className="plan-option__name">{optionLabel}</span>
                                                <div className="plan-option__radio" />
                                            </div>
                                            <div className="plan-option__due-now">
                                                ₦{plan.dueNow.toLocaleString()}
                                            </div>
                                            <p className="plan-option__desc">{plan.description}</p>

                                            <button
                                                type="button"
                                                className="plan-option__want-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenPlanConditions(activeStall.id, plan);
                                                }}
                                            >
                                                Choose Payment Structure &rarr;
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Flat rate info box when active stand has revenue share option but full is chosen */}
                            {activeStall?.enableRevenueShare && selectedPlanId === "full" && (
                                <div style={{ marginTop: "16px", padding: "14px 18px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
                                    <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0 }} />
                                    <p style={{ fontSize: "13.5px", color: "#166534", margin: 0, lineHeight: 1.5 }}>
                                        <b>Option 1 Selected: Pay Once.</b> Pay ₦{(activeStall.price || activePlan.dueNow).toLocaleString()} once today. Zero daily audits, no revenue sharing — keep 100% of your sales throughout the exhibition.
                                    </p>
                                </div>
                            )}

                            {/* CRITICAL REVENUE PERCENTAGE WARNING CALLOUT FOR PAY AS YOU GO PLAN */}
                            {activePlan?.isRevenueShare && (
                                <div className="revenue-warning-box">
                                    <AlertTriangle size={24} className="revenue-warning-box__icon" />
                                    <div className="revenue-warning-box__content">
                                        <h4>Important Policy: Option 3 • Pay As You Go ({activePlan.revenuePercentage || 18}% of Daily Total Sales)</h4>
                                        <p>
                                            Under the {activeStall?.title || "Selected Stand"} Pay As You Go structure, you pay a fixed commitment deposit of{" "}
                                            <b>₦{(activePlan.dueNow).toLocaleString()} today via direct bank transfer to secure your spot</b>. At the close
                                            of each day (8:30 PM), exactly <b>{activePlan.revenuePercentage || 18}% of your TOTAL SALES</b> must be
                                            remitted to the Silo Exhibitions Audit Desk.
                                            <br />
                                            <br />
                                            <strong>PLEASE NOTE:</strong> This {activePlan.revenuePercentage || 18}% is calculated strictly on your{" "}
                                            <strong>TOTAL SALES</strong>, <strong>NOT ON NET PROFIT</strong>. Operational overhead, stock cost,
                                            or vendor expenses are NOT deductible from this calculation.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* PROMPT (when form not yet opened) OR FORM (when 'I want this' is clicked) */}
                {stallList.length > 0 && !showForm ? (
                    <div className="stall-choose-prompt">
                        <Sparkles size={28} className="stall-choose-prompt__icon" />
                        <div className="stall-choose-prompt__content">
                            <h3>Ready to register your brand?</h3>
                            <p>
                                Choose your stand package above and click <strong>&quot;I want this&quot;</strong> to open the vendor application and secure your space.
                            </p>
                        </div>
                    </div>
                ) : stallList.length > 0 ? (
                    <div id="vendor-form-section" className="stall-form-section-wrapper">
                        {/* Selected Plan Callout Banner */}
                        <div className="stall-selected-banner">
                            <div className="stall-selected-banner__info">
                                <CheckCircle2 size={26} className="stall-selected-banner__check" />
                                <div>
                                    <span className="stall-selected-banner__kicker">Selected Stand &amp; Payment Structure:</span>
                                    <h3 className="stall-selected-banner__title">
                                        {activeStall?.title} ({activeStall?.size}) — {activePlan?.name}
                                    </h3>
                                    <p className="stall-selected-banner__price">
                                        <strong>₦{(activePlan?.dueNow || 0).toLocaleString()}</strong> to confirm booking
                                        {activePlan?.isRevenueShare && ` (+ ${activePlan.revenuePercentage || 18}% daily total sales share)`}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    className="stall-selected-banner__change-btn"
                                    style={{ background: "#ffffff", color: "#0015f8", border: "1.5px solid #bfdbfe" }}
                                    onClick={() => {
                                        setPendingPlan(activePlan);
                                        setIsConditionModalOpen(true);
                                    }}
                                >
                                    View Payment Conditions
                                </button>
                                <button
                                    type="button"
                                    className="stall-selected-banner__change-btn"
                                    onClick={() => {
                                        document.getElementById("payment-plans-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    Change Structure
                                </button>
                                <button
                                    type="button"
                                    className="stall-selected-banner__change-btn"
                                    style={{ background: "#ffffff", color: "#1e3a8a", border: "1.5px solid #bfdbfe" }}
                                    onClick={() => {
                                        document.getElementById("stall-packages-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    Change Stand
                                </button>
                            </div>
                        </div>

                        {/* STEP 3: Fill the Form */}
                        <section className="stall-section">
                            <div className="stall-section__head">
                                <h2>Step 3: Fill the Form</h2>
                                <p>Provide your brand and product details, accept the vendor agreement, and secure your stand allocation.</p>
                            </div>

                            <div className="stall-form-grid">
                                {/* 1. Business Owner's Name (Full Name) */}
                                <div className="stall-field">
                                    <label htmlFor="owner-name">Business Owner&apos;s Name (Full Name) *</label>
                                    <input
                                        id="owner-name"
                                        type="text"
                                        required
                                        placeholder="e.g. Chukwuma Obi"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                    />
                                </div>

                                {/* 2. WhatsApp / Phone Number */}
                                <div className="stall-field">
                                    <label htmlFor="contact-phone">WhatsApp / Phone Number *</label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        required
                                        placeholder="e.g. 08012345678 or +234 801 234 5678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                {/* 3. Brand Name */}
                                <div className="stall-field">
                                    <label htmlFor="brand-name">Brand Name *</label>
                                    <input
                                        id="brand-name"
                                        type="text"
                                        required
                                        placeholder="e.g. Apex Kicks / Shiloh Grills"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                    />
                                </div>

                                {/* 4. Email Address */}
                                <div className="stall-field">
                                    <label htmlFor="contact-email">Email Address (Must be functional) *</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        placeholder="e.g. yourbusiness@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                {/* 5. Business Address (State Included) */}
                                <div className="stall-field stall-form-grid__full">
                                    <label htmlFor="business-address">Business Address (State Included) *</label>
                                    <input
                                        id="business-address"
                                        type="text"
                                        required
                                        placeholder="e.g. Shop 14, Commercial Avenue, Ikeja, Lagos State"
                                        value={businessAddress}
                                        onChange={(e) => setBusinessAddress(e.target.value)}
                                    />
                                </div>

                                {/* 6. Facebook / TikTok / Instagram Handle or Link */}
                                <div className="stall-field">
                                    <label htmlFor="social-handle">
                                        Facebook / TikTok / Instagram Handle *
                                    </label>
                                    <input
                                        id="social-handle"
                                        type="text"
                                        required
                                        placeholder="e.g. instagram.com/yourbrand or @yourbrand"
                                        value={socialHandle}
                                        onChange={(e) => setSocialHandle(e.target.value)}
                                    />
                                    <span style={{ fontSize: "11.5px", color: "#64748b", marginTop: "-2px" }}>
                                        Put the link your business is most active on
                                    </span>
                                </div>

                                {/* 7. Business Category / Niche */}
                                <div className="stall-field">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                        <label htmlFor="category" style={{ margin: 0 }}>Business Category / Niche *</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsCategoriesModalOpen(true)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "var(--blue, #0015f8)",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                padding: 0,
                                                textDecoration: "underline",
                                            }}
                                        >
                                            View all 35 categories ↗
                                        </button>
                                    </div>
                                    <select
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {VENDOR_CATEGORIES.map((cat, idx) => (
                                            <option key={cat} value={cat}>
                                                {idx + 1}. {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <span style={{ fontSize: "11.5px", color: "#64748b", marginTop: "-2px" }}>
                                        Official trade fair category strictly assigned per booth
                                    </span>
                                </div>

                                {/* 8. Product / Service You Will Be Selling */}
                                <div className="stall-field stall-form-grid__full">
                                    <label htmlFor="products-selling" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                                        <span>Product / Service You Will Be Selling *</span>
                                        <span style={{ fontSize: "12px", color: "#b45309", fontWeight: 600 }}>
                                            ⚠️ (Don&apos;t sell outside the category above)
                                        </span>
                                    </label>
                                    <textarea
                                        id="products-selling"
                                        required
                                        rows={3}
                                        placeholder="Detail the specific items or services you will be showcasing and selling at your stand..."
                                        value={productsSelling}
                                        onChange={(e) => setProductsSelling(e.target.value)}
                                    />
                                </div>

                                {/* 9. Estimated Worth of Your Goods */}
                                <div className="stall-field">
                                    <label htmlFor="estimated-worth">Estimated Worth of Your Goods? *</label>
                                    <input
                                        id="estimated-worth"
                                        type="text"
                                        required
                                        placeholder="e.g. ₦1,500,000"
                                        value={estimatedGoodsWorth}
                                        onChange={(e) => setEstimatedGoodsWorth(e.target.value)}
                                    />
                                </div>

                                {/* 10. Major Product Price */}
                                <div className="stall-field">
                                    <label htmlFor="major-product-price">What is the price of your major product? *</label>
                                    <input
                                        id="major-product-price"
                                        type="text"
                                        required
                                        placeholder="e.g. Hair as low as 50k or phone as low as 500k"
                                        value={majorProductPrice}
                                        onChange={(e) => setMajorProductPrice(e.target.value)}
                                    />
                                    <span style={{ fontSize: "11.5px", color: "#64748b", marginTop: "-2px" }}>
                                        E.g., Hair as low as 50k or phone as low as 500k
                                    </span>
                                </div>

                                {/* 11. Discount Percentage */}
                                <div className="stall-field">
                                    <label htmlFor="discount-percentage">How many percent discount are you giving? *</label>
                                    <input
                                        id="discount-percentage"
                                        type="text"
                                        required
                                        placeholder="e.g. 10%, 15% discount, or up to 30% off"
                                        value={discountPercentage}
                                        onChange={(e) => setDiscountPercentage(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Terms & Conditions Agreement */}
                        <section className="stall-section">
                            <div className="stall-section__head">
                                <h2>Review Terms &amp; Conditions &amp; Stand Plans</h2>
                                <p>You must review and accept the official exhibitor terms and stand plan schedule prior to payment.</p>
                            </div>

                            <div className="stall-terms">
                                <h4 className="stall-terms__title">Silo Exhibitions Vendor Agreement &amp; Stand Plans</h4>

                                {/* 1. Official Terms Uploaded by Admin */}
                                {(() => {
                                    const uploadedTerms = event.importantTerms
                                        ? event.importantTerms.split("\n").map((t) => t.trim()).filter(Boolean)
                                        : [];

                                    const downloadTermsButton = (
                                        <div
                                            style={{
                                                marginTop: 16,
                                                paddingTop: 14,
                                                borderTop: "1px dashed #e2e8f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                flexWrap: "wrap",
                                                gap: 10,
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "12.5px" }}>
                                                <FileText size={14} color="var(--blue, #0015f8)" />
                                                <span>Finished reading? Download an official copy for your records:</span>
                                            </div>
                                            <a
                                                href={`/api/events/${event.slug}/terms-pdf`}
                                                download
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    background: "var(--blue, #0015f8)",
                                                    color: "#fff",
                                                    fontSize: "12.5px",
                                                    fontWeight: 600,
                                                    padding: "8px 16px",
                                                    borderRadius: "6px",
                                                    textDecoration: "none",
                                                    boxShadow: "0 1px 3px rgba(0, 21, 248, 0.18)",
                                                }}
                                                title="Download official Terms & Conditions as PDF"
                                            >
                                                <Download size={13} /> Download Terms (PDF)
                                            </a>
                                        </div>
                                    );

                                    if (uploadedTerms.length > 0) {
                                        return (
                                            <div className="stall-terms__block">
                                                <span className="stall-terms__header-badge">
                                                    <ShieldCheck size={13} /> Official Terms for {event.title}
                                                </span>
                                                <h5>Exhibition Rules &amp; Official Terms</h5>
                                                <ul className="stall-terms__rules-list">
                                                    {uploadedTerms.map((term, i) => (
                                                        <li key={i}>
                                                            <span className="rule-num">{i + 1}</span>
                                                            <span>{term}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {downloadTermsButton}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="stall-terms__block">
                                            <span className="stall-terms__header-badge">
                                                <ShieldCheck size={13} /> Standard Exhibitor Agreement
                                            </span>
                                            <h5>Official Exhibitor Rules &amp; Code of Conduct</h5>
                                            <ul className="stall-terms__rules-list">
                                                <li>
                                                    <span className="rule-num">1</span>
                                                    <span><b>Stand Setup &amp; Timing:</b> Vendors must complete stand setup between 7:30 AM and 8:30 AM each morning. Stands must remain active and staffed until the official closing time of 7:30 PM daily.</span>
                                                </li>
                                                <li>
                                                    <span className="rule-num">2</span>
                                                    <span><b>Stand Plans &amp; Allocation:</b> Reserved booth space is guaranteed upon successful payment of the chosen stand plan. Vendors must operate strictly within assigned dimensions.</span>
                                                </li>
                                                <li>
                                                    <span className="rule-num">3</span>
                                                    <span><b>Cashless &amp; Digital Payment Policy:</b> {event.cashlessPolicy || "This tradefair operates under a digital cashless policy. All stands must offer buyers bank transfer or card/POS payment methods to maintain quick lines and safety."}</span>
                                                </li>
                                                <li>
                                                    <span className="rule-num">4</span>
                                                    <span><b>Booth Cleanliness &amp; Safety:</b> Vendors must maintain their space in a clean, hygienic manner and dispose of waste in designated bins. Open flames without fire clearance are strictly prohibited.</span>
                                                </li>
                                                <li>
                                                    <span className="rule-num">5</span>
                                                    <span><b>Strict No-Cancellation &amp; No-Refund Policy:</b> There is no cancellation or refund plan whatsoever. All stand reservation fees, deposits, and booth payments are strictly 100% non-refundable and non-cancellable under any circumstances.</span>
                                                </li>
                                            </ul>
                                            {downloadTermsButton}
                                        </div>
                                    );
                                })()}

                                {/* 2. Cashless Policy (if explicitly set and not in terms) */}
                                {event.cashlessPolicy && (
                                    <div className="stall-terms__block" style={{ borderLeft: "3.5px solid var(--blue, #0015f8)" }}>
                                        <h5>
                                            <CreditCard size={15} color="var(--blue, #0015f8)" />
                                            Cashless &amp; Digital Payment Policy
                                        </h5>
                                        <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: 1.55 }}>
                                            {event.cashlessPolicy}
                                        </p>
                                    </div>
                                )}

                                {/* 3. Stand Plans & Payment Terms */}
                                <div className="stall-terms__block">
                                    <h5>
                                        <CreditCard size={15} color="var(--blue, #0015f8)" />
                                        Stand Plans &amp; Payment Options
                                    </h5>
                                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px", lineHeight: 1.5 }}>
                                        Official stand configurations and payment schedules for <b>{event.title}</b>:
                                    </p>

                                    {/* Selected Stall Terms Callout */}
                                    <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                                            <strong style={{ fontSize: "13.5px", color: "#1e3a8a" }}>
                                                Selected Allocation: {activeStall?.title} ({activeStall?.size}) — {activePlan?.name}
                                            </strong>
                                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--blue, #0015f8)", background: "#dbeafe", padding: "2px 8px", borderRadius: 4 }}>
                                                ₦{(activePlan?.dueNow || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: "12.5px", color: "#334155", margin: 0, lineHeight: 1.55 }}>
                                            {activePlan?.isRevenueShare ? (
                                                <>Under the Pay As You Go structure, you pay a fixed commitment deposit of <b>₦{(activePlan.dueNow).toLocaleString()} today</b> via direct bank transfer to secure your reservation. Exactly <b>{activePlan.revenuePercentage || 18}% of daily total sales</b> must be remitted to the Silo Audit Desk daily by 8:30 PM. Operational costs and product expenses are not deductible.</>
                                            ) : activePlan?.id === "installment" ? (
                                                <>Under this 2-part installment plan, you pay <b>₦{(activePlan.dueNow).toLocaleString()} deposit today</b> ({activeStall?.installmentDepositPercent ?? 50}%) to hold your space. The remaining balance of <b>₦{((activeStall?.price || 0) - (activePlan.dueNow || 0)).toLocaleString()}</b> is due 7 days before the exhibition opening.</>
                                            ) : (
                                                <>Under the full upfront plan, 100% payment of <b>₦{(activeStall?.price || activePlan?.dueNow || 0).toLocaleString()}</b> is completed today via direct bank transfer for instant confirmed space allocation. Keep 100% of your earnings throughout the exhibition.</>
                                            )}
                                        </p>
                                    </div>

                                    {/* All Stall Plans Overview */}
                                    <div className="stall-terms__plans-grid">
                                        {stallList.map((st) => (
                                            <div
                                                key={st.id}
                                                className={`stall-terms__plan-card ${st.id === selectedStallId ? "is-active" : ""}`}
                                            >
                                                <div className="plan-card-head">
                                                    <strong>{st.title}</strong>
                                                    <span>{st.size}</span>
                                                </div>
                                                <div className="plan-card-price">
                                                    ₦{(st.price || 0).toLocaleString()}
                                                    <small style={{ fontSize: "11px", color: "#64748b", fontWeight: 400, marginLeft: 4 }}>flat</small>
                                                </div>
                                                <p className="plan-card-desc">
                                                    {st.availablePlans.map((p) => p.name).join(" • ")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Official Stand Plan / Floor Layout Document Link */}
                                    {event.exhibitionPlan?.documentUrl && (
                                        <div className="stall-terms__doc-card">
                                            <div className="doc-info">
                                                <Layers size={22} color="#16a34a" />
                                                <div>
                                                    <strong>Official Exhibition Floor Plan &amp; Stand Map (PDF)</strong>
                                                    <span>Review hall blueprint, booth numbers, entrance walkways, and stage location</span>
                                                </div>
                                            </div>
                                            <a
                                                href={event.exhibitionPlan.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="doc-btn"
                                            >
                                                <Download size={13} /> Open Stand Plan
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <label className="stall-agreement">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span>
                                    I have read, understood, and accept the official <strong>Vendor Terms &amp; Conditions</strong> and the <strong>Stand Plans</strong> for <strong>{event.title}</strong>.
                                    {activePlan?.isRevenueShare && (
                                        <> I explicitly acknowledge and agree that under the Pay As You Go plan, the {activePlan.revenuePercentage || 18}% daily share is calculated strictly on <strong>TOTAL SALES and NOT on profit</strong>.</>
                                    )}
                                </span>
                            </label>

                            {/* Summary & Checkout Action */}
                            <div className="stall-summary-bar">
                                <div className="stall-summary-bar__info">
                                    <div>Selected Booking Summary</div>
                                    <h3>₦{(activePlan?.dueNow || 0).toLocaleString()}</h3>
                                    <p>
                                        {activeStall?.title} · {activePlan?.name}
                                        {activePlan?.isRevenueShare && ` (+ ${activePlan.revenuePercentage || 18}% Daily Total Sales)`}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="stall-summary-bar__btn"
                                    disabled={!isFormValid}
                                >
                                    <Building2 size={16} /> Pay ₦{(activePlan?.dueNow || 0).toLocaleString()} via Bank Transfer
                                </button>
                            </div>
                        </section>
                    </div>
                ) : null}
            </form>

            {/* Payment Condition Modal */}
            <PaymentConditionModal
                isOpen={isConditionModalOpen}
                stall={activeStall}
                plan={pendingPlan || activePlan}
                event={event}
                onClose={() => setIsConditionModalOpen(false)}
                onAccept={handleAcceptPlanConditions}
            />

            {/* Bank Transfer Checkout Modal */}
            <BankTransferModal
                isOpen={isBankTransferOpen}
                amount={activePlan?.dueNow || 0}
                stallTitle={activeStall?.title || "Stand"}
                planName={activePlan?.name || "Selected Plan"}
                onClose={() => setIsBankTransferOpen(false)}
                onSubmitPayment={handleSubmitBankTransfer}
                isSubmitting={isSubmittingTransfer}
            />

            {/* Categories Available Modal */}
            {isCategoriesModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.65)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "16px",
                    }}
                    onClick={() => setIsCategoriesModalOpen(false)}
                >
                    <div
                        style={{
                            background: "#ffffff",
                            borderRadius: "16px",
                            maxWidth: "600px",
                            width: "100%",
                            maxHeight: "85vh",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "20px 24px",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background: "#f8fafc",
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, letterSpacing: "0.03em", color: "#0f172a", textTransform: "uppercase" }}>
                                    Categories Available
                                </h3>
                                <p style={{ margin: "4px 0 0 0", fontSize: "12.5px", color: "#64748b" }}>
                                    Select your business category from the 35 official trade fair niches:
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCategoriesModalOpen(false)}
                                style={{
                                    background: "#f1f5f9",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#64748b",
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div style={{ padding: "12px 24px", borderBottom: "1px solid #f1f5f9", background: "#ffffff" }}>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <Search size={16} style={{ position: "absolute", left: 12, color: "#94a3b8" }} />
                                <input
                                    type="text"
                                    placeholder="Search categories (e.g. food, wears, hair, cosmetics)..."
                                    value={categoryFilterQuery}
                                    onChange={(e) => setCategoryFilterQuery(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px 12px 10px 38px",
                                        borderRadius: "8px",
                                        border: "1.5px solid #cbd5e1",
                                        fontSize: "13.5px",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Category List */}
                        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {VENDOR_CATEGORIES.map((cat, idx) => {
                                    if (
                                        categoryFilterQuery.trim() &&
                                        !cat.toLowerCase().includes(categoryFilterQuery.toLowerCase().trim())
                                    ) {
                                        return null;
                                    }
                                    const isSelected = category === cat;
                                    return (
                                        <div
                                            key={cat}
                                            onClick={() => {
                                                setCategory(cat);
                                                setIsCategoriesModalOpen(false);
                                            }}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "10px 14px",
                                                borderRadius: "10px",
                                                border: isSelected ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                                                background: isSelected ? "#eff6ff" : "#ffffff",
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: 26,
                                                        height: 26,
                                                        borderRadius: "6px",
                                                        background: isSelected ? "#2563eb" : "#f1f5f9",
                                                        color: isSelected ? "#ffffff" : "#475569",
                                                        fontSize: "12px",
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {idx + 1}
                                                </span>
                                                <span style={{ fontSize: "14px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#1e40af" : "#1e293b" }}>
                                                    {cat}
                                                </span>
                                            </div>
                                            {isSelected && <Check size={18} color="#2563eb" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Rules Note */}
                        <div
                            style={{
                                padding: "14px 24px",
                                background: "#fffbeb",
                                borderTop: "1px solid #fef3c7",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: "12px", color: "#92400e", lineHeight: 1.4 }}>
                                <strong>Updated Rules:</strong> Stalls are designated strictly per verified product category. Please ensure products you exhibit fall strictly within your registered category.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};
