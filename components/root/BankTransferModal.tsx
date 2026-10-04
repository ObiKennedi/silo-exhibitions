"use client";

import { useState } from "react";
import {
    X,
    Building2,
    Copy,
    Check,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    Loader2,
} from "lucide-react";
import "@/styles/root/BankTransferModal.scss";

interface BankTransferModalProps {
    isOpen: boolean;
    amount: number;
    stallTitle: string;
    planName: string;
    onClose: () => void;
    onSubmitPayment: (senderAccountName: string) => Promise<void> | void;
    isSubmitting?: boolean;
}

export const BankTransferModal = ({
    isOpen,
    amount,
    stallTitle,
    planName,
    onClose,
    onSubmitPayment,
    isSubmitting = false,
}: BankTransferModalProps) => {
    const [senderAccountName, setSenderAccountName] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText("6105607790");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = senderAccountName.trim();
        if (!trimmed) {
            setError("Please enter the name on the bank account you used to transfer.");
            return;
        }
        setError(null);
        onSubmitPayment(trimmed);
    };

    return (
        <div className="bank-transfer-overlay" onClick={onClose}>
            <div
                className="bank-transfer-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bank-transfer-modal__head">
                    <div className="head-info">
                        <span className="badge">
                            <Building2 size={13} /> Official Bank Account
                        </span>
                        <h2>Bank Transfer Payment</h2>
                        <p>Complete transfer to secure your stand allocation</p>
                    </div>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form & Content */}
                <form onSubmit={handleSubmit} style={{ display: "contents" }}>
                    <div className="bank-transfer-modal__body">
                        {/* Summary & Account Box */}
                        <div className="account-card">
                            <div className="account-card__row">
                                <span className="label">Bank Name</span>
                                <span className="value bank-name">
                                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#00b67a" }}></span>
                                    OPay
                                </span>
                            </div>

                            <div className="account-card__row">
                                <span className="label">Account Number</span>
                                <div className="account-num-box">
                                    <span className="account-num">6105607790</span>
                                    <button
                                        type="button"
                                        className={`copy-btn ${copied ? "is-copied" : ""}`}
                                        onClick={handleCopy}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={13} /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={13} /> Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="account-card__row">
                                <span className="label">Account Name</span>
                                <span className="value">Silo campus tradefair</span>
                            </div>

                            <div className="account-card__row">
                                <span className="label">Stand Allocation</span>
                                <span className="value">{stallTitle} ({planName})</span>
                            </div>

                            <div className="account-card__row">
                                <span className="label">Amount Due Now</span>
                                <span className="value amount-due">₦{amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="notice-box">
                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                            <p>
                                <strong>Instructions:</strong> Open your banking app and transfer exactly <strong>₦{amount.toLocaleString()}</strong> to the OPay account above. Then enter the name on your account below so we can tie the payment to you.
                            </p>
                        </div>

                        {/* Sender Account Name Input */}
                        <div className="transfer-form">
                            <div className="form-group">
                                <label htmlFor="sender-account-name">
                                    Name on Bank Account Used for Transfer *
                                </label>
                                <input
                                    id="sender-account-name"
                                    type="text"
                                    required
                                    autoFocus
                                    placeholder="e.g. Chukwuma Obi or Apex Footwears"
                                    value={senderAccountName}
                                    onChange={(e) => {
                                        setSenderAccountName(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    disabled={isSubmitting}
                                />
                                <span className="help-text">
                                    Enter the exact sender name on your transfer receipt or bank alert so our finance team can verify and approve your registration.
                                </span>
                                {error && (
                                    <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                                        {error}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bank-transfer-modal__footer">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={!senderAccountName.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Verifying Submission...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={18} /> I Have Paid — Submit for Review
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel / Modify Stand Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
