import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVendorApprovedEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { applicationId } = body;

        if (!applicationId) {
            return NextResponse.json(
                { error: "Application ID is required." },
                { status: 400 }
            );
        }

        const existing = await prisma.vendorApplication.findUnique({
            where: { id: applicationId },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        venue: true,
                        startDate: true,
                    },
                },
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Vendor application not found." },
                { status: 404 }
            );
        }

        const paidAmount = Number(existing.dueNow || existing.paidAmount || 0);

        const updated = await prisma.vendorApplication.update({
            where: { id: applicationId },
            data: {
                paymentStatus: "SUCCESS",
                paidAmount: paidAmount,
                paidAt: new Date(),
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        venue: true,
                        startDate: true,
                    },
                },
            },
        });

        // Dispatch Stand Approved confirmation email to the vendor
        if (updated.email) {
            try {
                await sendVendorApprovedEmail({
                    recipientEmail: updated.email,
                    contactName: updated.contactName,
                    businessName: updated.businessName,
                    eventTitle: updated.event?.title || "Silo Campus Trade Fair",
                    stallTitle: updated.stallTitle,
                    planName: updated.planName,
                    paidAmount: paidAmount,
                    bookingCode: updated.bookingCode,
                    eventVenue: updated.event?.venue || "Exhibition Grounds",
                });
            } catch (emailErr) {
                console.error("[API] Failed to dispatch vendor approval email:", emailErr);
                // Do not fail the transaction update if email service has a temporary issue
            }
        }

        return NextResponse.json({
            success: true,
            message: `Payment confirmed for ${updated.businessName} (${updated.bookingCode}). Approval email sent.`,
            application: {
                ...updated,
                paidAmount: Number(updated.paidAmount) || 0,
                dueNow: Number(updated.dueNow) || 0,
            },
        });
    } catch (err: any) {
        console.error("[API] Error confirming vendor application:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to confirm vendor application." },
            { status: 500 }
        );
    }
}
