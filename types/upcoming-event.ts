export type UpcomingEventStatus = "Registration open" | "Coming soon" | "Sold out";

export interface RidePickupPoint {
    id: string;
    name: string;
    time: string;
}

export interface Sponsor {
    id: string;
    name: string;
    tier?: "Headline" | "Gold" | "Silver" | "Partner";
    logoUrl?: string;
    logoPublicId?: string;
}

export type PaymentPlanId = "full" | "installment" | "revenue_percentage" | string;

export interface StallPaymentPlan {
    id: PaymentPlanId;
    name: string;
    dueNow: number;
    totalAmountText: string;
    description: string;
    isRevenueShare?: boolean;
    revenuePercentage?: number;
}

export interface StallConfig {
    id: string;
    title: string;
    size: string;
    price?: number;
    badge?: string;
    description: string;
    features: string[];
    enableInstallment?: boolean;
    installmentDepositPercent?: number;
    enableRevenueShare?: boolean;
    revenueDepositAmount?: number;
    revenuePercentage?: number;
    availablePlans: StallPaymentPlan[];
}

export interface UpcomingEvent {
    id: string;
    slug: string;
    title: string;
    venue: string;
    startDate: string;
    endDate: string;
    flier: string;
    flierPublicId?: string;
    coverImageUrl?: string;
    coverImagePublicId?: string;
    status: UpcomingEventStatus;
    writeUp: string;

    vendorCall: {
        enabled: boolean;
        description: string;
        applyUrl: string;
    };

    volunteerCall: {
        enabled: boolean;
        description: string;
        applyUrl: string;
    };

    waitlistEnabled: boolean;

    whatsappUrl: string;

    rideBooking?: {
        enabled: boolean;
        pickupPoints: RidePickupPoint[];
        bookUrl: string;
    };

    cashlessPolicy?: string;
    importantTerms?: string;

    exhibitionPlan: {
        summary: string;
        documentUrl?: string;
        paymentOptions?: {
            oneTime?: boolean;
            payAsYouGo?: boolean;
            depositPercentage?: number;
            payAsYouGoNote?: string;
        };
    };

    sponsors: Sponsor[];

    stallsConfig?: StallConfig[];
}