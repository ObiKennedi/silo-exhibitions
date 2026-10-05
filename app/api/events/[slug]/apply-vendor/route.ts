import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVendorReviewEmail } from "@/lib/email";
import { sendTelegramVendorAlert } from "@/lib/telegram";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const body = await req.json();

    const effectiveBrandName = body.brandName || body.businessName;
    const effectiveOwnerName = body.ownerName || body.contactName || effectiveBrandName;
    const effectiveSocialHandle = body.socialHandle || body.instagram || null;
    const senderAccountName = (body.senderAccountName || "").trim();
    const paymentProofUrl = (body.paymentProofUrl || "").trim() || null;
    const paymentProofPublicId = (body.paymentProofPublicId || "").trim() || null;

    const structuredDescription = [
        body.productsSelling || body.description,
        senderAccountName ? `Bank Transfer Sender Name: ${senderAccountName}` : null,
        paymentProofUrl ? `Payment Proof Screenshot: ${paymentProofUrl}` : null,
        body.businessAddress ? `Business Address: ${body.businessAddress}` : null,
        body.estimatedGoodsWorth ? `Estimated Goods Worth: ${body.estimatedGoodsWorth}` : null,
        body.majorProductPrice ? `Major Product Price: ${body.majorProductPrice}` : null,
        body.discountPercentage ? `Discount Offered: ${body.discountPercentage}` : null,
    ].filter(Boolean).join("\n\n") || null;

    if (!effectiveBrandName || !body.email || !body.phone) {
        return NextResponse.json(
            { error: "Brand name, email, and phone number are required" },
            { status: 400 }
        );
    }

    const bookingCode = body.bookingCode || `SILO-VND-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanEmail = body.email.trim().toLowerCase();

    let eventTitle = body.eventTitle || "Silo Campus Trade Fair";
    let eventId: string | null = null;

    try {
        const event = await prisma.event.findFirst({
            where: { slug },
            select: { id: true, title: true },
        });
        if (event) {
            eventId = event.id;
            if (event.title) eventTitle = event.title;
        }
    } catch {
        // Event lookup optional if schema not yet migrated
    }

    try {
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
                businessName: effectiveBrandName,
                category: body.category || "General Merchandise",
                contactName: effectiveOwnerName,
                email: cleanEmail,
                phone: body.phone,
                instagram: effectiveSocialHandle,
                description: structuredDescription,
                powerNeeds: body.powerNeeds || null,
                stallId: body.stallId || "standard",
                stallTitle: body.stallTitle || "Standard Stall",
                planId: body.planId || "full",
                planName: body.planName || "Option 1",
                dueNow: String(body.dueNow ?? body.paidAmount ?? 0),
                isRevenueShare: Boolean(body.isRevenueShare),
                revenuePercentage: body.revenuePercentage != null ? String(body.revenuePercentage) : null,
                paymentStatus: "PENDING",
                paymentReference: body.paymentReference || `OPAY-${Date.now()}`,
                transactionId: senderAccountName || body.transactionId || null,
                paidAmount: body.paidAmount != null ? String(body.paidAmount) : String(body.dueNow ?? 0),
                channel: "OPay Bank Transfer",
                paymentProofUrl,
                paymentProofPublicId,
                paidAt: null, // set to null until verified by admin
            },
        });
    } catch (err) {
        console.warn("[Vendor Application DB] Unable to persist directly to Prisma:", err);
    }

    console.log(`[Vendor Application] Stored for "${slug}":`, {
        bookingCode,
        businessName: effectiveBrandName,
        senderAccountName,
        stallTitle: body.stallTitle,
        planName: body.planName,
        dueNow: body.dueNow,
    });

    // 1. Dispatch confirmation email to the applicant that registration is under review
    sendVendorReviewEmail({
        recipientEmail: cleanEmail,
        contactName: effectiveOwnerName,
        businessName: effectiveBrandName,
        eventTitle,
        stallTitle: body.stallTitle || "Exhibition Stand",
        planName: body.planName || "Stand Option",
        dueNow: body.dueNow ?? body.paidAmount ?? 0,
        senderAccountName: senderAccountName || effectiveOwnerName,
        bookingCode,
        category: body.category || "General Merchandise",
    }).catch((err) => {
        console.error("[Vendor Review Email] Error sending review notification:", err);
    });

    // 2. Dispatch Telegram alert to the Admin
    sendTelegramVendorAlert({
        bookingCode,
        eventTitle,
        businessName: effectiveBrandName,
        contactName: effectiveOwnerName,
        email: cleanEmail,
        phone: body.phone,
        category: body.category || "General Merchandise",
        stallTitle: body.stallTitle || "Exhibition Stand",
        planName: body.planName || "Stand Option",
        dueNow: body.dueNow ?? body.paidAmount ?? 0,
        senderAccountName: senderAccountName || effectiveOwnerName,
        productsSelling: body.productsSelling,
        businessAddress: body.businessAddress,
        socialHandle: effectiveSocialHandle,
        paymentProofUrl: paymentProofUrl || undefined,
    }).catch((err) => {
        console.error("[Telegram Alert] Error sending admin telegram notification:", err);
    });

    return NextResponse.json({
        success: true,
        bookingCode,
        senderAccountName: senderAccountName || effectiveOwnerName,
        status: "UNDER_REVIEW",
        message: "Vendor stall application recorded successfully. Verification email and admin telegram alert dispatched.",
    });
}
