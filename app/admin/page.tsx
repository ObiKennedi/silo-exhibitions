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
  CreditCard,
  AlertTriangle,
  Layers,
} from "lucide-react";

import "@/styles/admin/AdminDashboard.scss";
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload";
import { StallConfig, StallPaymentPlan } from "@/types/upcoming-event";

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
  tagline?: string | null;
  venue: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  registrationStatus?: string | null;
  writeUp?: string | null;
  coverImageUrl?: string | null;
  flierUrl?: string | null;
  cashlessPolicy?: string | null;
  importantTerms?: string | null;
  exhibitionPlanSummary?: string | null;
  stallsConfig?: string | null;
  vendorCallDescription?: string | null;
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

export function computeStallPlans(stall: {
  price?: number;
  enableInstallment?: boolean;
  installmentDepositPercent?: number;
  enableRevenueShare?: boolean;
  revenueDepositAmount?: number;
  revenuePercentage?: number;
}): StallPaymentPlan[] {
  const plans: StallPaymentPlan[] = [];
  const price = Math.max(0, Number(stall.price) || 0);

  // 1. Full Upfront Payment
  plans.push({
    id: "full",
    name: "Full Upfront Payment",
    dueNow: price,
    totalAmountText: `₦${price.toLocaleString()} one-off`,
    description: "Pay 100% now for instant confirmed allocation.",
  });

  // 2. Installment Plan
  if (stall.enableInstallment !== false) {
    const depositPct = Math.min(95, Math.max(5, stall.installmentDepositPercent ?? 50));
    const dueNow = Math.round(price * (depositPct / 100));
    const balance = price - dueNow;
    plans.push({
      id: "installment",
      name: `2-Part Installment Plan (${depositPct}% Deposit)`,
      dueNow,
      totalAmountText: `₦${dueNow.toLocaleString()} now + ₦${balance.toLocaleString()} later`,
      description: `Pay ₦${dueNow.toLocaleString()} deposit today to hold your space. Remainder due 7 days prior.`,
    });
  }

  // 3. Revenue Share / Pay Daily
  if (stall.enableRevenueShare) {
    const deposit = stall.revenueDepositAmount ?? 25000;
    const revPct = stall.revenuePercentage ?? 10;
    plans.push({
      id: "revenue_percentage",
      name: `Option 2: Pay Daily (${revPct}% Daily Gross Revenue)`,
      dueNow: deposit,
      totalAmountText: `₦${deposit.toLocaleString()} Setup Deposit + ${revPct}% Daily Gross Revenue`,
      description: `Lower initial commitment. Pay a ₦${deposit.toLocaleString()} setup deposit today, then remit ${revPct}% of total daily gross revenue at the end of each day.`,
      isRevenueShare: true,
      revenuePercentage: revPct,
    });
  }

  return plans;
}

