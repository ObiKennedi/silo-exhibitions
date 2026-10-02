import { StallConfig, StallPaymentPlan } from "@/types/upcoming-event";

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
            name: `Option 2: Pay Daily (${revPct}% Daily Total Sales)`,
            dueNow: deposit,
            totalAmountText: `₦${deposit.toLocaleString()} Setup Deposit + ${revPct}% Daily Total Sales`,
            description: `Lower initial commitment. Pay a ₦${deposit.toLocaleString()} setup deposit today, then remit ${revPct}% of total sales at the end of each day.`,
            isRevenueShare: true,
            revenuePercentage: revPct,
        });
    }

    return plans;
}

export const DEFAULT_STALL_CONFIGS: StallConfig[] = [
    {
        id: "compact",
        title: "Standard Booth",
        size: "2m × 2m (4 sqm)",
        price: 35000,
        badge: "Popular",
        description: "Ideal for student entrepreneurs, solo artisans, apparel & craft vendors.",
        features: [
            "1 Display table + 2 chairs",
            "1 Standard electrical socket (500W)",
            "2 Official Vendor passes",
            "Basic directory listing in campus program",
        ],
        enableInstallment: true,
        installmentDepositPercent: 50,
        enableRevenueShare: false,
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
        enableInstallment: true,
        installmentDepositPercent: 50,
        enableRevenueShare: false,
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
        enableInstallment: true,
        installmentDepositPercent: 50,
        enableRevenueShare: true,
        revenueDepositAmount: 25000,
        revenuePercentage: 10,
        availablePlans: [],
    },
].map((s) => ({
    ...s,
    availablePlans: computeStallPlans(s),
}));
