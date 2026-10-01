import { prisma } from "@/lib/prisma";

/**
 * Normalizes email addresses to prevent case-sensitive mismatches.
 */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/**
 * Automatically claims and links any past vendor registrations (and volunteer applications)
 * submitted with this email before the user created their account.
 *
 * @param userId - The newly created or active user ID
 * @param email  - The user's account email
 */
export async function autoLinkRegistrationsToUser(userId: string, email: string) {
    if (!userId || !email) return { vendorCount: 0, volunteerCount: 0 };

    const cleanEmail = normalizeEmail(email);

    try {
        // Link all past unlinked vendor applications for this email
        const vendorResult = await prisma.vendorApplication.updateMany({
            where: {
                email: {
                    equals: cleanEmail,
                    mode: "insensitive",
                },
                userId: null,
            },
            data: {
                userId,
            },
        });

        // Also link any volunteer applications for this email
        const volunteerResult = await prisma.volunteerApplication.updateMany({
            where: {
                email: {
                    equals: cleanEmail,
                    mode: "insensitive",
                },
                userId: null,
            },
            data: {
                userId,
            },
        });

        if (vendorResult.count > 0 || volunteerResult.count > 0) {
            console.log(
                `[Auto-Link] Successfully linked ${vendorResult.count} vendor registration(s) and ${volunteerResult.count} volunteer application(s) to user ${userId} (${cleanEmail})`
            );
        }

        return {
            vendorCount: vendorResult.count,
            volunteerCount: volunteerResult.count,
        };
    } catch (err) {
        console.error(`[Auto-Link] Error linking registrations to user ${userId}:`, err);
        return { vendorCount: 0, volunteerCount: 0 };
    }
}

/**
 * Fetches all vendor registrations for a user dashboard.
 * Uses a dual-lookup strategy:
 * 1. Proactively links any unlinked registrations with this email.
 * 2. Queries by BOTH `userId` and `email` (case-insensitive) so that any prior
 *    guest registrations ALWAYS show up instantly on the user's dashboard.
 */
export interface DashboardVendorBooking {
    id: string;
    bookingCode: string;
    eventId: string | null;
    eventSlug: string;
    businessName: string;
    category: string;
    contactName: string;
    email: string;
    phone: string;
    instagram: string | null;
    description: string | null;
    powerNeeds: string | null;
    logoUrl: string | null;
    stallId: string;
    stallTitle: string;
    planId: string;
    planName: string;
    dueNow: number;
    paidAmount: number | null;
    isRevenueShare: boolean;
    revenuePercentage: number | null;
    paymentStatus: string;
    paymentReference: string | null;
    transactionId: string | null;
    channel: string | null;
    paidAt: string | null;
    createdAt: string;
    event: {
        id: string;
        slug: string;
        title: string;
        venue: string;
        location: string | null;
        startDate: string;
        endDate: string | null;
        coverImageUrl: string | null;
        flierUrl: string | null;
        eventType: string | null;
        registrationStatus: string;
        whatsappUrl?: string | null;
        cashlessPolicy?: string | null;
        exhibitionPlanDocUrl?: string | null;
    } | null;
}

export interface DashboardVolunteerApplication {
    id: string;
    volunteerCode: string;
    eventId: string | null;
    eventSlug: string;
    fullName: string;
    email: string;
    phone: string;
    primaryRole: string;
    institution: string | null;
    daysAvailable: string | null;
    tshirtSize: string | null;
    experience: string | null;
    emergencyContact: string | null;
    status: string;
    createdAt: string;
    event: {
        id: string;
        slug: string;
        title: string;
        venue: string;
        location: string | null;
        startDate: string;
        endDate: string | null;
        coverImageUrl: string | null;
        flierUrl: string | null;
    } | null;
}

/**
 * Fetches all vendor registrations for a user dashboard.
 * Proactively links guest registrations and serializes Decimals/Dates for Client Component safety.
 */
