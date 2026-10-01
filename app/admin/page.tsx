"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Loader } from "@/components/essentials/Loader";
import {
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Users,
  LogOut,
  ExternalLink,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Mail,
  Search,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Wallet,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Globe,
  UploadCloud,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Tag,
} from "lucide-react";

import "@/styles/admin/AdminDashboard.scss";

type TabType = "overview" | "events" | "gallery" | "users";

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  publishedEvents: number;
  totalVendorApplications: number;
  totalRevenue: number;
  totalGalleryItems: number;
}

interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  venue: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  writeUp?: string | null;
  coverImageUrl?: string | null;
  flierUrl?: string | null;
  cashlessPolicy?: string | null;
  importantTerms?: string | null;
  whatsappUrl?: string | null;
  _count?: {
    vendorApplications: number;
    volunteerApplications: number;
    media: number;
  };
}

interface UserTradefairApplication {
  id: string;
  bookingCode: string;
  businessName: string;
  category: string;
  contactName: string;
  email: string;
  phone: string;
  instagram?: string | null;
  stallTitle: string;
  stallNumber?: string | null;
  merchandiseDesc?: string | null;
  planName: string;
  dueNow: number;
  paidAmount: number;
  paymentStatus: string;
  paymentReference?: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
    venue: string;
    startDate: string;
  } | null;
}

interface UserVolunteerApplication {
  id: string;
  volunteerCode: string;
  fullName: string;
  email: string;
  phone: string;
  primaryRole: string;
  institution?: string | null;
  daysAvailable?: string | null;
  status: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
    venue: string;
  } | null;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  emailVerified: boolean;
  createdAt: string;
  vendorApplications?: UserTradefairApplication[];
  volunteerApplications?: UserVolunteerApplication[];
  totalTradefairsCount?: number;
  totalSpent?: number;
}

interface AdminMedia {
  id: string;
  eventId: string;
  url: string;
  type: string;
  caption?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
  };
}

interface RecentApp {
  id: string;
  bookingCode: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  stallTitle: string;
  paidAmount: number;
  paymentStatus: string;
  createdAt: string;
  event: {
    title: string;
    slug: string;
  };
}

