"use client"

import { useState, useEffect } from "react";
import {
    X,
    ShieldCheck,
    CreditCard,
    Building2,
    Hash,
    Copy,
    Check,
    Clock,
    Loader2,
    CheckCircle2,
} from "lucide-react";

import "@/styles/root/MonnifyModal.scss";

export interface MonnifyPaymentSuccess {
    reference: string;
    paidAmount: number;
    paymentDate: string;
    channel: string;
    transactionId: string;
}

interface Props {
    isOpen: boolean;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    paymentDescription: string;
    reference: string;
    onSuccess: (payment: MonnifyPaymentSuccess) => void;
    onClose: () => void;
}

export const MonnifyModal = ({
    isOpen,
    amount,
    customerName,
    customerEmail,
    customerPhone = "",
    paymentDescription,
    reference,
    onSuccess,
    onClose,
}: Props) => {
    const [tab, setTab] = useState<"transfer" | "card" | "ussd">("transfer");
    const [status, setStatus] = useState<"idle" | "verifying" | "success">("idle");
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1799); // 30 minutes in seconds

    // Card inputs
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");

    // USSD bank
    const [selectedBank, setSelectedBank] = useState("*737# (Guaranty Trust Bank)");

    // Countdown timer for bank transfer
    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    const formattedAmount = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText("7823901928");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleQuickFillCard = () => {
        setCardNumber("5399 4100 8821 3491");
        setCardExpiry("08/28");
        setCardCvv("782");
    };

    const handleCompletePayment = (channel: string) => {
        setStatus("verifying");
        setTimeout(() => {
            setStatus("success");
            setTimeout(() => {
                onSuccess({
                    reference,
                    paidAmount: amount,
                    paymentDate: new Date().toISOString(),
                    channel,
                    transactionId: `MNFY_${Date.now()}`,
                });
            }, 1200);
        }, 1800);
    };

    return (
        <div className="monnify-overlay" role="dialog" aria-modal="true">
            <div className="monnify-modal">
                {/* Header */}
                <header className="monnify-header">
                    <div className="monnify-header__top">
                        <div className="monnify-header__brand">
                            <span>
                                mon<mark>nify</mark>
                            </span>
                            <span className="monnify-header__badge">
                                <ShieldCheck size={12} /> Secured
                            </span>
                        </div>
                        <button
                            type="button"
                            className="monnify-header__close"
                            onClick={onClose}
                            aria-label="Close checkout"
                            disabled={status === "verifying"}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="monnify-header__details">
                        <div>
                            <p className="monnify-header__desc">{paymentDescription}</p>
                            <p className="monnify-header__email">{customerEmail}</p>
                        </div>
                        <p className="monnify-header__amount">{formattedAmount}</p>
                    </div>
                </header>

                {/* State: Verifying */}
                {status === "verifying" && (
                    <div className="monnify-verifying">
                        <Loader2 size={36} className="monnify-verifying__spinner" />
                        <h3>Verifying payment...</h3>
                        <p>Connecting with your bank to confirm transfer. Please wait a moment.</p>
                    </div>
                )}

                {/* State: Success */}
                {status === "success" && (
                    <div className="monnify-success">
                        <div className="monnify-success__icon">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3>Payment Successful!</h3>
                        <p>Your stall booking deposit has been approved.</p>
                        <span className="monnify-success__ref">Ref: {reference}</span>
                    </div>
                )}

                {/* State: Idle / Form */}
                {status === "idle" && (
                    <>
                        {/* Tabs */}
                        <div className="monnify-tabs">
                            <button
                                type="button"
                                className={`monnify-tabs__item ${tab === "transfer" ? "is-active" : ""}`}
                                onClick={() => setTab("transfer")}
                            >
                                <Building2 size={14} /> Bank Transfer
                            </button>
                            <button
                                type="button"
                                className={`monnify-tabs__item ${tab === "card" ? "is-active" : ""}`}
                                onClick={() => setTab("card")}
                            >
                                <CreditCard size={14} /> Debit Card
                            </button>
                            <button
                                type="button"
                                className={`monnify-tabs__item ${tab === "ussd" ? "is-active" : ""}`}
                                onClick={() => setTab("ussd")}
                            >
                                <Hash size={14} /> USSD
                            </button>
                        </div>

                        <div className="monnify-body">
                            {/* Tab: Bank Transfer */}
                            {tab === "transfer" && (
                                <div className="monnify-transfer">
                                    <p className="monnify-transfer__instructions">
                                        Transfer exactly <b>{formattedAmount}</b> to the dedicated virtual
                                        account below from your mobile banking app:
                                    </p>

                                    <div className="monnify-transfer__box">
                                        <div className="monnify-transfer__row">
                                            <span>Bank Name</span>
                                            <b>Wema Bank / Monnify</b>
                                        </div>
                                        <div className="monnify-transfer__row">
                                            <span>Account Number</span>
                                            <div className="monnify-transfer__account-row">
                                                <span className="monnify-transfer__account-num">7823901928</span>
                                                <button
                                                    type="button"
                                                    className="monnify-transfer__copy-btn"
                                                    onClick={handleCopy}
                                                >
                                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                                    {copied ? "Copied" : "Copy"}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="monnify-transfer__row">
                                            <span>Beneficiary</span>
                                            <b>SILO EXHIBITIONS / {customerName || "VENDOR"}</b>
                                        </div>
                                    </div>

                                    <div className="monnify-transfer__timer">
                                        <Clock size={14} />
                                        <span>Account expires in {formatTimer(timeLeft)}</span>
                                    </div>

                                    <div className="monnify-footer">
                                        <button
                                            type="button"
                                            className="monnify-footer__submit-btn"
                                            onClick={() => handleCompletePayment("Bank Transfer")}
                                        >
                                            I Have Sent The Money
                                        </button>
                                        <button
                                            type="button"
                                            className="monnify-footer__cancel-btn"
                                            onClick={onClose}
                                        >
                                            Cancel &amp; return to application
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Card */}
                            {tab === "card" && (
                                <div className="monnify-card">
                                    <div className="monnify-card__group">
                                        <label htmlFor="card-number">Card Number</label>
                                        <input
                                            id="card-number"
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                        />
                                    </div>

                                    <div className="monnify-card__row">
                                        <div className="monnify-card__group">
                                            <label htmlFor="card-expiry">Expiry Date</label>
                                            <input
                                                id="card-expiry"
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                            />
                                        </div>
                                        <div className="monnify-card__group">
                                            <label htmlFor="card-cvv">CVV</label>
                                            <input
                                                id="card-cvv"
                                                type="password"
                                                placeholder="123"
                                                maxLength={3}
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="monnify-card__quick-fill"
                                        onClick={handleQuickFillCard}
                                    >
                                        Use test demo card details
                                    </button>

                                    <div className="monnify-footer">
                                        <button
                                            type="button"
                                            className="monnify-footer__submit-btn"
                                            onClick={() => handleCompletePayment("Card")}
                                            disabled={!cardNumber || !cardExpiry || !cardCvv}
                                        >
                                            Pay {formattedAmount}
                                        </button>
                                        <button
                                            type="button"
                                            className="monnify-footer__cancel-btn"
                                            onClick={onClose}
                                        >
                                            Cancel payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Tab: USSD */}
                            {tab === "ussd" && (
                                <div className="monnify-ussd">
                                    <label htmlFor="ussd-bank">Choose your bank:</label>
                                    <select
                                        id="ussd-bank"
                                        value={selectedBank}
                                        onChange={(e) => setSelectedBank(e.target.value)}
                                    >
                                        <option value="*737# (Guaranty Trust Bank)">
                                            Guaranty Trust Bank (*737#)
                                        </option>
                                        <option value="*894# (First Bank)">First Bank (*894#)</option>
                                        <option value="*966# (Zenith Bank)">Zenith Bank (*966#)</option>
                                        <option value="*901# (Access Bank)">Access Bank (*901#)</option>
                                        <option value="*770# (Fidelity Bank)">Fidelity Bank (*770#)</option>
                                        <option value="*919# (UBA)">UBA (*919#)</option>
                                    </select>

                                    <div className="monnify-ussd__code-box">
                                        <span>Dial on your registered phone:</span>
                                        <h3>*737*000*4928#</h3>
                                        <p>Follow screen prompts and enter your transaction PIN to approve.</p>
                                    </div>

                                    <div className="monnify-footer">
                                        <button
                                            type="button"
                                            className="monnify-footer__submit-btn"
                                            onClick={() => handleCompletePayment("USSD")}
                                        >
                                            I Have Completed The USSD
                                        </button>
                                        <button
                                            type="button"
                                            className="monnify-footer__cancel-btn"
                                            onClick={onClose}
                                        >
                                            Cancel payment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
