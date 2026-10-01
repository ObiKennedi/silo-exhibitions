"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Loader } from "@/components/essentials/Loader";
import {
  ShieldCheck,
  LogOut,
  Calendar,
  PlusCircle,
  ArrowLeft,
  Save,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
} from "lucide-react";

interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  venue: string;
  cashlessPolicy: string | null;
  importantTerms: string | null;
  status?: string;
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Terms & Events Management State
  const [events, setEvents] = React.useState<AdminEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [cashlessPolicy, setCashlessPolicy] = React.useState<string>("");
  const [importantTerms, setImportantTerms] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<{ success?: boolean; message?: string } | null>(null);

  // New Event Creation State
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newSlug, setNewSlug] = React.useState("");
  const [newVenue, setNewVenue] = React.useState("");
  const [newLocation, setNewLocation] = React.useState("");
  const [newCashlessPolicy, setNewCashlessPolicy] = React.useState(
    "All stalls are equipped with designated QR cashless paypoints for seamless campus sales."
  );
  const [newImportantTerms, setNewImportantTerms] = React.useState(
    "Stalls must be set up 2 hours before opening. All vendors must follow campus security guidelines and maintain their assigned booth spaces."
  );
  const [isCreating, setIsCreating] = React.useState(false);

  const fetchEvents = React.useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/admin/events/terms");
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
        if (data.events.length > 0) {
          const first = data.events[0];
          setSelectedEventId(first.id);
          setCashlessPolicy(first.cashlessPolicy || "");
          setImportantTerms(first.importantTerms || "");
        } else {
          setSelectedEventId("");
          setCashlessPolicy("");
          setImportantTerms("");
          setShowCreateForm(true); // Open creation form when database is empty
        }
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSaveStatus(null);
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      setCashlessPolicy(ev.cashlessPolicy || "");
      setImportantTerms(ev.importantTerms || "");
    }
  };

  const handleSaveTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/events/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          cashlessPolicy,
          importantTerms,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ success: true, message: "Terms and policies updated successfully!" });
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === selectedEventId
              ? { ...ev, cashlessPolicy, importantTerms }
              : ev
          )
        );
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to update terms." });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: "Network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim() || !newVenue.trim()) {
      alert("Please enter title, URL slug, and venue.");
      return;
    }

    setIsCreating(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/events/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: newTitle,
          slug: newSlug,
          venue: newVenue,
          location: newLocation || newVenue,
          cashlessPolicy: newCashlessPolicy,
          importantTerms: newImportantTerms,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.event) {
        setSaveStatus({ success: true, message: `Exhibition "${data.event.title}" created successfully!` });
        setShowCreateForm(false);
        setNewTitle("");
        setNewSlug("");
        setNewVenue("");
        setNewLocation("");
        await fetchEvents();
        setSelectedEventId(data.event.id);
        setCashlessPolicy(data.event.cashlessPolicy || "");
        setImportantTerms(data.event.importantTerms || "");
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to create exhibition." });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: "Failed to create exhibition due to network error." });
    } finally {
      setIsCreating(false);
    }
  };

  if (isPending) {
    return <Loader size="fullscreen" text="CHECKING PERMISSIONS..." kicker="admin portal ~" />;
  }

  if (!session?.user) {
    router.replace("/login");
    return null;
  }

  const role = (session.user.role as string | undefined)?.toUpperCase();
  const isAdmin =
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "EVENT_MANAGER" ||
    role === "GATE_STAFF" ||
    role === "LOGISTICS_LEAD";

  if (!isAdmin) {
    return (
      <main className="auth-page-wrapper">
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "#ffffff",
            borderRadius: 24,
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display, 'Anton', sans-serif)",
              fontSize: 28,
              textTransform: "uppercase",
              color: "var(--bad, #C7343A)",
              marginBottom: 12,
            }}
          >
            Access Restricted
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body, 'Poppins', sans-serif)",
              fontSize: 14,
              color: "var(--muted, #5B6485)",
              marginBottom: 24,
            }}
          >
            Your account does not possess administrator or staff privileges.
          </p>
          <Link
            href="/user"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 28px",
              borderRadius: 999,
              background: "var(--blue, #0015F8)",
              color: "#ffffff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Go to User Portal
          </Link>
        </div>
      </main>
    );
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--tint-2, #F4F8FF)",
        fontFamily: "var(--font-body, 'Poppins', sans-serif)",
        padding: "40px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--ink, #0A0F2E)",
              fontFamily: "var(--font-display, 'Anton', sans-serif)",
              fontSize: 22,
              textTransform: "uppercase",
            }}
          >
            <Image src="/favicon.png" alt="Silo" width={28} height={28} priority />
            <span>Silo Admin Console</span>
          </Link>

          <button
            onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 999,
              border: "1.5px solid var(--line, #DCE6F5)",
              background: "#ffffff",
              color: "var(--ink, #0A0F2E)",
              fontWeight: 600,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Admin Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid var(--line, #DCE6F5)",
            padding: "36px 32px",
            boxShadow: "0 10px 30px rgba(10, 15, 46, 0.05)",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-script, 'Caveat', cursive)",
              fontSize: 22,
              color: "var(--blue, #0015F8)",
              display: "block",
            }}
          >
            administrator access ~
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display, 'Anton', sans-serif)",
              fontSize: 34,
              textTransform: "uppercase",
              color: "var(--ink, #0A0F2E)",
              margin: "4px 0 16px",
            }}
          >
            STAFF &amp; ADMIN PORTAL
          </h1>
          <p style={{ color: "var(--muted, #5B6485)", fontSize: 14, maxWidth: 540 }}>
            Logged in as <strong>{session.user.email}</strong> with role{" "}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 999,
                background: "var(--tint, #EAF3FF)",
                color: "var(--blue, #0015F8)",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              <ShieldCheck size={14} />
              {role}
            </span>
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid var(--line, #DCE6F5)",
            }}
          >
            <Link
              href="/upcoming-exhibitions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderRadius: 14,
                background: "var(--tint-2, #F4F8FF)",
                border: "1.5px solid var(--line, #DCE6F5)",
                textDecoration: "none",
                color: "var(--ink, #0A0F2E)",
                fontWeight: 600,
              }}
            >
              <Calendar size={20} color="var(--blue, #0015F8)" />
              <span>Browse Exhibitions</span>
            </Link>

            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderRadius: 14,
                background: "var(--tint-2, #F4F8FF)",
                border: "1.5px solid var(--line, #DCE6F5)",
                textDecoration: "none",
                color: "var(--ink, #0A0F2E)",
                fontWeight: 600,
              }}
            >
              <PlusCircle size={20} color="var(--blue, #0015F8)" />
              <span>User Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Terms & Policy Manager Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 22,
            border: "1.5px solid var(--line, #DCE6F5)",
            padding: "36px 32px",
            boxShadow: "0 10px 30px rgba(10, 15, 46, 0.05)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--blue, #0015F8)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 4,
                }}
              >
                <FileText size={16} />
                <span>DYNAMIC CONTENT MANAGEMENT</span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display, 'Anton', sans-serif)",
                  fontSize: 26,
                  textTransform: "uppercase",
                  color: "var(--ink, #0A0F2E)",
                }}
              >
                EXHIBITION TERMS &amp; CASHLESS POLICY
              </h2>
              <p style={{ color: "var(--muted, #5B6485)", fontSize: 13.5, marginTop: 4 }}>
                Upload the important terms and cashless policies that appear dynamically on each exhibition micro-page and vendor stall registration form.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={fetchEvents}
                disabled={loadingEvents}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1.5px solid var(--line, #DCE6F5)",
                  background: "#ffffff",
                  color: "var(--ink, #0A0F2E)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={14} className={loadingEvents ? "spin" : ""} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: showCreateForm ? "var(--ink, #0A0F2E)" : "var(--blue, #0015F8)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
                <span>{showCreateForm ? "Close Form" : "Add Exhibition"}</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {saveStatus && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderRadius: 12,
                marginBottom: 20,
                background: saveStatus.success ? "#ecfdf5" : "#fef2f2",
                border: `1.5px solid ${saveStatus.success ? "#a7f3d0" : "#fecaca"}`,
                color: saveStatus.success ? "#065f46" : "#991b1b",
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              {saveStatus.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {/* Quick Create Exhibition Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateEvent}
              style={{
                background: "#f8fbff",
                border: "1.5px dashed #93c5fd",
                borderRadius: 16,
                padding: 24,
                marginBottom: 28,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display, 'Anton', sans-serif)",
                  fontSize: 18,
                  textTransform: "uppercase",
                  color: "#1e3a8a",
                  marginBottom: 14,
                }}
              >
                Create New Exhibition with Dynamic Terms
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1e3a8a", marginBottom: 4 }}>
                    Exhibition Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silo Trade Fair Owerri 2026"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]/g, "-"));
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #cbd5e1",
                      fontSize: 13.5,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1e3a8a", marginBottom: 4 }}>
                    Location URL Slug * (e.g. /owerri or /futo)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. owerri"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #cbd5e1",
                      fontSize: 13.5,
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1e3a8a", marginBottom: 4 }}>
                    Venue &amp; Hall *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Auditorium Hall"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #cbd5e1",
                      fontSize: 13.5,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1e3a8a", marginBottom: 4 }}>
                    City / Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Owerri, Imo State"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #cbd5e1",
                      fontSize: 13.5,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1e3a8a", marginBottom: 4 }}>
                  Important Terms &amp; Rules (Admin Notice)
                </label>
                <textarea
                  rows={3}
                  value={newImportantTerms}
                  onChange={(e) => setNewImportantTerms(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 13.5,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#1e3a8a", marginBottom: 4 }}>
                  Cashless &amp; QR Payment Policy
                </label>
                <textarea
                  rows={2}
                  value={newCashlessPolicy}
                  onChange={(e) => setNewCashlessPolicy(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 13.5,
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={isCreating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: "var(--blue, #0015F8)",
                    color: "#ffffff",
                    border: "none",
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={16} />
                  <span>{isCreating ? "Creating..." : "Save & Create Exhibition"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "#ffffff",
                    border: "1.5px solid #cbd5e1",
                    color: "#475569",
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Existing Events Terms Editor */}
          {events.length === 0 && !loadingEvents && !showCreateForm ? (
            <div
              style={{
                textAlign: "center",
                padding: "36px 20px",
                background: "var(--tint-2, #F4F8FF)",
                borderRadius: 16,
                border: "1.5px dashed var(--line, #DCE6F5)",
              }}
            >
              <p style={{ color: "var(--muted, #5B6485)", fontSize: 14, marginBottom: 14 }}>
                All dummy exhibitions were removed. Create your real exhibition using the button above.
              </p>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "var(--blue, #0015F8)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                <span>Create Exhibition Now</span>
              </button>
            </div>
          ) : events.length > 0 ? (
            <form onSubmit={handleSaveTerms}>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink, #0A0F2E)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  Select Exhibition to Configure
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => handleSelectEvent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line, #DCE6F5)",
                    background: "#ffffff",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--ink, #0A0F2E)",
                  }}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} (/{ev.slug}) — {ev.venue}
                    </option>
                  ))}
                </select>

                {selectedEvent && (
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 8,
                      fontSize: 12.5,
                      color: "var(--muted, #5B6485)",
                    }}
                  >
                    <Link
                      href={`/${selectedEvent.slug}`}
                      target="_blank"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--blue, #0015F8)",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      <span>View Exhibition Page (/{selectedEvent.slug})</span>
                      <ExternalLink size={12} />
                    </Link>
                    <span>&bull;</span>
                    <Link
                      href={`/${selectedEvent.slug}/apply-vendor`}
                      target="_blank"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--blue, #0015F8)",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      <span>View Trade Fair Registration</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Important Terms Upload Field */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink, #0A0F2E)",
                    marginBottom: 4,
                  }}
                >
                  Important Terms &amp; Conditions (Admin Upload)
                </label>
                <p style={{ fontSize: 12.5, color: "var(--muted, #5B6485)", marginBottom: 8 }}>
                  Uploaded by the admin. Displayed dynamically inside the registration agreement box on the vendor form and on the exhibition micro-page.
                </p>
                <textarea
                  rows={4}
                  value={importantTerms}
                  onChange={(e) => setImportantTerms(e.target.value)}
                  placeholder="e.g. All stalls must be set up by 8:00 AM. Noise amplification requires prior permit. Vendors are responsible for keeping booth perimeter clean..."
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line, #DCE6F5)",
                    background: "#ffffff",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Cashless & QR Code Policy Field */}
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink, #0A0F2E)",
                    marginBottom: 4,
                  }}
                >
                  Cashless &amp; Stall QR Code Policy (Dynamic)
                </label>
                <p style={{ fontSize: 12.5, color: "var(--muted, #5B6485)", marginBottom: 8 }}>
                  Replaces any hardcoded notices about QR codes or cashless policies with your custom admin policy.
                </p>
                <textarea
                  rows={3}
                  value={cashlessPolicy}
                  onChange={(e) => setCashlessPolicy(e.target.value)}
                  placeholder="e.g. All stalls are equipped with Silo instant QR cashless paypoints for seamless campus sales..."
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line, #DCE6F5)",
                    background: "#ffffff",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                    resize: "vertical",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || !selectedEventId}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 28px",
                  borderRadius: 12,
                  background: "var(--blue, #0015F8)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(0, 21, 248, 0.2)",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                <Save size={16} />
                <span>{isSaving ? "Saving Terms..." : "Save Important Terms & Policy"}</span>
              </button>
            </form>
          ) : null}
        </div>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--muted, #5B6485)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Public Home</span>
        </Link>
      </div>
    </main>
  );
}

