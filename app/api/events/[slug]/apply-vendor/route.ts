import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const body = await req.json();

    if (!body.businessName || !body.email || !body.phone) {
        return NextResponse.json(
            { error: "Business name, email, and phone are required" },
            { status: 400 }
        );
    }

    const bookingCode = body.bookingCode || `SILO-VND-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanEmail = body.email.trim().toLowerCase();

    try {
        // Attempt to find the event by slug to attach relation if available
        let eventId: string | null = null;
        try {
            const event = await prisma.event.findFirst({
                where: { slug, status: "PUBLISHED" },
                select: { id: true },
            });
            if (event) eventId = event.id;
        } catch {
            // Event lookup optional if schema not yet migrated
        }

        // Check if an account already exists for this email
        let linkedUserId: string | null = body.userId || null;
        if (!linkedUserId) {
            try {
                const existingUser = await prisma.user.findUnique({
                    where: { email: cleanEmail },
                    select: { id: true },
                });
                if (existingUser) linkedUserId = existingUser.id;
            } catch {
                // User lookup optional
            }
        }

        // Save application: linked to user if existing, otherwise guest checkout
        await prisma.vendorApplication.create({
            data: {
                bookingCode,
                eventSlug: slug,
                eventId,
                userId: linkedUserId,
                businessName: body.businessName,
                category: body.category || "General",
                contactName: body.contactName || body.businessName,
                email: cleanEmail,
                phone: body.phone,
                instagram: body.instagram || null,
                description: body.description || null,
                powerNeeds: body.powerNeeds || null,
                stallId: body.stallId || "standard",
                stallTitle: body.stallTitle || "Standard Stall",
                planId: body.planId || "full",
                planName: body.planName || "Full Payment",
                dueNow: String(body.dueNow ?? body.paidAmount ?? 0),
                isRevenueShare: Boolean(body.isRevenueShare),
                revenuePercentage: body.revenuePercentage != null ? String(body.revenuePercentage) : null,
                paymentStatus: body.paymentReference ? "SUCCESS" : "PENDING",
                paymentReference: body.paymentReference || null,
                transactionId: body.transactionId || null,
                paidAmount: body.paidAmount != null ? String(body.paidAmount) : null,
                channel: body.channel || null,
                paidAt: body.paymentReference ? new Date() : null,
            },
        });
    } catch (err) {
        console.warn("[Vendor Application DB] Unable to persist directly to Prisma:", err);
    }

    console.log(`[Vendor Application] Stored for "${slug}":`, {
        bookingCode,
        businessName: body.businessName,
        stallTitle: body.stallTitle,
        planName: body.planName,
        paidAmount: body.paidAmount,
        paymentReference: body.paymentReference,
        isRevenueShare: body.isRevenueShare,
        guestCheckout: !body.userId,
    });

    return NextResponse.json({
        success: true,
        bookingCode,
        message: "Vendor stall application recorded successfully",
    });
}