export default function AdminDashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    publishedEvents: 0,
    totalVendorApplications: 0,
    totalRevenue: 0,
    totalGalleryItems: 0,
  });
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [gallery, setGallery] = useState<AdminMedia[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApp[]>([]);

  // Feedback Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // New Event Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newWriteUp, setNewWriteUp] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newFlierUrl, setNewFlierUrl] = useState("");
  const [newCashlessPolicy, setNewCashlessPolicy] = useState(
    "All stalls are equipped with designated QR cashless paypoints for seamless campus sales."
  );
  const [newImportantTerms, setNewImportantTerms] = useState(
    "All stalls must be set up 2 hours before opening. Vendors are responsible for keeping booth area clean."
  );
  const [newWhatsappUrl, setNewWhatsappUrl] = useState("https://wa.me/2349063508366");
  const [notifyUsersWithResend, setNotifyUsersWithResend] = useState(true);

  // Selected Event for Terms & Policy editing
  const [editingTermsEventId, setEditingTermsEventId] = useState<string>("");
  const [editCashless, setEditCashless] = useState("");
  const [editTerms, setEditTerms] = useState("");
  const [isSavingTerms, setIsSavingTerms] = useState(false);

  // Gallery Add Form State
  const [galleryEventId, setGalleryEventId] = useState("");
  const [galleryMediaUrl, setGalleryMediaUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryType, setGalleryType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  // Users Filter & Search
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  // Selected User for History Modal & Overview Search
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalTab, setModalTab] = useState<"tradefairs" | "volunteers" | "profile">("tradefairs");
  const [overviewUserSearch, setOverviewUserSearch] = useState("");
  const [overviewFilter, setOverviewFilter] = useState<"ALL" | "TRADEFAIRS" | "VOLUNTEERS">("ALL");
  const [copiedBookingCode, setCopiedBookingCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBookingCode(code);
    setTimeout(() => setCopiedBookingCode(null), 2000);
  };

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setEvents(data.events || []);
        setUsers(data.users || []);
        setGallery(data.gallery || []);
        setRecentApplications(data.recentApplications || []);

        if (data.events && data.events.length > 0 && !editingTermsEventId) {
          const first = data.events[0];
          setEditingTermsEventId(first.id);
          setEditCashless(first.cashlessPolicy || "");
          setEditTerms(first.importantTerms || "");
          setGalleryEventId(first.id);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setNotification({
        type: "error",
        message: "Failed to connect to admin API.",
      });
    } finally {
      setLoading(false);
    }
  }, [editingTermsEventId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Event Creation with Resend Auto-Broadcast
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim() || !newVenue.trim()) {
      alert("Please provide title, URL slug, and venue.");
      return;
    }

    setIsSubmittingEvent(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: newTitle,
          slug: newSlug,
          venue: newVenue,
          location: newLocation || newVenue,
          startDate: newStartDate || undefined,
          endDate: newEndDate || undefined,
          writeUp: newWriteUp,
          coverImageUrl: newCoverUrl || undefined,
          flierUrl: newFlierUrl || undefined,
          cashlessPolicy: newCashlessPolicy,
          importantTerms: newImportantTerms,
          whatsappUrl: newWhatsappUrl || undefined,
          notifyUsers: notifyUsersWithResend,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        let msg = `Exhibition "${data.event.title}" created successfully!`;
        if (data.broadcastResult?.sentCount) {
          msg += ` Automatically dispatched announcement emails via Resend to ${data.broadcastResult.sentCount} users!`;
        } else if (data.broadcastResult?.simulated) {
          msg += ` (Resend email simulation ran for ${data.broadcastResult.totalUsers} users).`;
        }
        setNotification({ type: "success", message: msg });

        // Reset Form
        setShowEventModal(false);
        setNewTitle("");
        setNewSlug("");
        setNewVenue("");
        setNewLocation("");
        setNewStartDate("");
        setNewEndDate("");
        setNewWriteUp("");
        setNewCoverUrl("");
        setNewFlierUrl("");

        await fetchDashboardData();
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to create exhibition.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "An error occurred creating exhibition.",
      });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Handle Toggle Publish/Draft
  const handleToggleStatus = async (ev: AdminEvent) => {
    const nextStatus = ev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: ev.id,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message: `Exhibition "${ev.title}" is now ${nextStatus}.`,
        });
        await fetchDashboardData();
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to update status." });
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (ev: AdminEvent) => {
    if (!confirm(`Are you sure you want to delete "${ev.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: ev.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: "success", message: `Exhibition deleted.` });
        await fetchDashboardData();
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to delete event." });
    }
  };

  // Handle Save Terms & Policy
  const handleSaveTerms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTermsEventId) return;

    setIsSavingTerms(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/events/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: editingTermsEventId,
          cashlessPolicy: editCashless,
          importantTerms: editTerms,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message: "Terms and Cashless Policy updated successfully!",
        });
        await fetchDashboardData();
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to update terms.",
        });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to update terms." });
    } finally {
      setIsSavingTerms(false);
    }
  };

  // Handle Add Gallery Media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryEventId || !galleryMediaUrl.trim()) {
      alert("Please select an exhibition and provide an image/video URL.");
      return;
    }

    setIsAddingMedia(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          eventId: galleryEventId,
          url: galleryMediaUrl,
          type: galleryType,
          caption: galleryCaption,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message: "Media item added to gallery successfully!",
        });
        setGalleryMediaUrl("");
        setGalleryCaption("");
        await fetchDashboardData();
      } else {
        setNotification({ type: "error", message: data.error || "Failed to add media." });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to add media." });
    } finally {
      setIsAddingMedia(false);
    }
  };

  // Handle Delete Media
  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: mediaId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: "success", message: "Media deleted." });
        await fetchDashboardData();
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to delete media." });
    }
  };

  // Handle User Role Change
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateRole", userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: "success",
          message: `User role updated to ${newRole}.`,
        });
        await fetchDashboardData();
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to change user role." });
    }
  };

  // Auth Guards
  if (isPending) {
    return <Loader size="fullscreen" text="LOADING ADMIN DASHBOARD..." kicker="silo console ~" />;
  }

  if (!session?.user) {
    router.replace("/login");
    return null;
  }

  const userRole = (session.user.role as string | undefined)?.toUpperCase();
  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "EVENT_MANAGER" ||
    userRole === "GATE_STAFF" ||
    userRole === "LOGISTICS_LEAD";

  if (!isAdmin) {
    return (
      <main className="auth-page-wrapper">
        <div style={{ maxWidth: 460, width: "100%", background: "#fff", borderRadius: 20, padding: 36, textAlign: "center" }}>
          <h1 style={{ color: "#dc2626", fontFamily: "var(--font-display, sans-serif)", fontSize: 26 }}>ACCESS DENIED</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: "12px 0 20px" }}>
            Your account does not possess administrator privileges.
          </p>
          <Link href="/" className="btn-primary">Return to Public Site</Link>
        </div>
      </main>
    );
  }

  // Filtered Users (Users Tab)
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(userQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(userQuery.toLowerCase());
    const matchesRole =
      userRoleFilter === "ALL" ||
      (u.role || "user").toUpperCase() === userRoleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  // Overview Filtered Users (Overview Board)
  const overviewFilteredUsers = users.filter((u) => {
    const q = overviewUserSearch.trim().toLowerCase();
    const fairsCount = (u.vendorApplications?.length || 0) + (u.totalTradefairsCount || 0);
    const volunteersCount = u.volunteerApplications?.length || 0;

    if (overviewFilter === "TRADEFAIRS" && fairsCount === 0) return false;
    if (overviewFilter === "VOLUNTEERS" && volunteersCount === 0) return false;

    if (!q) return true;

    const matchesName = (u.name || "").toLowerCase().includes(q);
    const matchesEmail = (u.email || "").toLowerCase().includes(q);
    const matchesApps = u.vendorApplications?.some(
      (app) =>
        (app.businessName || "").toLowerCase().includes(q) ||
        (app.bookingCode || "").toLowerCase().includes(q) ||
        (app.stallTitle || "").toLowerCase().includes(q) ||
        (app.event?.title && app.event.title.toLowerCase().includes(q))
    );

    return matchesName || matchesEmail || !!matchesApps;
  });

  return (
    <div className="admin-shell">
      {/* Mobile Drawer Overlay */}
      <div
        className={`admin-overlay ${sidebarOpen ? "is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR NAVIGATION ───────────────────────────────────── */}
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <Link href="/" className="admin-sidebar__brand">
          <Image src="/favicon.png" alt="Silo Logo" width={30} height={30} priority />
          <div>
            <span>SILO CONSOLE</span>
            <small>Admin Dashboard</small>
          </div>
        </Link>

        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={`admin-sidebar__link ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${activeTab === "events" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("events");
              setSidebarOpen(false);
            }}
          >
            <Calendar size={18} />
            <span>Events</span>
            <span className="badge">{events.length}</span>
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${activeTab === "gallery" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("gallery");
              setSidebarOpen(false);
            }}
          >
            <ImageIcon size={18} />
            <span>Gallery</span>
            <span className="badge">{gallery.length}</span>
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${activeTab === "users" ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab("users");
              setSidebarOpen(false);
            }}
          >
            <Users size={18} />
            <span>Users</span>
            <span className="badge">{users.length}</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user-box">
            <div className="admin-sidebar__avatar">
              {session.user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="admin-sidebar__meta">
              <p>{session.user.name || "Administrator"}</p>
              <small>{userRole}</small>
            </div>
          </div>

          <div className="admin-sidebar__actions">
            <Link href="/" target="_blank" className="action-web">
              <Globe size={14} />
              <span>Public Site</span>
            </Link>
            <button
              onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
              className="action-logout"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────── */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              type="button"
              className="admin-topbar__menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="admin-topbar__title">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "events" && "Exhibitions & Events"}
                {activeTab === "gallery" && "Media Gallery"}
                {activeTab === "users" && "User Directory"}
              </h1>
              <p className="admin-topbar__subtitle">
                {activeTab === "overview" && "Key platform metrics, vendor registrations, and quick stats."}
                {activeTab === "events" && "Manage exhibitions, upload dynamic terms, and broadcast with Resend."}
                {activeTab === "gallery" && "Organize exhibition photos, fliers, and showcase media assets."}
                {activeTab === "users" && "View registered accounts, verify statuses, and manage access roles."}
              </p>
            </div>
          </div>

          <div className="admin-topbar__actions">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="btn-secondary"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Sync</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("events");
                setShowEventModal(true);
              }}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>Create Event</span>
            </button>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notification && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 14,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: notification.type === "success" ? "#ecfdf5" : "#fef2f2",
              border: `1.5px solid ${notification.type === "success" ? "#a7f3d0" : "#fecaca"}`,
              color: notification.type === "success" ? "#065f46" : "#991b1b",
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            {notification.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ flex: 1 }}>{notification.message}</span>
            <button
              type="button"
              onClick={() => setNotification(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 1. OVERVIEW TAB                                             */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Stat Cards Grid */}
            <div className="admin-stats-grid">
              <div className="stat-card">
                <div className="stat-card__top">
                  <div className="stat-card__icon"><Users size={20} /></div>
                  <span className="stat-card__pill">Live</span>
                </div>
                <div className="stat-card__val">{stats.totalUsers}</div>
                <div className="stat-card__lbl">Registered Users</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__top">
                  <div className="stat-card__icon"><Calendar size={20} /></div>
                  <span className="stat-card__pill">{stats.publishedEvents} Published</span>
                </div>
                <div className="stat-card__val">{stats.totalEvents}</div>
                <div className="stat-card__lbl">Total Exhibitions</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__top">
                  <div className="stat-card__icon"><Sparkles size={20} /></div>
                  <span className="stat-card__pill">Applications</span>
                </div>
                <div className="stat-card__val">{stats.totalVendorApplications}</div>
                <div className="stat-card__lbl">Vendor Stall Bookings</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__top">
                  <div className="stat-card__icon"><Wallet size={20} /></div>
                  <span className="stat-card__pill">Monnify</span>
                </div>
                <div className="stat-card__val">
                  ₦{stats.totalRevenue > 0 ? (stats.totalRevenue / 1000).toLocaleString() + "k" : "0"}
                </div>
                <div className="stat-card__lbl">Total Processed Revenue</div>
              </div>
            </div>

            {/* ── OVERVIEW BOARD: USERS & TRADE FAIR PARTICIPATION ──────── */}
            <div className="admin-card" style={{ marginBottom: 24 }}>
              <div className="admin-card__head" style={{ flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={22} color="#0015f8" />
                    <h3 style={{ margin: 0 }}>Platform Users &amp; Trade Fair History</h3>
                    <span className="status-badge is-published" style={{ marginLeft: 6 }}>
                      {users.length} Users
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0" }}>
                    Click on any user below to inspect their full trade fair registrations, booking codes, stall packages, and payment history.
                  </p>
                </div>

                {/* Filter and Search controls */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="Search name, email, booking code..."
                      value={overviewUserSearch}
                      onChange={(e) => setOverviewUserSearch(e.target.value)}
                      style={{
                        padding: "8px 12px 8px 32px",
                        borderRadius: 10,
                        border: "1.5px solid #cbd5e1",
                        fontSize: 13,
                        minWidth: 260,
                      }}
                    />
                    {overviewUserSearch && (
                      <button
                        type="button"
                        onClick={() => setOverviewUserSearch("")}
                        style={{
                          position: "absolute",
                          right: 8,
                          top: 8,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          padding: 2,
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 3, borderRadius: 10 }}>
                    <button
                      type="button"
                      onClick={() => setOverviewFilter("ALL")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: overviewFilter === "ALL" ? "#ffffff" : "transparent",
                        color: overviewFilter === "ALL" ? "#0015f8" : "#64748b",
                        boxShadow: overviewFilter === "ALL" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      All ({users.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverviewFilter("TRADEFAIRS")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: overviewFilter === "TRADEFAIRS" ? "#ffffff" : "transparent",
                        color: overviewFilter === "TRADEFAIRS" ? "#0015f8" : "#64748b",
                        boxShadow: overviewFilter === "TRADEFAIRS" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Vendors ({users.filter((u) => ((u.vendorApplications?.length || 0) + (u.totalTradefairsCount || 0)) > 0).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverviewFilter("VOLUNTEERS")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: overviewFilter === "VOLUNTEERS" ? "#ffffff" : "transparent",
                        color: overviewFilter === "VOLUNTEERS" ? "#0015f8" : "#64748b",
                        boxShadow: overviewFilter === "VOLUNTEERS" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      Volunteers ({users.filter((u) => (u.volunteerApplications?.length || 0) > 0).length})
                    </button>
                  </div>
                </div>
              </div>

              {overviewFilteredUsers.length === 0 ? (
                <div className="empty-user-history" style={{ margin: "16px 0" }}>
                  <Users size={32} color="#94a3b8" />
                  <h4>No users found</h4>
                  <p>Try adjusting your search query or switching filters.</p>
                </div>
              ) : (
                <div className="admin-table-wrap" style={{ marginTop: 12 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Trade Fairs Booked</th>
                        <th>Total Paid</th>
                        <th>Joined</th>
                        <th style={{ textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewFilteredUsers.map((u) => {
                        const fairsCount = (u.vendorApplications?.length ?? u.totalTradefairsCount) || 0;
                        const spent = u.totalSpent || 0;
                        const initial = (u.name || u.email || "U").charAt(0).toUpperCase();

                        return (
                          <tr
                            key={u.id}
                            className="user-row-clickable"
                            onClick={() => {
                              setSelectedUser(u);
                              setModalTab("tradefairs");
                            }}
                            title="Click to view full user history & trade fair registrations"
                          >
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div className="overview-user-avatar">
                                  {initial}
                                </div>
                                <div>
                                  <strong style={{ color: "#0a0f2e", fontSize: 13.5 }}>{u.name || "Unnamed User"}</strong>
                                  <div style={{ color: "#64748b", fontSize: 12 }}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  (u.role || "user").toUpperCase() === "ADMIN" ? "is-admin" : "is-user"
                                }`}
                              >
                                {(u.role || "user").toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {fairsCount > 0 ? (
                                <span className="status-badge is-published" style={{ fontWeight: 700 }}>
                                  {fairsCount} {fairsCount === 1 ? "Trade Fair" : "Trade Fairs"}
                                </span>
                              ) : (
                                <span style={{ color: "#94a3b8", fontSize: 12.5 }}>0 fairs</span>
                              )}
                            </td>
                            <td>
                              <strong style={{ color: spent > 0 ? "#0015f8" : "#64748b", fontSize: 13 }}>
                                ₦{spent.toLocaleString()}
                              </strong>
                            </td>
                            <td style={{ color: "#64748b", fontSize: 12 }}>
                              {new Date(u.createdAt).toLocaleDateString("en-GB")}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                className="btn-secondary user-view-btn"
                                style={{ padding: "5px 10px", fontSize: 11.5 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(u);
                                  setModalTab("tradefairs");
                                }}
                              >
                                <span>View History</span>
                                <ChevronRight size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions & Recent Applications Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
              {/* Recent Applications Card */}
              <div className="admin-card">
                <div className="admin-card__head">
                  <div>
                    <h3>Recent Vendor Registrations</h3>
                    <p>Latest vendor applications submitted via Monnify</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className="btn-secondary"
                  >
                    View Events &rarr;
                  </button>
                </div>

                {recentApplications.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: 13.5, textAlign: "center", padding: "30px 0" }}>
                    No vendor applications recorded yet.
                  </p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Business</th>
                          <th>Stall</th>
                          <th>Paid</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentApplications.map((app) => (
                          <tr key={app.id}>
                            <td>
                              <strong>{app.businessName}</strong>
                              <br />
                              <small style={{ color: "#64748b" }}>{app.contactName}</small>
                            </td>
                            <td>{app.stallTitle}</td>
                            <td>
                              <strong>₦{(app.paidAmount || 0).toLocaleString()}</strong>
                            </td>
                            <td>
                              <span className="status-badge is-published">{app.paymentStatus}</span>
                            </td>
                            <td style={{ color: "#64748b", fontSize: 12 }}>
                              {new Date(app.createdAt).toLocaleDateString("en-GB")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Fast Shortcuts & Next Event Callout */}
              <div>
                <div className="admin-card">
                  <div className="admin-card__head">
                    <div>
                      <h3>Quick Navigation</h3>
                      <p>Jump to core administrative sections</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("events");
                        setShowEventModal(true);
                      }}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Plus size={16} />
                      <span>Create New Exhibition</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("events")}
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Calendar size={16} />
                      <span>Manage Event Terms &amp; Policies</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("gallery")}
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <ImageIcon size={16} />
                      <span>Upload Exhibition Photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("users")}
                      className="btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Users size={16} />
                      <span>Browse User Directory</span>
                    </button>
                  </div>
                </div>

                {events.length > 0 && (
                  <div className="admin-card" style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #1e293b 100%)", color: "#ffffff" }}>
                    <small style={{ color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, fontSize: 11 }}>
                      Next Upcoming Exhibition
                    </small>
                    <h4 style={{ color: "#ffffff", fontSize: 18, margin: "8px 0 6px", fontFamily: "var(--font-display, sans-serif)" }}>
                      {events[0].title}
                    </h4>
                    <p style={{ color: "#cbd5e1", fontSize: 13, margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={13} color="#93c5fd" /> {events[0].venue}
                    </p>
                    <Link
                      href={`/${events[0].slug}`}
                      target="_blank"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#93c5fd",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <span>Preview Live Page</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 2. EVENTS TAB                                               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "events" && (
          <>
            {/* Create Event Modal / Card */}
            {showEventModal && (
              <div className="admin-card" style={{ border: "2px solid #0015f8", background: "#f8fbff" }}>
                <div className="admin-card__head">
                  <div>
                    <h3>Create New Exhibition &amp; Broadcast Announcement</h3>
                    <p>Enter the exhibition specifications. Resend will automatically notify all registered users upon submission.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="btn-secondary"
                  >
                    <X size={14} /> Close
                  </button>
                </div>

                <form onSubmit={handleCreateEvent}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
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
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        URL Slug * (e.g. /owerri or /futo)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. owerri"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Venue &amp; Hall *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Landmark Hall, Main Campus"
                        value={newVenue}
                        onChange={(e) => setNewVenue(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        City / Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Owerri, Imo State"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Exhibition Write-Up / Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="About this exhibition..."
                      value={newWriteUp}
                      onChange={(e) => setNewWriteUp(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Important Terms &amp; Rules (Admin Notice)
                      </label>
                      <textarea
                        rows={2}
                        value={newImportantTerms}
                        onChange={(e) => setNewImportantTerms(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Cashless &amp; Stall QR Policy
                      </label>
                      <textarea
                        rows={2}
                        value={newCashlessPolicy}
                        onChange={(e) => setNewCashlessPolicy(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  {/* ── RESEND AUTO-EMAIL BROADCAST TOGGLE ── */}
                  <div className="resend-broadcast-banner">
                    <Mail size={22} className="resend-broadcast-banner__icon" />
                    <div className="resend-broadcast-banner__body">
                      <h4>Automatic Resend Email Announcement</h4>
                      <p>
                        When enabled, Silo will immediately dispatch a branded announcement email to all <strong>{stats.totalUsers} registered users</strong> containing direct links to book a stall and view event schedules.
                      </p>
                      <label className="resend-broadcast-banner__toggle">
                        <input
                          type="checkbox"
                          checked={notifyUsersWithResend}
                          onChange={(e) => setNotifyUsersWithResend(e.target.checked)}
                        />
                        <span>Send email announcement via Resend automatically upon creation</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    <button
                      type="submit"
                      disabled={isSubmittingEvent}
                      className="btn-primary"
                    >
                      <Plus size={16} />
                      <span>{isSubmittingEvent ? "Creating & Broadcasting..." : "Publish Exhibition"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Exhibitions List Card */}
            <div className="admin-card">
              <div className="admin-card__head">
                <div>
                  <h3>All Exhibitions ({events.length})</h3>
                  <p>Manage and monitor existing trade fair micro-pages</p>
                </div>
                {!showEventModal && (
                  <button
                    type="button"
                    onClick={() => setShowEventModal(true)}
                    className="btn-primary"
                  >
                    <Plus size={16} />
                    <span>Create Exhibition</span>
                  </button>
                )}
              </div>

              {events.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ color: "#64748b", marginBottom: 14 }}>
                    No exhibitions currently in database. Click &quot;Create Exhibition&quot; to set up your first event!
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(true)}
                    className="btn-primary"
                  >
                    <Plus size={16} />
                    <span>Create Exhibition</span>
                  </button>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Exhibition</th>
                        <th>Location &amp; Dates</th>
                        <th>Stall Bookings</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => (
                        <tr key={ev.id}>
                          <td>
                            <strong>{ev.title}</strong>
                            <br />
                            <small style={{ color: "#0015f8", fontWeight: 600 }}>/{ev.slug}</small>
                          </td>
                          <td>
                            <span>{ev.venue}</span>
                            <br />
                            <small style={{ color: "#64748b" }}>
                              {new Date(ev.startDate).toLocaleDateString("en-GB")}
                            </small>
                          </td>
                          <td>
                            <strong>{ev._count?.vendorApplications || 0}</strong> stalls
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                ev.status === "PUBLISHED" ? "is-published" : "is-draft"
                              }`}
                            >
                              {ev.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(ev)}
                                className="btn-secondary"
                                style={{ padding: "5px 9px", fontSize: 11 }}
                              >
                                {ev.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                              </button>
                              <Link
                                href={`/${ev.slug}`}
                                target="_blank"
                                className="btn-secondary"
                                style={{ padding: "5px 9px", fontSize: 11 }}
                              >
                                <ExternalLink size={12} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(ev)}
                                className="btn-danger"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Dynamic Terms & Policy Editor Card */}
            {events.length > 0 && (
              <div className="admin-card">
                <div className="admin-card__head">
                  <div>
                    <h3>Dynamic Exhibition Terms &amp; QR Policy Manager</h3>
                    <p>Update the official terms and cashless policy rendered on the registration and micro pages.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveTerms}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>
                      Select Exhibition to Configure
                    </label>
                    <select
                      value={editingTermsEventId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setEditingTermsEventId(id);
                        const match = events.find((ev) => ev.id === id);
                        if (match) {
                          setEditCashless(match.cashlessPolicy || "");
                          setEditTerms(match.importantTerms || "");
                        }
                      }}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #cbd5e1" }}
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} (/{ev.slug}) — {ev.venue}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Important Terms &amp; Conditions (Admin Notice)
                    </label>
                    <textarea
                      rows={3}
                      value={editTerms}
                      onChange={(e) => setEditTerms(e.target.value)}
                      placeholder="e.g. Set up hours, security rules..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Cashless &amp; Stall QR Code Policy
                    </label>
                    <textarea
                      rows={2}
                      value={editCashless}
                      onChange={(e) => setEditCashless(e.target.value)}
                      placeholder="e.g. Stalls equipped with Silo instant QR cashless paypoints..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #cbd5e1" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingTerms}
                    className="btn-primary"
                  >
                    <Edit3 size={15} />
                    <span>{isSavingTerms ? "Saving Terms..." : "Save Terms & Policy"}</span>
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 3. GALLERY TAB                                              */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "gallery" && (
          <>
            {/* Add Media Card */}
            <div className="admin-card">
              <div className="admin-card__head">
                <div>
                  <h3>Add Media to Exhibition Gallery</h3>
                  <p>Upload photos, highlights, or videos to exhibit on exhibition pages.</p>
                </div>
              </div>

              <form onSubmit={handleAddMedia}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Attach to Exhibition *
                    </label>
                    <select
                      value={galleryEventId}
                      onChange={(e) => setGalleryEventId(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                    >
                      <option value="">-- Choose Exhibition --</option>
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} (/{ev.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Media Type
                    </label>
                    <select
                      value={galleryType}
                      onChange={(e) => setGalleryType(e.target.value as any)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                    >
                      <option value="IMAGE">Photo / Image</option>
                      <option value="VIDEO">Video</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Image / Video Delivery URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://res.cloudinary.com/... or /hero/hero1.jpeg"
                      value={galleryMediaUrl}
                      onChange={(e) => setGalleryMediaUrl(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                      Caption / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Crowd exploring booth #12"
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingMedia || events.length === 0}
                  className="btn-primary"
                >
                  <UploadCloud size={16} />
                  <span>{isAddingMedia ? "Uploading..." : "Save to Gallery"}</span>
                </button>
              </form>
            </div>

            {/* Gallery Media Grid Card */}
            <div className="admin-card">
              <div className="admin-card__head">
                <div>
                  <h3>Media Assets Gallery ({gallery.length})</h3>
                  <p>All photos and highlights stored across exhibitions</p>
                </div>
              </div>

              {gallery.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>
                  No media uploaded yet. Use the form above to add your first photo or video!
                </p>
              ) : (
                <div className="gallery-grid">
                  {gallery.map((item) => (
                    <div key={item.id} className="gallery-card">
                      <div className="gallery-card__thumb">
                        <Image
                          src={item.url}
                          alt={item.caption || "Exhibition media"}
                          fill
                          sizes="(max-width: 600px) 100vw, 240px"
                          unoptimized
                        />
                      </div>
                      <div className="gallery-card__info">
                        <h5>{item.caption || "Untitled"}</h5>
                        <small>{item.event?.title || "Silo Exhibition"}</small>
                      </div>
                      <div className="gallery-card__actions">
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          className="btn-danger"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 4. USERS TAB                                                */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="admin-card">
            <div className="admin-card__head">
              <div>
                <h3>User Directory ({users.length})</h3>
                <p>Manage registered accounts and assign role privileges</p>
              </div>

              {/* Filters */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    style={{
                      padding: "8px 12px 8px 30px",
                      borderRadius: 10,
                      border: "1.5px solid #cbd5e1",
                      fontSize: 13,
                    }}
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1.5px solid #cbd5e1",
                    fontSize: 13,
                  }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admins</option>
                  <option value="EVENT_MANAGER">Managers</option>
                  <option value="USER">Standard Users</option>
                </select>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "40px 0" }}>
                No users found matching query.
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Trade Fairs</th>
                      <th>Current Role</th>
                      <th>Change Role</th>
                      <th>Joined Date</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const fairsCount = (u.vendorApplications?.length ?? u.totalTradefairsCount) || 0;
                      return (
                        <tr
                          key={u.id}
                          className="user-row-clickable"
                          onClick={() => {
                            setSelectedUser(u);
                            setModalTab("tradefairs");
                          }}
                          title="Click to view full user history & trade fair registrations"
                        >
                          <td>
                            <strong>{u.name || "Unnamed User"}</strong>
                            <br />
                            <small style={{ color: "#64748b" }}>{u.email}</small>
                          </td>
                          <td>
                            {fairsCount > 0 ? (
                              <span className="status-badge is-published">
                                {fairsCount} {fairsCount === 1 ? "Fair" : "Fairs"}
                              </span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: 12 }}>0 Fairs</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                (u.role || "user").toUpperCase() === "ADMIN"
                                  ? "is-admin"
                                  : "is-user"
                              }`}
                            >
                              {(u.role || "user").toUpperCase()}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              value={(u.role || "user").toLowerCase()}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              <option value="user">USER</option>
                              <option value="admin">ADMIN</option>
                              <option value="event_manager">EVENT_MANAGER</option>
                              <option value="gate_staff">GATE_STAFF</option>
                            </select>
                          </td>
                          <td style={{ color: "#64748b", fontSize: 12 }}>
                            {new Date(u.createdAt).toLocaleDateString("en-GB")}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              type="button"
                              className="btn-secondary user-view-btn"
                              style={{ padding: "4px 8px", fontSize: 11.5 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(u);
                                setModalTab("tradefairs");
                              }}
                            >
                              <span>History</span>
                              <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* USER HISTORY & TRADE FAIR PARTICIPATION MODAL               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {selectedUser && (
          <div className="user-history-modal" role="dialog" aria-modal="true">
            <div
              className="user-history-modal__backdrop"
              onClick={() => setSelectedUser(null)}
            />
            <div className="user-history-modal__card">
              {/* Header */}
              <div className="user-history-modal__header">
                <div className="user-history-modal__profile">
                  <div className="user-history-modal__avatar">
                    {(selectedUser.name || selectedUser.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="user-history-modal__name">
                      {selectedUser.name || "Unnamed User"}
                    </h3>
                    <p className="user-history-modal__email">{selectedUser.email}</p>

                    {/* Action Bar (Email, WhatsApp, Role Badge) */}
                    <div className="user-history-modal__actions">
                      <a
                        href={`mailto:${selectedUser.email}`}
                        className="user-history-modal__action-btn user-history-modal__action-btn--mail"
                      >
                        <Mail size={13} />
                        <span>Send Email</span>
                      </a>

                      {(() => {
                        const appWithPhone =
                          selectedUser.vendorApplications?.find((a) => a.phone) ||
                          selectedUser.volunteerApplications?.find((v) => v.phone);
                        if (appWithPhone?.phone) {
                          const clean = appWithPhone.phone.replace(/[^0-9]/g, "");
                          const waNumber = clean.startsWith("0") ? "234" + clean.slice(1) : clean;
                          return (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="user-history-modal__action-btn user-history-modal__action-btn--wa"
                            >
                              <MessageCircle size={13} />
                              <span>WhatsApp ({appWithPhone.phone})</span>
                            </a>
                          );
                        }
                        return null;
                      })()}

                      <span
                        className={`status-badge ${
                          (selectedUser.role || "user").toUpperCase() === "ADMIN"
                            ? "is-admin"
                            : "is-user"
                        }`}
                      >
                        {(selectedUser.role || "user").toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="user-history-modal__close"
                  onClick={() => setSelectedUser(null)}
                  aria-label="Close user modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Metrics Bar */}
              <div className="user-history-modal__metrics">
                <div className="user-history-modal__metric-box">
                  <small>Trade Fairs Signed Up</small>
                  <strong>{selectedUser.vendorApplications?.length || selectedUser.totalTradefairsCount || 0}</strong>
                </div>
                <div className="user-history-modal__metric-box">
                  <small>Total Stalls Investment</small>
                  <strong style={{ color: "#0015f8" }}>
                    ₦{(selectedUser.totalSpent || 0).toLocaleString()}
                  </strong>
                </div>
                <div className="user-history-modal__metric-box">
                  <small>Member Since</small>
                  <strong>{new Date(selectedUser.createdAt).toLocaleDateString("en-GB")}</strong>
                </div>
              </div>

              {/* Sub-tabs Navigation */}
              <div className="user-history-modal__tabs-nav">
                <button
                  type="button"
                  className={`user-history-modal__tab-btn ${
                    modalTab === "tradefairs" ? "is-active" : ""
                  }`}
                  onClick={() => setModalTab("tradefairs")}
                >
                  <Sparkles size={14} />
                  <span>
                    Trade Fair Bookings ({selectedUser.vendorApplications?.length || 0})
                  </span>
                </button>
                <button
                  type="button"
                  className={`user-history-modal__tab-btn ${
                    modalTab === "volunteers" ? "is-active" : ""
                  }`}
                  onClick={() => setModalTab("volunteers")}
                >
                  <Users size={14} />
                  <span>
                    Volunteer Roles ({selectedUser.volunteerApplications?.length || 0})
                  </span>
                </button>
                <button
                  type="button"
                  className={`user-history-modal__tab-btn ${
                    modalTab === "profile" ? "is-active" : ""
                  }`}
                  onClick={() => setModalTab("profile")}
                >
                  <ShieldCheck size={14} />
                  <span>Account &amp; Role</span>
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="user-history-modal__body">
                {modalTab === "tradefairs" && (
                  <>
                    {!selectedUser.vendorApplications || selectedUser.vendorApplications.length === 0 ? (
                      <div className="empty-user-history">
                        <Sparkles size={36} color="#94a3b8" />
                        <h4>No Trade Fair Registrations</h4>
                        <p>This user has not yet signed up for any vendor stall packages.</p>
                      </div>
                    ) : (
                      selectedUser.vendorApplications.map((app) => (
                        <div key={app.id} className="tradefair-reg-card">
                          <div className="tradefair-reg-card__head">
                            <div>
                              <h4>{app.event?.title || "Silo Exhibition"}</h4>
                              <p
                                style={{
                                  color: "#64748b",
                                  fontSize: 12.5,
                                  margin: "2px 0 0",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <MapPin size={12} color="#0015f8" />
                                <span>{app.event?.venue || "Exhibition Grounds"}</span>
                                {app.event?.startDate && (
                                  <>
                                    <span>•</span>
                                    <Clock size={12} />
                                    <span>
                                      {new Date(app.event.startDate).toLocaleDateString("en-GB")}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <button
                                type="button"
                                className="copy-badge-btn"
                                onClick={() => handleCopyCode(app.bookingCode)}
                                title="Click to copy booking code"
                              >
                                {copiedBookingCode === app.bookingCode ? (
                                  <>
                                    <Check size={12} color="#15803d" />
                                    <span style={{ color: "#15803d" }}>COPIED</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>{app.bookingCode}</span>
                                  </>
                                )}
                              </button>

                              <span
                                className={`status-badge ${
                                  app.paymentStatus === "SUCCESS"
                                    ? "is-published"
                                    : app.paymentStatus === "PENDING"
                                    ? "is-draft"
                                    : "is-archived"
                                }`}
                              >
                                {app.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="tradefair-reg-card__grid">
                            <div>
                              <span>Stall Booked</span>
                              <strong>{app.stallTitle || "Standard Stall"}</strong>
                            </div>
                            <div>
                              <span>Plan Selected</span>
                              <strong>{app.planName || "Full Payment"}</strong>
                            </div>
                            <div>
                              <span>Business Name</span>
                              <strong>{app.businessName}</strong>
                            </div>
                            <div>
                              <span>Contact Person</span>
                              <strong>
                                {app.contactName} ({app.phone})
                              </strong>
                            </div>
                            <div>
                              <span>Category</span>
                              <strong>{app.category || "General Merchandise"}</strong>
                            </div>
                            <div>
                              <span>Payment Reference</span>
                              <strong style={{ fontFamily: "monospace", fontSize: 11.5 }}>
                                {app.paymentReference || "N/A"}
                              </strong>
                            </div>
                          </div>

                          <div className="tradefair-reg-card__footer">
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <div>
                                <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>
                                  Amount Paid
                                </small>
                                <span className="price-paid">
                                  ₦{(app.paidAmount || 0).toLocaleString()}
                                </span>
                              </div>
                              {app.dueNow > 0 && (
                                <div>
                                  <small style={{ color: "#64748b", fontSize: 11, display: "block" }}>
                                    Due Balance
                                  </small>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>
                                    ₦{app.dueNow.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <small style={{ color: "#94a3b8", fontSize: 11.5 }}>
                                Registered: {new Date(app.createdAt).toLocaleDateString("en-GB")}
                              </small>
                              {app.event?.slug && (
                                <Link
                                  href={`/${app.event.slug}`}
                                  target="_blank"
                                  className="btn-secondary"
                                  style={{ padding: "4px 8px", fontSize: 11.5 }}
                                >
                                  <span>Event Page</span>
                                  <ExternalLink size={11} />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {modalTab === "volunteers" && (
                  <>
                    {!selectedUser.volunteerApplications ||
                    selectedUser.volunteerApplications.length === 0 ? (
                      <div className="empty-user-history">
                        <Users size={36} color="#94a3b8" />
                        <h4>No Volunteer Registrations</h4>
                        <p>This user has not registered as an exhibition volunteer.</p>
                      </div>
                    ) : (
                      selectedUser.volunteerApplications.map((vol) => (
                        <div key={vol.id} className="tradefair-reg-card">
                          <div className="tradefair-reg-card__head">
                            <div>
                              <h4>{vol.event?.title || "Silo Exhibition"}</h4>
                              <p style={{ color: "#64748b", fontSize: 12.5, margin: "2px 0 0" }}>
                                {vol.event?.venue || "Main Grounds"}
                              </p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span className="tradefair-reg-card__code">{vol.volunteerCode}</span>
                              <span className="status-badge is-published">{vol.status}</span>
                            </div>
                          </div>

                          <div className="tradefair-reg-card__grid">
                            <div>
                              <span>Assigned / Primary Role</span>
                              <strong>{vol.primaryRole}</strong>
                            </div>
                            <div>
                              <span>Institution / Org</span>
                              <strong>{vol.institution || "Independent"}</strong>
                            </div>
                            <div>
                              <span>Days Available</span>
                              <strong>{vol.daysAvailable || "All Event Days"}</strong>
                            </div>
                            <div>
                              <span>Phone</span>
                              <strong>{vol.phone}</strong>
                            </div>
                          </div>

                          <div className="tradefair-reg-card__footer">
                            <small style={{ color: "#94a3b8", fontSize: 11.5 }}>
                              Applied on {new Date(vol.createdAt).toLocaleDateString("en-GB")}
                            </small>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {modalTab === "profile" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div
                      style={{
                        background: "#f8fafc",
                        padding: 20,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h4 style={{ margin: "0 0 14px", color: "#0a0f2e", fontSize: 15 }}>
                        Administrative Role Management
                      </h4>
                      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 14px" }}>
                        Assign system permissions for this account. Admins can access this dashboard and
                        broadcast announcements.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                          Current Role:
                        </label>
                        <select
                          value={(selectedUser.role || "user").toLowerCase()}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            await handleUpdateRole(selectedUser.id, newRole);
                            setSelectedUser({ ...selectedUser, role: newRole.toUpperCase() });
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #cbd5e1",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <option value="user">USER (Standard Account)</option>
                          <option value="admin">ADMIN (Full Console Access)</option>
                          <option value="event_manager">EVENT_MANAGER (Exhibition Lead)</option>
                          <option value="gate_staff">GATE_STAFF (Ticket / Check-in)</option>
                        </select>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        padding: 20,
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h4 style={{ margin: "0 0 12px", color: "#0a0f2e", fontSize: 15 }}>
                        Account Metadata
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 12,
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 11.5 }}>
                            User ID
                          </span>
                          <strong style={{ fontFamily: "monospace", fontSize: 12 }}>
                            {selectedUser.id}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 11.5 }}>
                            Email Verification
                          </span>
                          <strong>
                            {selectedUser.emailVerified ? "Verified Email Address" : "Unverified"}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 11.5 }}>
                            Account Created
                          </span>
                          <strong>{new Date(selectedUser.createdAt).toLocaleString("en-GB")}</strong>
                        </div>
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 11.5 }}>
                            Total Applications Recorded
                          </span>
                          <strong>
                            {(selectedUser.vendorApplications?.length || 0) +
                              (selectedUser.volunteerApplications?.length || 0)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