export async function getUserVendorRegistrations(
    userId?: string | null,
    email?: string | null
): Promise<DashboardVendorBooking[]> {
    if (!userId && !email) return [];

    const cleanEmail = email ? normalizeEmail(email) : null;

    if (userId && cleanEmail) {
        await autoLinkRegistrationsToUser(userId, cleanEmail);
    }

    try {
        const orConditions = [];
        if (userId) orConditions.push({ userId });
        if (cleanEmail) {
            orConditions.push({
                email: {
                    equals: cleanEmail,
                    mode: "insensitive" as const,
                },
            });
        }

        const raw = await prisma.vendorApplication.findMany({
            where: { OR: orConditions },
            include: {
                event: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        venue: true,
                        location: true,
                        startDate: true,
                        endDate: true,
                        coverImageUrl: true,
                        flierUrl: true,
                        eventType: true,
                        registrationStatus: true,
                        whatsappUrl: true,
                        cashlessPolicy: true,
                        exhibitionPlanDocUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return raw.map((app) => ({
            id: app.id,
            bookingCode: app.bookingCode,
            eventId: app.eventId,
            eventSlug: app.eventSlug,
            businessName: app.businessName,
            category: app.category,
            contactName: app.contactName,
            email: app.email,
            phone: app.phone,
            instagram: app.instagram,
            description: app.description,
            powerNeeds: app.powerNeeds,
            logoUrl: app.logoUrl,
            stallId: app.stallId,
            stallTitle: app.stallTitle,
            planId: app.planId,
            planName: app.planName,
            dueNow: Number(app.dueNow) || 0,
            paidAmount: app.paidAmount ? Number(app.paidAmount) : null,
            isRevenueShare: app.isRevenueShare,
            revenuePercentage: app.revenuePercentage ? Number(app.revenuePercentage) : null,
            paymentStatus: app.paymentStatus,
            paymentReference: app.paymentReference,
            transactionId: app.transactionId,
            channel: app.channel,
            paidAt: app.paidAt ? app.paidAt.toISOString() : null,
            createdAt: app.createdAt.toISOString(),
            event: app.event
                ? {
                      ...app.event,
                      startDate: app.event.startDate.toISOString(),
                      endDate: app.event.endDate ? app.event.endDate.toISOString() : null,
                  }
                : null,
        }));
    } catch (err) {
        console.error("[getUserVendorRegistrations] Error loading dashboard registrations:", err);
        return [];
    }
}

/**
 * Fetches all volunteer applications for a user.
 */
export async function getUserVolunteerApplications(
    userId?: string | null,
    email?: string | null
): Promise<DashboardVolunteerApplication[]> {
    if (!userId && !email) return [];

    const cleanEmail = email ? normalizeEmail(email) : null;

    try {
        const orConditions = [];
        if (userId) orConditions.push({ userId });
        if (cleanEmail) {
            orConditions.push({
                email: {
                    equals: cleanEmail,
                    mode: "insensitive" as const,
                },
            });
        }

        const raw = await prisma.volunteerApplication.findMany({
            where: { OR: orConditions },
            include: {
                event: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        venue: true,
                        location: true,
                        startDate: true,
                        endDate: true,
                        coverImageUrl: true,
                        flierUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return raw.map((vol) => ({
            id: vol.id,
            volunteerCode: vol.volunteerCode,
            eventId: vol.eventId,
            eventSlug: vol.eventSlug,
            fullName: vol.fullName,
            email: vol.email,
            phone: vol.phone,
            primaryRole: vol.primaryRole,
            institution: vol.institution,
            daysAvailable: vol.daysAvailable,
            tshirtSize: vol.tshirtSize,
            experience: vol.experience,
            emergencyContact: vol.emergencyContact,
            status: vol.status,
            createdAt: vol.createdAt.toISOString(),
            event: vol.event
                ? {
                      ...vol.event,
                      startDate: vol.event.startDate.toISOString(),
                      endDate: vol.event.endDate ? vol.event.endDate.toISOString() : null,
                  }
                : null,
        }));
    } catch (err) {
        console.error("[getUserVolunteerApplications] Error loading user volunteer applications:", err);
        return [];
    }
}
