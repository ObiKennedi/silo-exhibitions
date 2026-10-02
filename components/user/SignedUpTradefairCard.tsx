"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  MapPin,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  QrCode,
  ArrowUpRight,
  CreditCard,
  FileText,
  MessageCircle,
} from "lucide-react";
import { DashboardVendorBooking } from "@/lib/vendor-registrations";

interface SignedUpTradefairCardProps {
  booking: DashboardVendorBooking;
  onOpenPass: (booking: DashboardVendorBooking) => void;
}

export function SignedUpTradefairCard({ booking, onOpenPass }: SignedUpTradefairCardProps) {
  const [copied, setCopied] = useState(false);

  const event = booking.event;
  const eventTitle = event?.title || booking.eventSlug;
  const eventSlug = booking.eventSlug;
  const venue = event?.venue || "Exhibition Arena / Venue";
  const imageSrc = event?.flierUrl || event?.coverImageUrl || "/hero/hero1.jpeg";

  // Calculate days remaining
  let countdownText = "";
  if (event?.startDate) {
    const diff = new Date(event.startDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) {
      countdownText = `Starts in ${days} day${days === 1 ? "" : "s"}`;
    } else if (days === 0) {
      countdownText = "Happening Today!";
    } else {
      countdownText = "Past Exhibition";
    }
  }

  const dateLabel = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Dates TBD";

  const isConfirmed = booking.paymentStatus === "SUCCESS";
  const isPending = booking.paymentStatus === "PENDING";

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedAmount = booking.dueNow
    ? `₦${booking.dueNow.toLocaleString()}`
    : "₦0";

  return (
    <article className="ud-booking-card">
      {/* Visual media banner */}
      <div className="ud-booking-card__visual">
        <Image
          src={imageSrc}
          alt={eventTitle}
          fill
          sizes="(max-width: 860px) 100vw, 280px"
          className="ud-booking-card__image"
          priority={false}
        />
        <div className="ud-booking-card__overlay">
          <span
            className={`ud-booking-card__status-pill ${
              isConfirmed
                ? "ud-booking-card__status-pill--success"
                : isPending
                ? "ud-booking-card__status-pill--pending"
                : "ud-booking-card__status-pill--failed"
            }`}
          >
            {isConfirmed ? (
              <>
                <CheckCircle2 size={13} /> Confirmed Stand
              </>
            ) : isPending ? (
              <>
                <Clock size={13} /> Payment Pending
              </>
            ) : (
              booking.paymentStatus
            )}
          </span>

          {countdownText && (
            <span className="ud-booking-card__days-countdown">
              <Clock size={13} /> {countdownText}
            </span>
          )}
        </div>
      </div>

      {/* Main card body */}
      <div className="ud-booking-card__content">
        <div className="ud-booking-card__head">
          <div>
            <h3 className="ud-booking-card__title">
              <Link href={`/${eventSlug}`}>
                {eventTitle}
              </Link>
            </h3>

            <div className="ud-booking-card__meta">
              <span className="ud-booking-card__meta-item">
                <CalendarDays size={14} color="var(--blue, #0015F8)" />
                {dateLabel}
              </span>
              <span className="ud-booking-card__meta-item">
                <MapPin size={14} color="var(--blue, #0015F8)" />
                {venue}
              </span>
            </div>
          </div>

          {/* Copyable booking code */}
          <button
            type="button"
            className="ud-booking-card__code-box"
            onClick={handleCopyCode}
            title="Click to copy booking code"
            aria-label={`Copy booking code ${booking.bookingCode}`}
          >
            {copied ? (
              <>
                <Check size={14} color="#0B7F58" />
                <span style={{ color: "#0B7F58" }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>{booking.bookingCode}</span>
              </>
            )}
          </button>
        </div>

        {/* Breakdown of stand, plan & business */}
        <div className="ud-booking-card__details-grid">
          <div className="ud-booking-card__detail">
            <span className="ud-booking-card__detail-label">Stand Option</span>
            <span className="ud-booking-card__detail-val">{booking.stallTitle}</span>
          </div>

          <div className="ud-booking-card__detail">
            <span className="ud-booking-card__detail-label">Payment Plan</span>
            <span className="ud-booking-card__detail-val">{booking.planName}</span>
          </div>

          <div className="ud-booking-card__detail">
            <span className="ud-booking-card__detail-label">Registered Brand</span>
            <span className="ud-booking-card__detail-val">{booking.businessName}</span>
          </div>

          <div className="ud-booking-card__detail">
            <span className="ud-booking-card__detail-label">Total Fee</span>
            <span
              className="ud-booking-card__detail-val"
              style={{ color: "var(--blue, #0015F8)", fontWeight: 700 }}
            >
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="ud-booking-card__actions">
          <div className="ud-booking-card__btn-group">
            <button
              type="button"
              className="ud-btn ud-btn--primary ud-btn--sm"
              onClick={() => onOpenPass(booking)}
            >
              <QrCode size={15} />
              View Stand Pass & QR
            </button>

            {isPending && (
              <Link
                href={`/${eventSlug}/apply-vendor`}
                className="ud-btn ud-btn--warning ud-btn--sm"
              >
                <CreditCard size={15} />
                Complete Payment
              </Link>
            )}

            {event?.exhibitionPlanDocUrl && (
              <a
                href={event.exhibitionPlanDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ud-btn ud-btn--outline ud-btn--sm"
              >
                <FileText size={15} />
                Floor Plan
              </a>
            )}

            {event?.whatsappUrl && (
              <a
                href={event.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ud-btn ud-btn--outline ud-btn--sm"
                title="Chat with organizers on WhatsApp"
              >
                <MessageCircle size={15} color="#0B7F58" />
                Support
              </a>
            )}
          </div>

          <Link
            href={`/${eventSlug}`}
            className="ud-btn ud-btn--secondary ud-btn--sm"
          >
            <span>Tradefair Details</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
