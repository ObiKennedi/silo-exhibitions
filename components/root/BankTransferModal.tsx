"use client";

import { useState, useRef } from "react";
import {
    X,
    Building2,
    Copy,
    Check,
    CheckCircle2,
    AlertCircle,
    Loader2,
    UploadCloud,
    ImageIcon,
    Trash2,
    RefreshCw,
} from "lucide-react";
import "@/styles/root/BankTransferModal.scss";

interface BankTransferModalProps {
    isOpen: boolean;
    amount: number;
    stallTitle: string;
    planName: string;
    onClose: () => void;
    onSubmitPayment: (senderAccountName: string, paymentProofUrl: string) => Promise<void> | void;
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

    // Proof of Payment Upload States
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null);
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText("6105607790");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const uploadFileToServer = async (file: File): Promise<string | null> => {
        setIsUploadingProof(true);
        setUploadError(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "silo-exhibitions/payments/proofs");

            const res = await fetch("/api/upload/proof", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok || !data.success || !data.secure_url) {
                throw new Error(data.error || "Failed to upload payment proof.");
            }

            setUploadedProofUrl(data.secure_url);
            return data.secure_url;
        } catch (err: any) {
            console.error("[Proof Upload Error]:", err);
            setUploadError(err?.message || "Failed to upload image. Please try again.");
            return null;
        } finally {
            setIsUploadingProof(false);
        }
    };

    const processSelectedFile = (file: File) => {
        const fileType = file.type?.toLowerCase() || "";
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/jpg"];
        const isImage = validTypes.includes(fileType) || fileType.startsWith("image/");

        if (!isImage) {
            setError("Please select a valid image file (PNG, JPG, JPEG, WEBP, or HEIC).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("The image file size exceeds the 10MB limit. Please choose a smaller screenshot.");
            return;
        }

        setError(null);
        setUploadError(null);
        setProofFile(file);

        // Instant local preview
        const localUrl = URL.createObjectURL(file);
        setProofPreview(localUrl);

        // Upload in the background immediately
        uploadFileToServer(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processSelectedFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processSelectedFile(file);
        }
    };

    const handleRemoveProof = () => {
        setProofFile(null);
        if (proofPreview) {
            URL.revokeObjectURL(proofPreview);
        }
        setProofPreview(null);
        setUploadedProofUrl(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedSender = senderAccountName.trim();

        if (!trimmedSender) {
            setError("Please enter the name on the bank account you used to transfer.");
            return;
        }

        if (!proofFile && !uploadedProofUrl) {
            setError("Please upload a screenshot or photo of your transfer receipt / debit alert as proof of payment.");
            return;
        }

        let finalProofUrl = uploadedProofUrl;

        // If file is selected but upload hasn't finished or failed, attempt upload now
        if (!finalProofUrl && proofFile) {
            finalProofUrl = await uploadFileToServer(proofFile);
            if (!finalProofUrl) {
                setError("Unable to upload payment proof. Please try uploading the image again.");
                return;
            }
        }

        setError(null);
        onSubmitPayment(trimmedSender, finalProofUrl || "");
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
                        <p>Complete transfer &amp; upload proof to secure your stand allocation</p>
                    </div>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        disabled={isSubmitting || isUploadingProof}
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
                                <span className="label">Amount Payable</span>
                                <span className="value amount-due">₦{amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="notice-box">
                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                            <p>
                                <strong>Instructions:</strong> Transfer exactly <strong>₦{amount.toLocaleString()}</strong> to the OPay account above. Then enter your account name and <strong>attach your transfer screenshot</strong> below so our team can immediately confirm and approve your stand.
                            </p>
                        </div>

                        {/* Form Fields: Sender Name & Proof Upload */}
                        <div className="transfer-form">
                            {/* 1. Sender Account Name */}
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
                                    Enter the exact account name that will appear on the Silo bank alert.
                                </span>
                            </div>

                            {/* 2. Proof of Payment Upload */}
                            <div className="form-group">
                                <label>
                                    Proof of Payment (Screenshot or Receipt Image) *
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileInputChange}
                                    style={{ display: "none" }}
                                    id="proof-file-input"
                                    disabled={isSubmitting}
                                />

                                {!proofFile ? (
                                    <div
                                        className={`proof-upload-dropzone ${isDragging ? "is-dragging" : ""}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="proof-upload-icon-circle">
                                            <UploadCloud size={24} color="#0015f8" />
                                        </div>
                                        <div className="proof-upload-text">
                                            <strong>Click to upload payment screenshot</strong> or drag &amp; drop
                                        </div>
                                        <span className="proof-upload-subtext">
                                            PNG, JPG, JPEG, WEBP, or HEIC (Up to 10MB)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="proof-preview-card">
                                        <div className="proof-preview-thumb">
                                            {proofPreview ? (
                                                <img src={proofPreview} alt="Payment proof preview" />
                                            ) : (
                                                <ImageIcon size={22} color="#64748b" />
                                            )}
                                        </div>

                                        <div className="proof-preview-info">
                                            <div className="proof-file-name" title={proofFile.name}>
                                                {proofFile.name}
                                            </div>
                                            <div className="proof-file-meta">
                                                <span>{formatFileSize(proofFile.size)}</span>
                                                <span className="meta-dot">&bull;</span>
                                                {isUploadingProof ? (
                                                    <span className="proof-status-uploading">
                                                        <Loader2 size={12} className="spin-icon" /> Uploading proof...
                                                    </span>
                                                ) : uploadedProofUrl ? (
                                                    <span className="proof-status-success">
                                                        <CheckCircle2 size={12} /> Uploaded &amp; Attached
                                                    </span>
                                                ) : uploadError ? (
                                                    <span className="proof-status-error">
                                                        Upload failed
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="proof-preview-actions">
                                            {uploadError && (
                                                <button
                                                    type="button"
                                                    className="proof-retry-btn"
                                                    onClick={() => uploadFileToServer(proofFile)}
                                                    disabled={isUploadingProof}
                                                    title="Retry Upload"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="proof-remove-btn"
                                                onClick={handleRemoveProof}
                                                disabled={isSubmitting || isUploadingProof}
                                                title="Remove this screenshot"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                                        {uploadError}
                                    </span>
                                )}

                                <span className="help-text">
                                    Attach a clear screenshot of your bank app successful transfer screen, debit alert, or receipt slip.
                                </span>
                            </div>

                            {/* General Error Banner */}
                            {error && (
                                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px", fontSize: "12.5px", color: "#b91c1c", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bank-transfer-modal__footer">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={!senderAccountName.trim() || (!proofFile && !uploadedProofUrl) || isSubmitting || isUploadingProof}
                        >
                            {isSubmitting || isUploadingProof ? (
                                <>
                                    <Loader2 size={18} className="spin-icon" /> Submitting Application...
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
                            disabled={isSubmitting || isUploadingProof}
                        >
                            Cancel / Modify Stand Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
