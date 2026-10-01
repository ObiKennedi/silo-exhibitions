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
    };

    sponsors: Sponsor[];
}