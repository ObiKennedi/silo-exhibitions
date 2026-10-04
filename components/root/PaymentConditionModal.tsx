"use client";

import { useEffect, useState } from "react";
import {
    X,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    Calendar,
    Clock,
    DollarSign,
    Check,
    Building2,
    FileText,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import { StallConfig, StallPaymentPlan, UpcomingEvent } from "@/types/upcoming-event";
import "@/styles/root/PaymentConditionModal.scss";

interface Props {
    isOpen: boolean;
    stall: StallConfig | null;
    plan: StallPaymentPlan | null;
    event?: UpcomingEvent;
    onClose: () => void;
    onAccept: (stallId: string, planId: string) => void;
}

export const PaymentConditionModal = ({
    isOpen,
    stall,
    plan,
    event,
    onClose,
    onAccept,
}: Props) => {
    const [acknowledged, setAcknowledged] = useState(true);

    // Lock body scroll when modal is active
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !stall || !plan) return null;

    const basePrice = stall.price || 0;
    const isRevenueShare = Boolean(plan.isRevenueShare || plan.id === "revenue_percentage");
    const isInstallment = plan.id === "installment";
    const isFull = plan.id === "full";
    const depositPct = stall.installmentDepositPercent ?? 50;
    const remainingBalance = Math.max(0, basePrice - plan.dueNow);
    const revPct = plan.revenuePercentage || stall.revenuePercentage || 10;

    const handleAccept = () => {
        if (!acknowledged) return;
        onAccept(stall.id, plan.id);
    };

    return (
        <div className="payment-condition-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="payment-condition-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`payment-condition-header ${isRevenueShare ? "theme-rev" : isInstallment ? "theme-inst" : "theme-full"}`}>
                    <div className="payment-condition-header__badge">
                        {isRevenueShare ? (
                            <AlertTriangle size={14} />
                        ) : isInstallment ? (
                            <Calendar size={14} />
                        ) : (
                            <ShieldCheck size={14} />
                        )}
                        <span>Official Payment Structure Policy</span>
                    </div>

                    <div className="payment-condition-header__info">
                        <h2>{plan.id === "full" ? "Option 1" : plan.id === "installment" ? "Option 2" : plan.id === "revenue_percentage" ? "Option 3" : (plan.name?.startsWith("Option") ? plan.name : "Payment Option")}</h2>
                        <p>
                            Conditions for <strong>{stall.title}</strong> ({stall.size})
                            {event?.title ? ` at ${event.title}` : ""}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="payment-condition-header__close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="payment-condition-body">
                    {/* Financial Summary Card */}
                    <div className="payment-condition-summary">
                        <div className="payment-condition-summary__item">
                            <span className="label">Amount Due Today</span>
                            <span className="value value--highlight">₦{plan.dueNow.toLocaleString()}</span>
                            <span className="sub">via Monnify secure checkout</span>
                        </div>

                        <div className="payment-condition-summary__divider" />

                        <div className="payment-condition-summary__item">
                            <span className="label">Structure Schedule</span>
                            <span className="value">
                                {isFull && "Option 1 • 100% Upfront Settlement"}
                                {isInstallment && `Option 2 • ₦${remainingBalance.toLocaleString()} Due Later`}
                                {isRevenueShare && `Option 3 • ₦${plan.dueNow.toLocaleString()} Deposit + ${revPct}% Revenue Share`}
                            </span>
                            <span className="sub">
                                {isFull && "Zero ongoing cuts or daily audits"}
                                {isInstallment && "Balance due 7 days before exhibition"}
                                {isRevenueShare && "Fixed deposit (not % of stand) + daily remittance"}
                            </span>
                        </div>
                    </div>

                    {/* Specific Structure Conditions */}
                    <div className="payment-condition-section">
                        <h4 className="payment-condition-section__title">
                            <FileText size={16} /> Mandatory Payment &amp; Operational Conditions
                        </h4>

                        <div className="payment-condition-list">
                            {isFull && (
                                <>
                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--green">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Instant Stand Allocation &amp; Pass Issuance</h5>
                                            <p>
                                                Your 100% upfront payment of ₦{plan.dueNow.toLocaleString()} secures and locks in your <strong>{stall.title}</strong> booth immediately. Official exhibitor accreditation and booth numbers are assigned upon checkout.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--green">
                                            <DollarSign size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>100% Sales Retention — Zero Daily Audits</h5>
                                            <p>
                                                Silo Exhibitions does not take any percentage or commission from your sales. You keep 100% of all gross sales and revenue generated throughout the entire exhibition duration.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--blue">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Cancellation &amp; Refund Policy</h5>
                                            <p>
                                                Stand reservation fees are non-refundable within 14 days of the scheduled exhibition opening date.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isInstallment && (
                                <>
                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--blue">
                                            <CreditCard size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Part 1: Initial {depositPct}% Deposit Due Today</h5>
                                            <p>
                                                You are paying an initial reservation deposit of <strong>₦{plan.dueNow.toLocaleString()}</strong> ({depositPct}% of stand value) today via Monnify to reserve your stand space.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--amber">
                                            <Clock size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Part 2: Balance Due 7 Days Prior to Event</h5>
                                            <p>
                                                The remaining balance of <strong>₦{remainingBalance.toLocaleString()}</strong> must be cleared in full no later than 7 calendar days before the exhibition opening date.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--blue">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Final Allocation &amp; Badge Delivery</h5>
                                            <p>
                                                Final stall layout numbers and exhibitor entry badges are activated and dispatched strictly upon receipt of the complete remaining balance.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--red">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Default / Reallocation Notice</h5>
                                            <p>
                                                Failure to settle the remaining balance before the 7-day cutoff may result in booth reallocation to waitlisted vendors without deposit refund.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {isRevenueShare && (
                                <>
                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--blue">
                                            <CreditCard size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Fixed Deposit Selected by Admin (₦{plan.dueNow.toLocaleString()})</h5>
                                            <p>
                                                Under this Pay As You Go plan, your upfront commitment is an admin-selected fixed deposit of <strong>₦{plan.dueNow.toLocaleString()}</strong> today via Monnify (not calculated as a percentage of the total booth price). This secures your <strong>{stall.title}</strong> reservation.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item condition-item--warning">
                                        <div className="condition-item__icon icon--amber">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5 style={{ color: "#92400e" }}>
                                                Strict Policy: {revPct}% of TOTAL SALES (NOT Net Profit)
                                            </h5>
                                            <p style={{ color: "#78350f" }}>
                                                Under this Pay As You Go plan, you agree that exactly <strong>{revPct}% of your DAILY GROSS SALES</strong> must be remitted to the Silo Exhibitions Audit Desk. This percentage is calculated on total customer transaction volume — operational overhead, stock costs, staff fees, and vendor expenses are <strong>NOT deductible</strong>.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--amber">
                                            <Clock size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Daily 8:30 PM Remittance Cutoff</h5>
                                            <p>
                                                At the close of each exhibition day (strictly by 8:30 PM), vendor representatives must report to the Silo Exhibitions Audit Desk with transaction logs (POS slips and transfer receipts) and remit the {revPct}% daily revenue share.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="condition-item">
                                        <div className="condition-item__icon icon--green">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <div className="condition-item__content">
                                            <h5>Next-Day Stand Operating Clearance</h5>
                                            <p>
                                                Timely remittance of daily revenue entitles your brand to continued stand operation and security badge validation for subsequent exhibition days.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* General Exhibition Policy Note */}
                    <div className="payment-condition-note">
                        <Building2 size={16} className="note-icon" />
                        <div>
                            <strong>Exhibition Policy Reminder:</strong> Booth setup runs daily from 7:30 AM to 8:30 AM. Silo Exhibitions operates a digital/cashless environment — all stands must offer customers transfer or card payment options.
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="payment-condition-footer">
                    <label className="payment-condition-footer__agree">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(e) => setAcknowledged(e.target.checked)}
                        />
                        <span>
                            I have read, understood, and accept all the payment conditions and obligations stated above for the <strong>{plan.name}</strong>.
                        </span>
                    </label>

                    <div className="payment-condition-footer__actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Choose Another Structure
                        </button>

                        <button
                            type="button"
                            className="btn-accept"
                            disabled={!acknowledged}
                            onClick={handleAccept}
                        >
                            Accept Conditions &amp; Continue <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
