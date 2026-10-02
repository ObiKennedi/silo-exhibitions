"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Printer, CheckCircle2, Calendar, MapPin, Building, ShieldCheck, QrCode } from "lucide-react";
import { DashboardVendorBooking } from "@/lib/vendor-registrations";

interface StallPassModalProps {
  booking: DashboardVendorBooking | null;
  onClose: () => void;
}

export function StallPassModal({ booking, onClose }: StallPassModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (booking) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [booking, onClose]);

  if (!booking) return null;

  const eventTitle = booking.event?.title || booking.eventSlug;
  const venue = booking.event?.venue || "Exhibition Arena / Venue";
  const dateStr = booking.event?.startDate
    ? new Date(booking.event.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Dates announced soon";

  const isConfirmed = booking.paymentStatus === "SUCCESS";

  return (
    <div className="ud-pass-modal" role="dialog" aria-modal="true" aria-labelledby="stall-pass-title">
      <div className="ud-pass-modal__scrim" onClick={onClose} />

      <div className="ud-pass-modal__dialog">
        <header className="ud-pass-modal__header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={20} color="var(--blue, #0015F8)" />
            <h3 id="stall-pass-title" className="ud-pass-modal__header-title">
              Official Exhibitor Pass
            </h3>
          </div>
          <button
            type="button"
            className="ud-icon-button"
            onClick={onClose}
            aria-label="Close pass"
          >
            <X size={20} />
          </button>
        </header>

        <div className="ud-pass-modal__pass-badge">
          <div className="ud-pass-modal__pass-top">
            <div>
              <span className="ud-pass-modal__pass-brand">SILO EXHIBITIONS</span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Tradefair Credential
              </p>
            </div>
            <span
              className="ud-pass-modal__pass-status"
              style={{
                background: isConfirmed ? "#0B7F58" : "#DC8200",
              }}
            >
              {isConfirmed ? "VERIFIED EXHIBITOR" : "PENDING ALLOCATION"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                Event / Tradefair
              </p>
              <h4 style={{ margin: 0, fontFamily: "var(--font-display, Anton, sans-serif)", fontSize: "18px", color: "#0A0F2E" }}>
                {eventTitle}
              </h4>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                  Business Name
                </p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0A0F2E" }}>
                  {booking.businessName}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                  Exhibitor Category
                </p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#0A0F2E" }}>
                  {booking.category}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#FFFFFF", padding: "12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                  Allocated Stand
                </p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#0015F8" }}>
                  {booking.stallTitle}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 600 }}>
                  Payment Plan
                </p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0A0F2E" }}>
                  {booking.planName}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "#475569" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={14} color="#0015F8" /> {dateStr}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={14} color="#0015F8" /> {venue}
              </span>
            </div>

            {/* Simulated QR & Barcode */}
            <div className="ud-pass-modal__pass-barcode">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0A0F2E" }}>
                <QrCode size={18} />
                <span style={{ fontSize: "12px", fontWeight: 700 }}>GATE CLEARANCE CODE</span>
              </div>
              <div className="ud-pass-modal__pass-barcode-lines" aria-hidden="true" />
              <span className="ud-pass-modal__pass-barcode-code">{booking.bookingCode}</span>
            </div>

            {/* Checklist */}
            <div style={{ padding: "12px", background: "#EFF6FF", borderRadius: "10px", fontSize: "12px", color: "#1E3A8A", lineHeight: 1.5 }}>
              <p style={{ fontWeight: 700, margin: "0 0 4px" }}>Exhibitor Entry Protocol:</p>
              <ul style={{ margin: 0, paddingLeft: "16px" }}>
                <li>Present this digital pass or physical printout at the vendor gate.</li>
                <li>Booth setup starts at 8:00 AM on opening day.</li>
                <li>All sales are subject to Silo cashless tradefair policy.</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="ud-pass-modal__footer">
          <button
            type="button"
            className="ud-btn ud-btn--outline"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print Pass
          </button>
          <button
            type="button"
            className="ud-btn ud-btn--primary"
            onClick={onClose}
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
