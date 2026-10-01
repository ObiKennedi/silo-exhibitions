"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Store,
  CalendarDays,
  CheckCircle2,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  HelpCircle,
  HeartHandshake,
  Receipt,
  Ticket,
} from "lucide-react";

import { DashboardVendorBooking, DashboardVolunteerApplication } from "@/lib/vendor-registrations";
import { UpcomingEvent } from "@/types/upcoming-event";
import { SignedUpTradefairCard } from "./SignedUpTradefairCard";
import { UpcomingTradefairCard } from "./UpcomingTradefairCard";
import { StallPassModal } from "./StallPassModal";

interface UserDashboardViewProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  registrations: DashboardVendorBooking[];
  volunteerApplications: DashboardVolunteerApplication[];
  upcomingEvents: UpcomingEvent[];
  initialView?: string;
}

type TabKey = "overview" | "bookings" | "upcoming" | "payments";

export function UserDashboardView({
  user,
  registrations,
  volunteerApplications,
  upcomingEvents,
  initialView = "overview",
}: UserDashboardViewProps) {
  // Normalize initial view parameter
  const validTab: TabKey =
    initialView === "bookings"
      ? "bookings"
      : initialView === "upcoming"
      ? "upcoming"
      : initialView === "payments"
      ? "payments"
      : "overview";

  const [activeTab, setActiveTab] = useState<TabKey>(validTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<"ALL" | "OPEN" | "SOON">("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"ALL" | "SUCCESS" | "PENDING">("ALL");
  const [selectedPass, setSelectedPass] = useState<DashboardVendorBooking | null>(null);

  // Friendly time greeting
  const greetingKicker = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning ~";
    if (hour < 17) return "Good afternoon ~";
    return "Good evening ~";
  }, []);

  const firstName = user.name ? user.name.split(" ")[0] : "Exhibitor";

  // Calculate metrics
  const confirmedCount = registrations.filter((r) => r.paymentStatus === "SUCCESS").length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === "PENDING").length;
  const totalSignups = registrations.length + volunteerApplications.length;

  // Set of event slugs user is registered for
  const registeredSlugs = useMemo(() => {
    const slugs = new Set<string>();
    registrations.forEach((r) => slugs.add(r.eventSlug));
    volunteerApplications.forEach((v) => slugs.add(v.eventSlug));
    return slugs;
  }, [registrations, volunteerApplications]);

  // Filtered upcoming events
  const filteredEvents = useMemo(() => {
    return upcomingEvents.filter((event) => {
      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        event.slug.toLowerCase().includes(q);

      // Status filter
      let matchesStatus = true;
      if (eventStatusFilter === "OPEN") {
        matchesStatus = event.status === "Registration open";
      } else if (eventStatusFilter === "SOON") {
        matchesStatus = event.status === "Coming soon";
      }

      return matchesSearch && matchesStatus;
    });
  }, [upcomingEvents, searchQuery, eventStatusFilter]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    if (bookingStatusFilter === "ALL") return registrations;
    return registrations.filter((r) => r.paymentStatus === bookingStatusFilter);
  }, [registrations, bookingStatusFilter]);

  // Handler to jump to a specific booking pass
  const handleOpenRegisteredPass = (eventSlug: string) => {
    const found = registrations.find((r) => r.eventSlug === eventSlug);
    if (found) {
      setSelectedPass(found);
    } else {
      setActiveTab("bookings");
    }
  };

  const scrollToSection = (id: string) => {
    setActiveTab("overview");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="ud-dashboard">
      {/* ── 1. Welcome Banner & Stat Highlights ─────────────────────────── */}
      <section className="ud-dashboard__welcome" aria-labelledby="ud-welcome-heading">
        <div className="ud-dashboard__welcome-top">
          <div className="ud-dashboard__welcome-copy">
            <span className="ud-dashboard__kicker">
              <Sparkles size={15} />
              {greetingKicker}
            </span>
            <h1 id="ud-welcome-heading" className="ud-dashboard__title">
              Welcome back, <mark>{firstName}</mark>!
              <span className="ud-dashboard__script">ready to exhibit?</span>
            </h1>
            <p className="ud-dashboard__sub">
              Manage your tradefair booth reservations, access your gate passes, and discover upcoming campus exhibitions across Nigeria.
            </p>
          </div>

          <div className="ud-dashboard__welcome-actions">
            <button
              type="button"
              className="ud-btn ud-btn--primary"
              onClick={() => {
                setActiveTab("upcoming");
                scrollToSection("all-upcoming-tradefairs");
              }}
            >
              <Store size={16} />
              Browse Upcoming Fairs
            </button>
            <button
              type="button"
              className="ud-btn ud-btn--secondary"
              onClick={() => {
                setActiveTab("bookings");
                scrollToSection("my-tradefairs");
              }}
            >
              <Ticket size={16} />
              My Bookings & Passes
            </button>
          </div>
        </div>

        {/* ── Stat Counters ────────────────────────────────────────────── */}
        <div className="ud-dashboard__stats">
          <div className="ud-dashboard__stat-card">
            <span className="ud-dashboard__stat-label">
              <Store size={14} color="#79BAFF" /> Stalls Reserved
            </span>
            <span className="ud-dashboard__stat-value">{registrations.length}</span>
            <span className="ud-dashboard__stat-hint">
              {registrations.length === 1 ? "1 campus exhibition" : `${registrations.length} exhibitions`}
            </span>
          </div>

          <div className="ud-dashboard__stat-card">
            <span className="ud-dashboard__stat-label">
              <CheckCircle2 size={14} color="#6EE7B7" /> Confirmed Spots
            </span>
            <span className="ud-dashboard__stat-value">{confirmedCount}</span>
            <span className="ud-dashboard__stat-hint">Allocated & verified</span>
          </div>

          <div className="ud-dashboard__stat-card">
            <span className="ud-dashboard__stat-label">
              <Clock size={14} color="#FDE047" /> Pending Action
            </span>
            <span className="ud-dashboard__stat-value">{pendingCount}</span>
            <span className="ud-dashboard__stat-hint">
              {pendingCount > 0 ? "Payment or review needed" : "All clear"}
            </span>
          </div>

          <div className="ud-dashboard__stat-card">
            <span className="ud-dashboard__stat-label">
              <CalendarDays size={14} color="#A5B4FC" /> Upcoming Fairs
            </span>
            <span className="ud-dashboard__stat-value">{upcomingEvents.length}</span>
            <span className="ud-dashboard__stat-hint">Campus tradefairs</span>
          </div>
        </div>
      </section>

      {/* ── 2. Top Nav Switcher Tabs ──────────────────────────────────────── */}
      <nav className="ud-dashboard__nav-tabs" aria-label="Dashboard views">
        <button
          type="button"
          className={`ud-dashboard__tab-btn ${
            activeTab === "overview" ? "ud-dashboard__tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <Sparkles size={16} />
          Overview
        </button>

        <button
          type="button"
          className={`ud-dashboard__tab-btn ${
            activeTab === "bookings" ? "ud-dashboard__tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("bookings")}
        >
          <Ticket size={16} />
          Tradefairs Signed Up
          <span className="ud-dashboard__tab-count">{totalSignups}</span>
        </button>

        <button
          type="button"
          className={`ud-dashboard__tab-btn ${
            activeTab === "upcoming" ? "ud-dashboard__tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          <Store size={16} />
          All Upcoming Tradefairs
          <span className="ud-dashboard__tab-count">{upcomingEvents.length}</span>
        </button>

        <button
          type="button"
          className={`ud-dashboard__tab-btn ${
            activeTab === "payments" ? "ud-dashboard__tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("payments")}
        >
          <Receipt size={16} />
          Invoices & Payments
        </button>
      </nav>

      {/* ── 3. Tradefairs You've Signed Up For Section ────────────────────── */}
      {(activeTab === "overview" || activeTab === "bookings") && (
        <section id="my-tradefairs" className="ud-dashboard__section" aria-labelledby="my-signups-heading">
          <div className="ud-dashboard__section-head">
            <div>
              <h2 id="my-signups-heading" className="ud-dashboard__section-title">
                Tradefairs You&apos;ve Signed Up For
                <span className="ud-dashboard__section-badge">
                  {registrations.length} {registrations.length === 1 ? "Booking" : "Bookings"}
                </span>
              </h2>
              <p className="ud-dashboard__section-desc">
                Your booked exhibition stalls, official gate passes, booth credentials, and payment records.
              </p>
            </div>

            {registrations.length > 0 && (
              <div className="ud-dashboard__filters">
                <button
                  type="button"
                  className={`ud-dashboard__chip ${
                    bookingStatusFilter === "ALL" ? "ud-dashboard__chip--active" : ""
                  }`}
                  onClick={() => setBookingStatusFilter("ALL")}
                >
                  All ({registrations.length})
                </button>
                <button
                  type="button"
                  className={`ud-dashboard__chip ${
                    bookingStatusFilter === "SUCCESS" ? "ud-dashboard__chip--active" : ""
                  }`}
                  onClick={() => setBookingStatusFilter("SUCCESS")}
                >
                  Confirmed ({confirmedCount})
                </button>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    className={`ud-dashboard__chip ${
                      bookingStatusFilter === "PENDING" ? "ud-dashboard__chip--active" : ""
                    }`}
                    onClick={() => setBookingStatusFilter("PENDING")}
                  >
                    Pending ({pendingCount})
                  </button>
                )}
              </div>
            )}
          </div>

          {registrations.length === 0 && volunteerApplications.length === 0 ? (
            <div className="ud-dashboard__empty">
              <div className="ud-dashboard__empty-icon">
                <Store size={32} />
              </div>
              <h3 className="ud-dashboard__empty-title">You haven&apos;t booked a stall yet</h3>
              <p className="ud-dashboard__empty-desc">
                Reserve your exhibition booth at one of our upcoming campus tradefairs to showcase your brand, make sales, and reach thousands of student buyers.
              </p>
              <button
                type="button"
                className="ud-btn ud-btn--primary"
                onClick={() => {
                  setActiveTab("upcoming");
                  scrollToSection("all-upcoming-tradefairs");
                }}
              >
                Explore Upcoming Tradefairs
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="ud-dashboard__bookings-list">
              {filteredRegistrations.map((booking) => (
                <SignedUpTradefairCard
                  key={booking.id}
                  booking={booking}
                  onOpenPass={(b) => setSelectedPass(b)}
                />
              ))}

              {/* Also show volunteer applications if user has any */}
              {volunteerApplications.map((vol) => (
                <article
                  key={vol.id}
                  className="ud-booking-card"
                  style={{ borderLeft: "4px solid #1D2FB5" }}
                >
                  <div className="ud-booking-card__content" style={{ gridColumn: "1 / -1" }}>
                    <div className="ud-booking-card__head">
                      <div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: "#EAF3FF",
                            color: "#0015F8",
                            marginBottom: "8px",
                            textTransform: "uppercase",
                          }}
                        >
                          <HeartHandshake size={13} />
                          Volunteer Crew Member
                        </span>
                        <h3 className="ud-booking-card__title">
                          {vol.event?.title || vol.eventSlug}
                        </h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted, #5B6485)" }}>
                          Role: <strong>{vol.primaryRole}</strong> · Volunteer Code:{" "}
                          <code>{vol.volunteerCode}</code>
                        </p>
                      </div>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: vol.status === "APPROVED" ? "#E4F7EF" : "#FFF6DD",
                          color: vol.status === "APPROVED" ? "#0B7F58" : "#8A5A00",
                        }}
                      >
                        {vol.status === "APPROVED" ? "Crew Approved" : "Application Under Review"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. All Upcoming Tradefairs Section ───────────────────────────── */}
      {(activeTab === "overview" || activeTab === "upcoming") && (
        <section id="all-upcoming-tradefairs" className="ud-dashboard__section" aria-labelledby="all-upcoming-heading">
          <div className="ud-dashboard__section-head">
            <div>
              <h2 id="all-upcoming-heading" className="ud-dashboard__section-title">
                All Upcoming Tradefairs
                <span className="ud-dashboard__section-badge">
                  {upcomingEvents.length} {upcomingEvents.length === 1 ? "Event" : "Events"}
                </span>
              </h2>
              <p className="ud-dashboard__section-desc">
                Discover all upcoming exhibitions, apply for vendor booths, or join the campus event team.
              </p>
            </div>

            {/* Live Search & Status Filters */}
            <div className="ud-dashboard__toolbar">
              <div className="ud-dashboard__search-wrap">
                <Search size={16} className="ud-dashboard__search-icon" />
                <input
                  type="text"
                  placeholder="Search tradefairs by name, campus, or venue…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ud-dashboard__search-input"
                  aria-label="Search tradefairs"
                />
              </div>

              <div className="ud-dashboard__filters">
                <button
                  type="button"
                  className={`ud-dashboard__chip ${
                    eventStatusFilter === "ALL" ? "ud-dashboard__chip--active" : ""
                  }`}
                  onClick={() => setEventStatusFilter("ALL")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`ud-dashboard__chip ${
                    eventStatusFilter === "OPEN" ? "ud-dashboard__chip--active" : ""
                  }`}
                  onClick={() => setEventStatusFilter("OPEN")}
                >
                  Open for Booking
                </button>
                <button
                  type="button"
                  className={`ud-dashboard__chip ${
                    eventStatusFilter === "SOON" ? "ud-dashboard__chip--active" : ""
                  }`}
                  onClick={() => setEventStatusFilter("SOON")}
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="ud-dashboard__empty">
              <p className="ud-dashboard__empty-desc">
                {searchQuery
                  ? `No upcoming tradefairs match "${searchQuery}". Try a different keyword.`
                  : "No upcoming exhibitions currently match this filter."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  className="ud-btn ud-btn--secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setEventStatusFilter("ALL");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="ud-dashboard__events-grid">
              {filteredEvents.map((event) => {
                const isUserRegistered = registeredSlugs.has(event.slug);
                return (
                  <UpcomingTradefairCard
                    key={event.id}
                    event={event}
                    isRegistered={isUserRegistered}
                    onViewRegisteredPass={() => handleOpenRegisteredPass(event.slug)}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── 5. Invoices & Payments View ──────────────────────────────────── */}
      {activeTab === "payments" && (
        <section className="ud-dashboard__section" aria-labelledby="payments-heading">
          <div className="ud-dashboard__section-head">
            <div>
              <h2 id="payments-heading" className="ud-dashboard__section-title">
                Invoices & Payment Records
              </h2>
              <p className="ud-dashboard__section-desc">
                Keep track of your booth registration receipts, payment references, and transaction IDs.
              </p>
            </div>
          </div>

          {registrations.length === 0 ? (
            <div className="ud-dashboard__empty">
              <div className="ud-dashboard__empty-icon">
                <Receipt size={32} />
              </div>
              <h3 className="ud-dashboard__empty-title">No transactions yet</h3>
              <p className="ud-dashboard__empty-desc">
                When you reserve a stall or complete payments for a tradefair, all receipts and references will be listed here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {registrations.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "#FFFFFF",
                    padding: "20px 24px",
                    borderRadius: "16px",
                    border: "1px solid var(--line, #DCE6F5)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "14px", color: "var(--blue, #0015F8)" }}>
                        {r.bookingCode}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 700,
                          background: r.paymentStatus === "SUCCESS" ? "#E4F7EF" : "#FFF6DD",
                          color: r.paymentStatus === "SUCCESS" ? "#0B7F58" : "#8A5A00",
                        }}
                      >
                        {r.paymentStatus === "SUCCESS" ? "PAID" : "PENDING"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--ink, #0A0F2E)" }}>
                      {r.event?.title || r.eventSlug} — {r.stallTitle}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted, #5B6485)" }}>
                      Ref: {r.paymentReference || "N/A"} · Plan: {r.planName}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink, #0A0F2E)", display: "block" }}>
                      ₦{r.dueNow.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      className="ud-btn ud-btn--secondary ud-btn--sm"
                      style={{ marginTop: "6px" }}
                      onClick={() => setSelectedPass(r)}
                    >
                      View Receipt / Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 6. WhatsApp Logistics & Help Card ─────────────────────────────── */}
      <aside
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "24px 28px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
          border: "1px solid #BBF7D0",
          color: "#166534",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#16A34A",
              color: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <MessageCircle size={24} />
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "#14532D" }}>
              Need Help With Your Stall or Tradefair Setup?
            </h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#166534", maxWidth: "600px" }}>
              Our campus exhibition logistics team is available on WhatsApp to answer questions about booth allocations, power connections, signage, or invoices.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/2348000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="ud-btn ud-btn--success"
        >
          <MessageCircle size={16} />
          Chat on WhatsApp
        </a>
      </aside>

      {/* ── 7. Digital Stall Pass Modal ───────────────────────────────────── */}
      <StallPassModal
        booking={selectedPass}
        onClose={() => setSelectedPass(null)}
      />
    </div>
  );
}