const DEFAULT_ADMIN_STALLS: StallConfig[] = [
  {
    id: "compact",
    title: "Standard Booth",
    size: "2m × 2m (4 sqm)",
    price: 35000,
    badge: "",
    description: "Ideal for student entrepreneurs, solo artisans, apparel & craft vendors.",
    features: [
      "1 Display table + 2 chairs",
      "1 Standard electrical socket (500W)",
      "2 Official Vendor passes",
      "Basic directory listing in campus program",
    ],
    availablePlans: [],
  },
  {
    id: "corner",
    title: "Prime Corner Stall",
    size: "3m × 3m (9 sqm)",
    price: 65000,
    badge: "High Foot Traffic",
    description: "Corner placement at corridor intersections with high attendee flow.",
    features: [
      "2 Display tables + 4 chairs",
      "Dual high-capacity electrical sockets (1500W)",
      "4 Official Vendor passes",
      "Highlighted boundary on physical & digital event maps",
      "1 Live DJ shoutout per day",
    ],
    availablePlans: [],
  },
  {
    id: "mega",
    title: "Grand Mega Pavilion",
    size: "5m × 5m (25 sqm)",
    price: 120000,
    badge: "Largest Stall · Anchor Brand",
    description: "Prime center-arena anchor pavilion designed for flagship campus brands and high-volume sales.",
    features: [
      "Massive 25 sqm center-court pavilion space",
      "Dedicated high-amp electrical line (3000W)",
      "8 VIP Vendor badges with early setup privileges",
      "Stage spotlight interview & continuous MC mentions",
      "Priority loading dock & logistics assistance",
      "Full feature page in official exhibition digital guide",
    ],
    availablePlans: [],
  },
].map((s) => {
  const isMega = s.id === "mega";
  const withToggles = {
    ...s,
    enableInstallment: true,
    installmentDepositPercent: 50,
    enableRevenueShare: isMega,
    revenueDepositAmount: 25000,
    revenuePercentage: 10,
  };
  return {
    ...withToggles,
    availablePlans: computeStallPlans(withToggles),
  };
});

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

  // Events Filter & Search
  const [eventCategoryFilter, setEventCategoryFilter] = useState<
    "ALL" | "CURRENT" | "UPCOMING" | "PAST" | "DRAFT"
  >("ALL");
  const [eventSearchQuery, setEventSearchQuery] = useState("");

  // Event Form (Create & Edit) State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Form Fields
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("Campus Mega Fair");
  const [newLocation, setNewLocation] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndDate, setNewEndDate] = useState("");
  const [newEndTime, setNewEndTime] = useState("18:00");
  const [newWriteUp, setNewWriteUp] = useState("");
  const [newCoverUrl, setNewCoverUrl] = useState("");
  const [newFlierUrl, setNewFlierUrl] = useState("");
  const [newCashlessPolicy, setNewCashlessPolicy] = useState(
    "All stalls are equipped with designated QR cashless paypoints for seamless campus sales."
  );
  const [newWhatsappUrl, setNewWhatsappUrl] = useState("https://wa.me/2349063508366");
  const [notifyUsersWithResend, setNotifyUsersWithResend] = useState(true);

  // Payment Plans Configuration
  const [enableOneTime, setEnableOneTime] = useState(true);
  const [enablePayAsYouGo, setEnablePayAsYouGo] = useState(true);
  const [payAsYouGoDeposit, setPayAsYouGoDeposit] = useState(50);
  const [payAsYouGoNote, setPayAsYouGoNote] = useState(
    "Pay 50% deposit now to reserve your stall. Balance due 48 hours before exhibition setup."
  );

  // Stall Types & Dynamic Payment Plans Builder State
  const [stallsList, setStallsList] = useState<StallConfig[]>(DEFAULT_ADMIN_STALLS);

  const handleUpdateStall = (id: string, updates: Partial<StallConfig>) => {
    setStallsList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updates };
        return {
          ...merged,
          availablePlans: computeStallPlans(merged),
        };
      })
    );
  };

  const handleAddStallType = () => {
    const newId = `stall_${Date.now()}`;
    const newStall: StallConfig = {
      id: newId,
      title: "Custom Vendor Stall",
      size: "2.5m × 2.5m (6.25 sqm)",
      price: 45000,
      badge: "New Option",
      description: "Great for general retail, fashion apparel, accessories, food, and tech stalls.",
      features: [
        "1 Display table + 2 chairs",
        "1 Standard electrical socket (500W)",
        "2 Official Vendor passes",
      ],
      enableInstallment: true,
      installmentDepositPercent: 50,
      enableRevenueShare: false,
      revenueDepositAmount: 20000,
      revenuePercentage: 10,
      availablePlans: [],
    };
    newStall.availablePlans = computeStallPlans(newStall);
    setStallsList((prev) => [...prev, newStall]);
  };

  const handleRemoveStallType = (id: string) => {
    if (stallsList.length <= 1) {
      alert("At least one stall type is required.");
      return;
    }
    setStallsList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetDefaultStalls = () => {
    if (confirm("Reset all stall types to the standard default presets?")) {
      setStallsList(DEFAULT_ADMIN_STALLS);
    }
  };

  // Terms & Conditions with Important Disclaimer Flag
  interface TermItem {
    id: string;
    text: string;
    isImportant: boolean;
  }

  const [termsList, setTermsList] = useState<TermItem[]>([
    {
      id: "1",
      text: "All stalls are equipped with designated QR cashless paypoints for seamless campus sales.",
      isImportant: true,
    },
    {
      id: "2",
      text: "Vendors must arrive and complete booth setup at least 2 hours prior to exhibition gate opening.",
      isImportant: true,
    },
    {
      id: "3",
      text: "All stalls must be kept neat and free of safety hazards. Waste must be deposited in campus bins.",
      isImportant: false,
    },
    {
      id: "4",
      text: "Merchandise and campus conduct must comply with institution rules and trade fair guidelines.",
      isImportant: false,
    },
  ]);
  const [newTermInput, setNewTermInput] = useState("");
  const [newTermIsImportant, setNewTermIsImportant] = useState(false);

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

  const resetEventForm = () => {
    setEditingEvent(null);
    setNewTitle("");
    setNewTagline("Campus Mega Fair");
    setNewLocation("");
    setNewSlug("");
    setNewVenue("");
    setNewStartDate("");
    setNewStartTime("09:00");
    setNewEndDate("");
    setNewEndTime("18:00");
    setNewWriteUp("");
    setNewCoverUrl("");
    setNewFlierUrl("");
    setNewCashlessPolicy(
      "All stalls are equipped with designated QR cashless paypoints for seamless campus sales."
    );
    setEnableOneTime(true);
    setEnablePayAsYouGo(true);
    setPayAsYouGoDeposit(50);
    setPayAsYouGoNote(
      "Pay 50% deposit now to reserve your stall. Balance due 48 hours before exhibition setup."
    );
    setStallsList(DEFAULT_ADMIN_STALLS);
    setTermsList([
      {
        id: "1",
        text: "All stalls are equipped with designated QR cashless paypoints for seamless campus sales.",
        isImportant: true,
      },
      {
        id: "2",
        text: "Vendors must arrive and complete booth setup at least 2 hours prior to exhibition gate opening.",
        isImportant: true,
      },
      {
        id: "3",
        text: "All stalls must be kept neat and free of safety hazards. Waste must be deposited in campus bins.",
        isImportant: false,
      },
      {
        id: "4",
        text: "Merchandise and campus conduct must comply with institution rules and trade fair guidelines.",
        isImportant: false,
      },
    ]);
  };

  const openCreateModal = () => {
    resetEventForm();
    setShowEventModal(true);
  };

  const openEditModal = (ev: AdminEvent) => {
    setEditingEvent(ev);
    setNewTitle(ev.title);
    setNewTagline(ev.tagline || "Campus Mega Fair");
    setNewLocation(ev.location || "");
    setNewSlug(ev.slug);
    setNewVenue(ev.venue);

    if (ev.startDate) {
      const s = new Date(ev.startDate);
      setNewStartDate(s.toISOString().split("T")[0]);
      setNewStartTime(s.toTimeString().slice(0, 5));
    } else {
      setNewStartDate("");
      setNewStartTime("09:00");
    }

    if (ev.endDate) {
      const e = new Date(ev.endDate);
      setNewEndDate(e.toISOString().split("T")[0]);
      setNewEndTime(e.toTimeString().slice(0, 5));
    } else {
      setNewEndDate("");
      setNewEndTime("18:00");
    }

    setNewWriteUp(ev.writeUp || "");
    setNewCoverUrl(ev.coverImageUrl || "");
    setNewFlierUrl(ev.flierUrl || "");
    setNewCashlessPolicy(
      ev.cashlessPolicy ||
        "All stalls are equipped with designated QR cashless paypoints for seamless campus sales."
    );
    setNewWhatsappUrl(ev.whatsappUrl || "https://wa.me/2349063508366");

    if (ev.stallsConfig) {
      try {
        const parsed = typeof ev.stallsConfig === "string" ? JSON.parse(ev.stallsConfig) : ev.stallsConfig;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStallsList(
            parsed.map((s: any) => ({
              ...s,
              availablePlans: s.availablePlans?.length ? s.availablePlans : computeStallPlans(s),
            }))
          );
        } else {
          setStallsList(DEFAULT_ADMIN_STALLS);
        }
      } catch {
        setStallsList(DEFAULT_ADMIN_STALLS);
      }
    } else {
      setStallsList(DEFAULT_ADMIN_STALLS);
    }

    if (ev.exhibitionPlanSummary) {
      try {
        const parsed = JSON.parse(ev.exhibitionPlanSummary);
        if (parsed.oneTime !== undefined) setEnableOneTime(parsed.oneTime);
        if (parsed.payAsYouGo !== undefined) setEnablePayAsYouGo(parsed.payAsYouGo);
        if (parsed.depositPercentage !== undefined) setPayAsYouGoDeposit(parsed.depositPercentage);
        if (parsed.payAsYouGoNote !== undefined) setPayAsYouGoNote(parsed.payAsYouGoNote);
      } catch {
        // Not JSON, keep defaults
      }
    }

    const parsedTerms: TermItem[] = [];
    if (ev.importantTerms) {
      ev.importantTerms
        .split("\n")
        .filter(Boolean)
        .forEach((t, i) => {
          parsedTerms.push({ id: `imp-${i}`, text: t.trim(), isImportant: true });
        });
    }
    if (parsedTerms.length > 0) {
      setTermsList(parsedTerms);
    }

    setShowEventModal(true);
  };

  const handleLocationChange = (loc: string) => {
    setNewLocation(loc);
    if (!editingEvent) {
      const generated = loc
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 45);
      setNewSlug(generated);
    }
  };

  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    setTermsList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newTermInput.trim(),
        isImportant: newTermIsImportant,
      },
    ]);
    setNewTermInput("");
    setNewTermIsImportant(false);
  };

  const handleToggleTermImportant = (id: string) => {
    setTermsList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isImportant: !t.isImportant } : t))
    );
  };

  const handleRemoveTerm = (id: string) => {
    setTermsList((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim() || !newVenue.trim()) {
      alert("Please provide exhibition title, URL slug, and venue.");
      return;
    }

    setIsSubmittingEvent(true);
    setNotification(null);

    try {
      const startDateTime = newStartDate
        ? `${newStartDate}T${newStartTime || "09:00"}:00`
        : undefined;
      const endDateTime = newEndDate
        ? `${newEndDate}T${newEndTime || "18:00"}:00`
        : undefined;

      const importantTermsString = termsList
        .filter((t) => t.isImportant && t.text.trim())
        .map((t) => t.text.trim())
        .join("\n");

      const paymentPlansSummary = JSON.stringify({
        oneTime: enableOneTime,
        payAsYouGo: enablePayAsYouGo,
        depositPercentage: enablePayAsYouGo ? payAsYouGoDeposit : 0,
        payAsYouGoNote,
      });

      const vendorCallDesc = `Payment Options: ${enableOneTime ? "Full 100% Payment" : ""}${
        enableOneTime && enablePayAsYouGo ? " | " : ""
      }${
        enablePayAsYouGo
          ? `Pay As You Go (${payAsYouGoDeposit}% initial deposit. ${payAsYouGoNote})`
          : ""
      }`;

      const action = editingEvent ? "update" : "create";
      const payload: any = {
        action,
        id: editingEvent?.id,
        title: newTitle,
        tagline: newTagline || null,
        slug: newSlug,
        venue: newVenue,
        location: newLocation || newVenue,
        startDate: startDateTime,
        endDate: endDateTime,
        status: editingEvent ? editingEvent.status : "PUBLISHED",
        registrationStatus: "REGISTRATION_OPEN",
        writeUp: newWriteUp,
        coverImageUrl: newCoverUrl || undefined,
        flierUrl: newFlierUrl || undefined,
        cashlessPolicy: newCashlessPolicy,
        importantTerms: importantTermsString,
        exhibitionPlanSummary: paymentPlansSummary,
        vendorCallDescription: vendorCallDesc,
        whatsappUrl: newWhatsappUrl || undefined,
        stallsConfig: JSON.stringify(stallsList),
        notifyUsers: editingEvent ? false : notifyUsersWithResend,
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        let msg = editingEvent
          ? `Exhibition "${newTitle}" updated successfully!`
          : `Exhibition "${newTitle}" created successfully!`;
        if (data.broadcastResult?.sentCount) {
          msg += ` Automatically dispatched announcement emails via Resend to ${data.broadcastResult.sentCount} users!`;
        }
        setNotification({ type: "success", message: msg });
        setShowEventModal(false);
        resetEventForm();
        await fetchDashboardData();
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to save exhibition.",
        });
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "An error occurred saving exhibition.",
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

  // Event Classifications: Current, Upcoming, Past, Drafts
  const nowTime = new Date().getTime();

  const isEventActivelyBooking = (ev: AdminEvent) => {
    const isPub = ev.status === "PUBLISHED";
    const regOpen =
      !ev.registrationStatus || ev.registrationStatus === "REGISTRATION_OPEN";
    const notTooPast = new Date(ev.startDate).getTime() >= nowTime - 48 * 3600 * 1000;
    return isPub && regOpen && notTooPast;
  };

  const currentEvents = events.filter(isEventActivelyBooking);
  const upcomingEvents = events.filter(
    (ev) => new Date(ev.startDate).getTime() > nowTime && ev.status !== "ARCHIVED"
  );
  const pastEvents = events.filter(
    (ev) => new Date(ev.startDate).getTime() <= nowTime || ev.status === "ARCHIVED"
  );
  const draftEvents = events.filter((ev) => ev.status === "DRAFT");

  const displayedEvents = events.filter((ev) => {
    // 1. Category Filter
    if (eventCategoryFilter === "CURRENT" && !isEventActivelyBooking(ev)) return false;
    if (
      eventCategoryFilter === "UPCOMING" &&
      (new Date(ev.startDate).getTime() <= nowTime || ev.status === "ARCHIVED")
    )
      return false;
    if (
      eventCategoryFilter === "PAST" &&
      new Date(ev.startDate).getTime() > nowTime &&
      ev.status !== "ARCHIVED"
    )
      return false;
    if (eventCategoryFilter === "DRAFT" && ev.status !== "DRAFT") return false;

    // 2. Search Query
    if (eventSearchQuery.trim()) {
      const q = eventSearchQuery.toLowerCase().trim();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchSlug = ev.slug.toLowerCase().includes(q);
      const matchVenue = ev.venue.toLowerCase().includes(q);
      const matchLocation = (ev.location || "").toLowerCase().includes(q);
      const matchTag = (ev.tagline || "").toLowerCase().includes(q);
      return matchTitle || matchSlug || matchVenue || matchLocation || matchTag;
    }

    return true;
  });

  const importantTermsArray = termsList.filter(
    (t) => t.isImportant && t.text.trim()
  );

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
        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 2. EVENTS TAB                                               */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeTab === "events" && (
          <>
            {/* Header & Controls Card */}
            <div className="admin-card" style={{ marginBottom: 20 }}>
              <div
                className="admin-card__head"
                style={{ flexWrap: "wrap", gap: 16, alignItems: "center" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Calendar size={22} color="#0015f8" />
                    <h3 style={{ margin: 0 }}>Exhibitions Console ({events.length})</h3>
                  </div>
                  <p style={{ margin: "4px 0 0" }}>
                    Manage current actively booking events, upcoming schedules, and past trade fairs.
                    Configure location-based slugs, payment plans, and important disclaimer terms.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Search
                      size={14}
                      style={{ position: "absolute", left: 10, top: 11, color: "#94a3b8" }}
                    />
                    <input
                      type="text"
                      placeholder="Search title, campus, slug, tag..."
                      value={eventSearchQuery}
                      onChange={(e) => setEventSearchQuery(e.target.value)}
                      style={{
                        padding: "8px 12px 8px 32px",
                        borderRadius: 10,
                        border: "1.5px solid #cbd5e1",
                        fontSize: 13,
                        minWidth: 240,
                      }}
                    />
                    {eventSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEventSearchQuery("")}
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

                  {!showEventModal && (
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="btn-primary"
                    >
                      <Plus size={16} />
                      <span>Upload Exhibition</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Event Category Filter Tabs */}
              <div className="event-category-filters" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className={`event-filter-btn ${
                    eventCategoryFilter === "ALL" ? "is-active" : ""
                  }`}
                  onClick={() => setEventCategoryFilter("ALL")}
                >
                  <span>All ({events.length})</span>
                </button>

                <button
                  type="button"
                  className={`event-filter-btn ${
                    eventCategoryFilter === "CURRENT" ? "is-active" : ""
                  }`}
                  onClick={() => setEventCategoryFilter("CURRENT")}
                >
                  <span className="event-pulse-dot" />
                  <span>Actively Booking ({currentEvents.length})</span>
                </button>

                <button
                  type="button"
                  className={`event-filter-btn ${
                    eventCategoryFilter === "UPCOMING" ? "is-active" : ""
                  }`}
                  onClick={() => setEventCategoryFilter("UPCOMING")}
                >
                  <Calendar size={13} />
                  <span>Upcoming ({upcomingEvents.length})</span>
                </button>

                <button
                  type="button"
                  className={`event-filter-btn ${
                    eventCategoryFilter === "PAST" ? "is-active" : ""
                  }`}
                  onClick={() => setEventCategoryFilter("PAST")}
                >
                  <Clock size={13} />
                  <span>Past Concluded ({pastEvents.length})</span>
                </button>

                <button
                  type="button"
                  className={`event-filter-btn ${
                    eventCategoryFilter === "DRAFT" ? "is-active" : ""
                  }`}
                  onClick={() => setEventCategoryFilter("DRAFT")}
                >
                  <Edit3 size={13} />
                  <span>Drafts ({draftEvents.length})</span>
                </button>
              </div>
            </div>

            {/* ── UPLOAD / EDIT EXHIBITION FORM MODAL / CARD ──────────── */}
            {showEventModal && (
              <div
                className="admin-card"
                style={{
                  border: "2px solid #0015f8",
                  background: "#f8fbff",
                  marginBottom: 24,
                  animation: "slideUp 0.25s ease",
                }}
              >
                <div className="admin-card__head">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="status-badge is-published">
                        {editingEvent ? "EDIT MODE" : "NEW EXHIBITION"}
                      </span>
                      <h3 style={{ margin: 0 }}>
                        {editingEvent
                          ? `Edit Specifications: ${editingEvent.title}`
                          : "Upload New Exhibition & Announce to Users"}
                      </h3>
                    </div>
                    <p style={{ margin: "4px 0 0" }}>
                      Configure date, time, event tag, location (auto-generates URL slug), venue, payment
                      plans, and important terms for the micro-page disclaimer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                    }}
                    className="btn-secondary"
                  >
                    <X size={14} /> Close
                  </button>
                </div>

                <form onSubmit={handleSaveEvent}>
                  {/* 1. Event Identity & Location */}
                  <div className="event-form-section">
                    <h4 className="event-form-section__title">
                      <Tag size={15} color="#0015f8" />
                      <span>1. Event Identity, Tag &amp; Location Slug</span>
                    </h4>
                    <p className="event-form-section__desc">
                      Enter the exhibition title, tag theme, and campus location. The slug will automatically derive from the location.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                          Exhibition Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Silo Campus Mega Trade Fair FUTO 2026"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #cbd5e1",
                            fontSize: 13,
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                          Event Tag / Category *
                        </label>
                        <input
                          type="text"
                          list="event-tags-presets"
                          required
                          placeholder="e.g. Campus Mega Fair, Tech & Gadgets..."
                          value={newTagline}
                          onChange={(e) => setNewTagline(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #cbd5e1",
                            fontSize: 13,
                          }}
                        />
                        <datalist id="event-tags-presets">
                          <option value="Campus Mega Fair" />
                          <option value="Tech, Gadgets & Lifestyle" />
                          <option value="Back to School Trade Fair" />
                          <option value="Fashion, Beauty & Apparel" />
                          <option value="Food, Drinks & Confectionery" />
                          <option value="Youth Entrepreneurship Expo" />
                        </datalist>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                          Location (Campus / City) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. FUTO Campus, Owerri"
                          value={newLocation}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: "1.5px solid #cbd5e1",
                            fontSize: 13,
                          }}
                        />
                        <small style={{ color: "#64748b", fontSize: 11, display: "block", marginTop: 4 }}>
                          Typing here auto-generates the web URL slug below.
                        </small>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                          Web URL Slug *
                        </label>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span
                            style={{
                              background: "#e2e8f0",
                              padding: "10px 10px",
                              border: "1.5px solid #cbd5e1",
                              borderRight: "none",
                              borderRadius: "8px 0 0 8px",
                              fontSize: 12,
                              color: "#475569",
                              fontFamily: "monospace",
                            }}
                          >
                            silo.events/
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="futo-campus-owerri"
                            value={newSlug}
                            onChange={(e) =>
                              setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                            }
                            style={{
                              flex: 1,
                              padding: "10px 12px",
                              borderRadius: "0 8px 8px 0",
                              border: "1.5px solid #cbd5e1",
                              fontSize: 13,
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: "#0015f8",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Specific Venue &amp; Hall *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hall of Excellence & Freedom Square, FUTO Campus"
                        value={newVenue}
                        onChange={(e) => setNewVenue(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1.5px solid #cbd5e1",
                          fontSize: 13,
                        }}
                      />
                    </div>
                  </div>

                  {/* 2. Date & Time Schedule */}
                  <div className="event-form-section">
                    <h4 className="event-form-section__title">
                      <Clock size={15} color="#0015f8" />
                      <span>2. Date &amp; Time Schedule</span>
                    </h4>
                    <p className="event-form-section__desc">
                      Set both date and time for opening and closing sessions.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          Start Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={newStartDate}
                          onChange={(e) => setNewStartDate(e.target.value)}
                          style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          Opening Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={newEndDate}
                          onChange={(e) => setNewEndDate(e.target.value)}
                          style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={newEndTime}
                          onChange={(e) => setNewEndTime(e.target.value)}
                          style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Stall Types & Dynamic Payment Plans Builder */}
                  <div className="event-form-section">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <h4 className="event-form-section__title" style={{ margin: 0 }}>
                        <Layers size={16} color="#0015f8" />
                        <span>3. Stall Types &amp; Dynamic Payment Plans Builder</span>
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={handleResetDefaultStalls}
                          className="btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12, height: "auto" }}
                          title="Reset to 3 standard presets (Standard Booth, Corner Stall, Mega Pavilion)"
                        >
                          <RefreshCw size={13} />
                          <span>Reset Presets</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddStallType}
                          className="btn-primary"
                          style={{
                            padding: "6px 14px",
                            fontSize: 12,
                            height: "auto",
                            background: "#0015f8",
                          }}
                        >
                          <Plus size={14} />
                          <span>Add Stall Type</span>
                        </button>
                      </div>
                    </div>
                    <p className="event-form-section__desc" style={{ marginBottom: 16 }}>
                      Configure the stall options for this exhibition. When you set or adjust a stall&apos;s base price (₦), its payment plans (full upfront, 2-part installment, and optional daily revenue share) will dynamically calculate in real time.
                    </p>

                    {/* Stalls List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {stallsList.map((stall, index) => {
                        const basePrice = Math.max(0, Number(stall.price) || 0);
                        const depositPct = stall.installmentDepositPercent ?? 50;
                        const installmentDueNow = Math.round(basePrice * (depositPct / 100));
                        const installmentBalance = basePrice - installmentDueNow;
                        const revDeposit = stall.revenueDepositAmount ?? 25000;
                        const revPct = stall.revenuePercentage ?? 10;

                        return (
                          <div
                            key={stall.id}
                            style={{
                              border: "1.5px solid #dce6f5",
                              borderRadius: 14,
                              background: "#ffffff",
                              overflow: "hidden",
                              boxShadow: "0 2px 8px rgba(10, 15, 46, 0.04)",
                            }}
                          >
                            {/* Stall Card Header */}
                            <div
                              style={{
                                padding: "12px 16px",
                                background: "#f8fafc",
                                borderBottom: "1.5px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  flex: 1,
                                  minWidth: 260,
                                }}
                              >
                                <span
                                  style={{
                                    background: "#0015f8",
                                    color: "#ffffff",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    padding: "3px 8px",
                                    borderRadius: 6,
                                    letterSpacing: "0.04em",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Stall #{index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={stall.title}
                                  placeholder="Stall Title (e.g. Standard Booth)"
                                  onChange={(e) =>
                                    handleUpdateStall(stall.id, { title: e.target.value })
                                  }
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: "#0a0f2e",
                                    padding: "4px 8px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: 6,
                                    flex: 1,
                                  }}
                                />
                                <input
                                  type="text"
                                  value={stall.size}
                                  placeholder="Dimensions (e.g. 2m × 2m)"
                                  onChange={(e) =>
                                    handleUpdateStall(stall.id, { size: e.target.value })
                                  }
                                  style={{
                                    fontSize: 12.5,
                                    color: "#475569",
                                    padding: "4px 8px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: 6,
                                    width: 150,
                                  }}
                                />
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {stallsList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStallType(stall.id)}
                                    style={{
                                      background: "#fee2e2",
                                      border: "1px solid #fca5a5",
                                      color: "#b91c1c",
                                      borderRadius: 6,
                                      padding: "5px 8px",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: 11.5,
                                      fontWeight: 600,
                                    }}
                                  >
                                    <Trash2 size={13} />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Stall Card Body */}
                            <div style={{ padding: 16 }}>
                              {/* Price and Badge Row */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1.2fr 1fr",
                                  gap: 16,
                                  marginBottom: 14,
                                }}
                              >
                                <div
                                  style={{
                                    background: "#eff6ff",
                                    border: "1.5px solid #bfdbfe",
                                    borderRadius: 10,
                                    padding: 12,
                                  }}
                                >
                                  <label
                                    style={{
                                      display: "block",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      color: "#1e40af",
                                      marginBottom: 4,
                                    }}
                                  >
                                    Base Stall Price (₦) * — Powers Dynamic Calculations
                                  </label>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    <span
                                      style={{
                                        background: "#dbeafe",
                                        padding: "8px 12px",
                                        border: "1.5px solid #93c5fd",
                                        borderRight: "none",
                                        borderRadius: "6px 0 0 6px",
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "#1e3a8a",
                                      }}
                                    >
                                      ₦
                                    </span>
                                    <input
                                      type="number"
                                      min={0}
                                      step={500}
                                      value={stall.price || ""}
                                      onChange={(e) =>
                                        handleUpdateStall(stall.id, { price: Number(e.target.value) })
                                      }
                                      placeholder="35000"
                                      style={{
                                        flex: 1,
                                        padding: "8px 12px",
                                        borderRadius: "0 6px 6px 0",
                                        border: "1.5px solid #93c5fd",
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "#0015f8",
                                      }}
                                    />
                                  </div>
                                  <small
                                    style={{
                                      color: "#3b82f6",
                                      fontSize: 11,
                                      marginTop: 4,
                                      display: "block",
                                    }}
                                  >
                                    Payment plans below dynamically adjust as you edit this price.
                                  </small>
                                </div>

                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#334155",
                                      marginBottom: 4,
                                    }}
                                  >
                                    Card Badge (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={stall.badge || ""}
                                    placeholder="e.g. High Foot Traffic, Popular, Anchor Brand"
                                    onChange={(e) =>
                                      handleUpdateStall(stall.id, { badge: e.target.value })
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "9px 12px",
                                      borderRadius: 8,
                                      border: "1.5px solid #cbd5e1",
                                      fontSize: 12.5,
                                    }}
                                  />
                                  <small
                                    style={{
                                      color: "#64748b",
                                      fontSize: 11,
                                      marginTop: 4,
                                      display: "block",
                                    }}
                                  >
                                    Highlight tag shown at the top of the stall card.
                                  </small>
                                </div>
                              </div>

                              {/* Description & Features */}
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 16,
                                  marginBottom: 16,
                                }}
                              >
                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#334155",
                                      marginBottom: 4,
                                    }}
                                  >
                                    Stall Description
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={stall.description || ""}
                                    placeholder="Ideal for student entrepreneurs, solo artisans, apparel & craft vendors."
                                    onChange={(e) =>
                                      handleUpdateStall(stall.id, { description: e.target.value })
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "8px 10px",
                                      borderRadius: 8,
                                      border: "1.5px solid #cbd5e1",
                                      fontSize: 12,
                                      resize: "vertical",
                                    }}
                                  />
                                </div>

                                <div>
                                  <label
                                    style={{
                                      display: "block",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#334155",
                                      marginBottom: 4,
                                    }}
                                  >
                                    Included Features / Amenities (One per line)
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={(stall.features || []).join("\n")}
                                    placeholder="1 Display table + 2 chairs&#10;1 Standard electrical socket&#10;2 Official Vendor passes"
                                    onChange={(e) =>
                                      handleUpdateStall(stall.id, {
                                        features: e.target.value
                                          .split("\n")
                                          .filter((f) => f.trim().length > 0),
                                      })
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "8px 10px",
                                      borderRadius: 8,
                                      border: "1.5px solid #cbd5e1",
                                      fontSize: 12,
                                      resize: "vertical",
                                    }}
                                  />
                                </div>
                              </div>

                              {/* DYNAMIC PAYMENT PLANS SECTION */}
                              <div
                                style={{
                                  background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                                  border: "1.5px solid #cbd5e1",
                                  borderRadius: 12,
                                  padding: 14,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    marginBottom: 12,
                                  }}
                                >
                                  <CreditCard size={15} color="#0015f8" />
                                  <strong style={{ fontSize: 13, color: "#0a0f2e" }}>
                                    Dynamic Payment Plans for {stall.title || "This Stall"} (Calculated from ₦{basePrice.toLocaleString()}):
                                  </strong>
                                </div>

                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                    gap: 12,
                                  }}
                                >
                                  {/* Plan 1: Full Payment */}
                                  <div
                                    style={{
                                      background: "#ffffff",
                                      border: "1.5px solid #93c5fd",
                                      borderRadius: 10,
                                      padding: 12,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: 11,
                                          fontWeight: 800,
                                          color: "#1e40af",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        Plan A • Full Upfront
                                      </span>
                                      <span
                                        style={{
                                          background: "#dcfce7",
                                          color: "#15803d",
                                          fontSize: 10.5,
                                          fontWeight: 700,
                                          padding: "2px 6px",
                                          borderRadius: 4,
                                        }}
                                      >
                                        Active (100%)
                                      </span>
                                    </div>
                                    <div style={{ fontSize: 17, fontWeight: 800, color: "#0015f8" }}>
                                      ₦{basePrice.toLocaleString()}
                                      <small
                                        style={{
                                          fontSize: 11,
                                          color: "#64748b",
                                          fontWeight: 500,
                                          marginLeft: 4,
                                        }}
                                      >
                                        one-off
                                      </small>
                                    </div>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 11.5,
                                        color: "#64748b",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      Pay 100% now for immediate confirmed allocation.
                                    </p>
                                  </div>

                                  {/* Plan 2: Installments */}
                                  <div
                                    style={{
                                      background:
                                        stall.enableInstallment !== false ? "#ffffff" : "#f1f5f9",
                                      border:
                                        stall.enableInstallment !== false
                                          ? "1.5px solid #0015f8"
                                          : "1.5px solid #e2e8f0",
                                      borderRadius: 10,
                                      padding: 12,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6,
                                      opacity: stall.enableInstallment !== false ? 1 : 0.6,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <label
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                          cursor: "pointer",
                                          fontSize: 11,
                                          fontWeight: 800,
                                          color: "#0a0f2e",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={stall.enableInstallment !== false}
                                          onChange={(e) =>
                                            handleUpdateStall(stall.id, {
                                              enableInstallment: e.target.checked,
                                            })
                                          }
                                          style={{ width: 14, height: 14, accentColor: "#0015f8" }}
                                        />
                                        <span>Plan B • Installments</span>
                                      </label>
                                      {stall.enableInstallment !== false && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                          <input
                                            type="number"
                                            min={10}
                                            max={90}
                                            value={depositPct}
                                            onChange={(e) =>
                                              handleUpdateStall(stall.id, {
                                                installmentDepositPercent: Number(e.target.value),
                                              })
                                            }
                                            style={{
                                              width: 44,
                                              padding: "2px 4px",
                                              fontSize: 11,
                                              fontWeight: 700,
                                              borderRadius: 4,
                                              border: "1px solid #cbd5e1",
                                            }}
                                          />
                                          <span
                                            style={{
                                              fontSize: 10.5,
                                              color: "#64748b",
                                              fontWeight: 700,
                                            }}
                                          >
                                            % dep
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 15,
                                        fontWeight: 800,
                                        color:
                                          stall.enableInstallment !== false ? "#0a0f2e" : "#94a3b8",
                                      }}
                                    >
                                      ₦{installmentDueNow.toLocaleString()}{" "}
                                      <small
                                        style={{ color: "#16a34a", fontWeight: 700, fontSize: 11 }}
                                      >
                                        now
                                      </small>{" "}
                                      + ₦{installmentBalance.toLocaleString()}{" "}
                                      <small
                                        style={{ color: "#64748b", fontWeight: 600, fontSize: 11 }}
                                      >
                                        later
                                      </small>
                                    </div>
                                    <p
                                      style={{
                                        margin: 0,
                                        fontSize: 11.5,
                                        color: "#64748b",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      Pay {depositPct}% deposit today. Balance due 7 days prior.
                                    </p>
                                  </div>

                                  {/* Plan 3: Revenue Share / Pay Daily */}
                                  <div
                                    style={{
                                      background: stall.enableRevenueShare ? "#ffffff" : "#f1f5f9",
                                      border: stall.enableRevenueShare
                                        ? "1.5px solid #d97706"
                                        : "1.5px solid #e2e8f0",
                                      borderRadius: 10,
                                      padding: 12,
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6,
                                      opacity: stall.enableRevenueShare ? 1 : 0.65,
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                      }}
                                    >
                                      <label
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 6,
                                          cursor: "pointer",
                                          fontSize: 11,
                                          fontWeight: 800,
                                          color: "#92400e",
                                          textTransform: "uppercase",
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={Boolean(stall.enableRevenueShare)}
                                          onChange={(e) =>
                                            handleUpdateStall(stall.id, {
                                              enableRevenueShare: e.target.checked,
                                            })
                                          }
                                          style={{ width: 14, height: 14, accentColor: "#d97706" }}
                                        />
                                        <span>Plan C • Pay Daily (Rev Share)</span>
                                      </label>
                                    </div>
                                    {stall.enableRevenueShare ? (
                                      <>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 4,
                                            }}
                                          >
                                            <span style={{ fontSize: 11, color: "#78350f" }}>
                                              Dep: ₦
                                            </span>
                                            <input
                                              type="number"
                                              min={0}
                                              step={1000}
                                              value={revDeposit}
                                              onChange={(e) =>
                                                handleUpdateStall(stall.id, {
                                                  revenueDepositAmount: Number(e.target.value),
                                                })
                                              }
                                              style={{
                                                width: 65,
                                                padding: "2px 4px",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                borderRadius: 4,
                                                border: "1px solid #fcd34d",
                                              }}
                                            />
                                          </div>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 4,
                                            }}
                                          >
                                            <span style={{ fontSize: 11, color: "#78350f" }}>
                                              Share:
                                            </span>
                                            <input
                                              type="number"
                                              min={1}
                                              max={50}
                                              value={revPct}
                                              onChange={(e) =>
                                                handleUpdateStall(stall.id, {
                                                  revenuePercentage: Number(e.target.value),
                                                })
                                              }
                                              style={{
                                                width: 44,
                                                padding: "2px 4px",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                borderRadius: 4,
                                                border: "1px solid #fcd34d",
                                              }}
                                            />
                                            <span style={{ fontSize: 11, color: "#78350f" }}>%</span>
                                          </div>
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 14,
                                            fontWeight: 800,
                                            color: "#b45309",
                                          }}
                                        >
                                          ₦{revDeposit.toLocaleString()}{" "}
                                          <small style={{ fontSize: 11, color: "#92400e" }}>
                                            dep
                                          </small>{" "}
                                          + {revPct}% daily
                                        </div>
                                      </>
                                    ) : (
                                      <p
                                        style={{
                                          margin: "4px 0 0",
                                          fontSize: 11.5,
                                          color: "#94a3b8",
                                        }}
                                      >
                                        Optional revenue percentage plan (ideal for mega anchor
                                        booths).
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Terms & Conditions & Important Disclaimer Notice */}
                  <div className="event-form-section">
                    <h4 className="event-form-section__title">
                      <AlertTriangle size={15} color="#f59e0b" />
                      <span>4. Terms &amp; Conditions &amp; Important Disclaimer Notice</span>
                    </h4>
                    <p className="event-form-section__desc">
                      Add event rules. Check <strong>&quot;Mark as Important&quot;</strong> on any term to render it prominently on the micro-page disclaimer box.
                    </p>

                    {/* Interactive Terms List */}
                    <div className="terms-builder-list">
                      {termsList.map((term, index) => (
                        <div
                          key={term.id}
                          className={`terms-builder-item ${term.isImportant ? "is-important" : ""}`}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", width: 22 }}>
                            {index + 1}.
                          </span>

                          <input
                            type="text"
                            value={term.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTermsList((prev) =>
                                prev.map((t) => (t.id === term.id ? { ...t, text: val } : t))
                              );
                            }}
                            style={{
                              flex: 1,
                              padding: "7px 10px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: 13,
                              background: "#ffffff",
                            }}
                          />

                          <label
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: term.isImportant ? "#fef3c7" : "#f1f5f9",
                              color: term.isImportant ? "#b45309" : "#475569",
                              border: `1px solid ${term.isImportant ? "#fde68a" : "#cbd5e1"}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={term.isImportant}
                              onChange={() => handleToggleTermImportant(term.id)}
                              style={{ accentColor: "#f59e0b" }}
                            />
                            <span>{term.isImportant ? "★ Important (Disclaimer)" : "Standard"}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveTerm(term.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                              padding: 4,
                            }}
                            title="Remove term"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add New Term Input */}
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <input
                        type="text"
                        placeholder="Add a new term or policy..."
                        value={newTermInput}
                        onChange={(e) => setNewTermInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTerm();
                          }
                        }}
                        style={{
                          flex: 1,
                          minWidth: 260,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1.5px solid #cbd5e1",
                          fontSize: 13,
                        }}
                      />

                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "8px 12px",
                          borderRadius: 8,
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          color: "#92400e",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={newTermIsImportant}
                          onChange={(e) => setNewTermIsImportant(e.target.checked)}
                          style={{ accentColor: "#f59e0b" }}
                        />
                        <span>Mark as Important</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleAddTerm}
                        className="btn-secondary"
                        style={{ padding: "8px 14px", fontSize: 12.5 }}
                      >
                        <Plus size={14} />
                        <span>Add Term</span>
                      </button>
                    </div>

                    {/* Live Micro-Page Disclaimer Notice Box Preview */}
                    <div className="micropage-disclaimer-preview">
                      <div className="micropage-disclaimer-preview__badge">
                        <Wallet size={14} color="#93c5fd" />
                        <span>LIVE PREVIEW: MICROPAGE DISCLAIMER NOTICE BOX</span>
                      </div>
                      {newCashlessPolicy && <p>{newCashlessPolicy}</p>}
                      {importantTermsArray.length > 0 ? (
                        <div
                          style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTop: "1px dashed rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <strong style={{ color: "#fcd34d", fontSize: 12 }}>
                            Important Terms:
                          </strong>
                          <ul
                            style={{
                              margin: "6px 0 0",
                              paddingLeft: 18,
                              fontSize: 12.5,
                              color: "#fef3c7",
                            }}
                          >
                            {importantTermsArray.map((t) => (
                              <li key={t.id}>{t.text}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic", marginTop: 6 }}>
                          (No terms marked as important yet. Check &quot;Important&quot; on any term above to show it on the micro-page disclaimer box.)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 5. Media Assets & Description */}
                  <div className="event-form-section">
                    <h4 className="event-form-section__title">
                      <ImageIcon size={15} color="#0015f8" />
                      <span>5. Media Assets &amp; Description</span>
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                      <CloudinaryImageUpload
                        label="Flier Poster Image (Main Display)"
                        folder="silo-exhibitions/events/fliers"
                        value={newFlierUrl}
                        onChange={(url) => setNewFlierUrl(url)}
                        aspectRatioHint="Recommended: 4:5 or 1:1"
                        placeholder="Click or drag event flier to upload to Cloudinary"
                      />

                      <CloudinaryImageUpload
                        label="Cover Banner Image (Header)"
                        folder="silo-exhibitions/events/covers"
                        value={newCoverUrl}
                        onChange={(url) => setNewCoverUrl(url)}
                        aspectRatioHint="Recommended: 16:9 banner"
                        placeholder="Click or drag cover banner to upload to Cloudinary"
                      />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Exhibition Overview / Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell vendors and attendees what makes this exhibition special..."
                        value={newWriteUp}
                        onChange={(e) => setNewWriteUp(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                        Cashless &amp; Stall QR Paypoint Policy
                      </label>
                      <textarea
                        rows={2}
                        value={newCashlessPolicy}
                        onChange={(e) => setNewCashlessPolicy(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13 }}
                      />
                    </div>
                  </div>

                  {/* 6. Resend Email Broadcast Option */}
                  {!editingEvent && (
                    <div className="resend-broadcast-banner">
                      <Mail size={22} className="resend-broadcast-banner__icon" />
                      <div className="resend-broadcast-banner__body">
                        <h4>Automatic Resend Email Announcement</h4>
                        <p>
                          When enabled, Silo will immediately dispatch a branded announcement email to all{" "}
                          <strong>{stats.totalUsers} registered users</strong> containing direct links to book a stall
                          and view event schedules.
                        </p>
                        <label className="resend-broadcast-banner__toggle">
                          <input
                            type="checkbox"
                            checked={notifyUsersWithResend}
                            onChange={(e) => setNotifyUsersWithResend(e.target.checked)}
                          />
                          <span>Send email announcement via Resend automatically upon publishing</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                    <button
                      type="submit"
                      disabled={isSubmittingEvent}
                      className="btn-primary"
                    >
                      <Plus size={16} />
                      <span>
                        {isSubmittingEvent
                          ? "Processing..."
                          : editingEvent
                          ? "Save Exhibition Changes"
                          : "Publish Exhibition & Broadcast"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventModal(false);
                        setEditingEvent(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── EXHIBITIONS LISTING & MANAGEMENT ────────────────────── */}
            <div className="admin-card">
              <div className="admin-card__head">
                <div>
                  <h3>
                    {eventCategoryFilter === "ALL" && "All Exhibitions"}
                    {eventCategoryFilter === "CURRENT" && "Currently Actively Booking Stalls"}
                    {eventCategoryFilter === "UPCOMING" && "Upcoming Exhibitions"}
                    {eventCategoryFilter === "PAST" && "Past Concluded Exhibitions"}
                    {eventCategoryFilter === "DRAFT" && "Draft Exhibitions"} ({displayedEvents.length})
                  </h3>
                  <p>
                    {eventCategoryFilter === "CURRENT" &&
                      "These exhibitions are live and vendors are currently booking stalls."}
                    {eventCategoryFilter === "UPCOMING" &&
                      "Scheduled future trade fairs and exhibitions."}
                    {eventCategoryFilter === "PAST" &&
                      "Completed trade fairs archived in the database."}
                    {eventCategoryFilter === "DRAFT" && "Unpublished exhibition drafts."}
                    {eventCategoryFilter === "ALL" && "Comprehensive list of all platform exhibitions."}
                  </p>
                </div>

                {!showEventModal && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="btn-primary"
                  >
                    <Plus size={16} />
                    <span>Upload Exhibition</span>
                  </button>
                )}
              </div>

              {displayedEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                  <Calendar size={40} color="#94a3b8" />
                  <h4 style={{ margin: "14px 0 6px", color: "#0a0f2e", fontSize: 16 }}>
                    No exhibitions found
                  </h4>
                  <p style={{ color: "#64748b", margin: "0 0 16px", fontSize: 13.5 }}>
                    {eventSearchQuery
                      ? "No events match your search query."
                      : "No exhibitions found in this category filter."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEventCategoryFilter("ALL");
                      setEventSearchQuery("");
                    }}
                    className="btn-secondary"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Exhibition &amp; Tag</th>
                        <th>Location &amp; Venue</th>
                        <th>Dates &amp; Time</th>
                        <th>Payment Plans</th>
                        <th>Stalls &amp; Volunteers</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedEvents.map((ev) => {
                        const activelyBooking = isEventActivelyBooking(ev);
                        const isUp =
                          new Date(ev.startDate).getTime() > nowTime && ev.status !== "ARCHIVED";
                        const isP =
                          new Date(ev.startDate).getTime() <= nowTime || ev.status === "ARCHIVED";

                        return (
                          <tr key={ev.id}>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <strong>{ev.title}</strong>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <Link
                                    href={`/${ev.slug}`}
                                    target="_blank"
                                    style={{
                                      color: "#0015f8",
                                      fontWeight: 700,
                                      fontSize: 12,
                                      fontFamily: "monospace",
                                      textDecoration: "none",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    <span>/{ev.slug}</span>
                                    <ExternalLink size={10} />
                                  </Link>
                                  {ev.tagline && (
                                    <span
                                      className="status-badge is-user"
                                      style={{ fontSize: 10.5, padding: "2px 7px" }}
                                    >
                                      {ev.tagline}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span>{ev.venue}</span>
                              <br />
                              <small style={{ color: "#64748b" }}>
                                <MapPin size={11} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                                {ev.location || "Campus Ground"}
                              </small>
                            </td>

                            <td>
                              <div style={{ fontSize: 12.5 }}>
                                {new Date(ev.startDate).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                              <small style={{ color: "#64748b", fontSize: 11.5 }}>
                                {new Date(ev.startDate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {ev.endDate && (
                                  <>
                                    {" - "}
                                    {new Date(ev.endDate).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </>
                                )}
                              </small>
                            </td>

                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12 }}>
                                <span style={{ color: "#0a0f2e", fontWeight: 600 }}>One-Time Full</span>
                                <span style={{ color: "#0015f8", fontSize: 11 }}>Pay As You Go</span>
                              </div>
                            </td>

                            <td>
                              <div>
                                <strong>{ev._count?.vendorApplications || 0}</strong>{" "}
                                <span style={{ color: "#64748b", fontSize: 12 }}>stalls</span>
                              </div>
                              <small style={{ color: "#64748b" }}>
                                {ev._count?.volunteerApplications || 0} crew
                              </small>
                              {ev.importantTerms && (
                                <div
                                  style={{
                                    fontSize: 10.5,
                                    color: "#d97706",
                                    fontWeight: 700,
                                    marginTop: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                  }}
                                  title={ev.importantTerms}
                                >
                                  <span>⚠️ Important Terms Set</span>
                                </div>
                              )}
                            </td>

                            <td>
                              {activelyBooking ? (
                                <span className="status-badge is-active-booking">
                                  <span className="event-pulse-dot" />
                                  <span>Actively Booking</span>
                                </span>
                              ) : isUp ? (
                                <span className="status-badge is-upcoming">Upcoming</span>
                              ) : isP ? (
                                <span className="status-badge is-past">Past</span>
                              ) : (
                                <span className="status-badge is-draft">{ev.status}</span>
                              )}
                            </td>

                            <td style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => openEditModal(ev)}
                                  className="btn-secondary"
                                  style={{ padding: "5px 9px", fontSize: 11 }}
                                  title="Edit event specifications, payment plans, and terms"
                                >
                                  <Edit3 size={12} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(ev)}
                                  className="btn-secondary"
                                  style={{ padding: "5px 9px", fontSize: 11 }}
                                  title={ev.status === "PUBLISHED" ? "Unpublish event" : "Publish event"}
                                >
                                  {ev.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                                </button>

                                <Link
                                  href={`/${ev.slug}`}
                                  target="_blank"
                                  className="btn-secondary"
                                  style={{ padding: "5px 9px", fontSize: 11 }}
                                  title="Preview live public micro-page"
                                >
                                  <ExternalLink size={12} />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev)}
                                  className="btn-danger"
                                  title="Delete event"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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

                <div style={{ marginBottom: 16 }}>
                  <CloudinaryImageUpload
                    label="Media Asset (Photo or Highlight)"
                    folder="silo-exhibitions/events/gallery"
                    value={galleryMediaUrl}
                    onChange={(url) => setGalleryMediaUrl(url)}
                    placeholder="Click or drag image to upload directly to Cloudinary"
                    required
                  />

                  <div style={{ marginTop: 12 }}>
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
