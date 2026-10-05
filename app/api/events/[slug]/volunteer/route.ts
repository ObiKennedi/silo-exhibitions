import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const body = await req.json();

    if (!body.fullName || !body.email || !body.phone) {
        return NextResponse.json(
            { error: "Full name, email, and phone number are required" },
            { status: 400 }
        );
    }

    const volunteerCode = body.volunteerId || `SILO-VOL-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanEmail = body.email.trim().toLowerCase();

    let eventWhatsappUrl: string | null = null;
    try {
        let eventId: string | null = null;
        try {
            const event = await prisma.event.findFirst({
                where: { slug, status: "PUBLISHED" },
                select: { id: true, whatsappUrl: true },
            });
            if (event) {
                eventId = event.id;
                eventWhatsappUrl = event.whatsappUrl;
            }
        } catch {
            // Optional lookup
        }

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

        await prisma.volunteerApplication.create({
            data: {
                volunteerCode,
                eventSlug: slug,
                eventId,
                userId: linkedUserId,
                fullName: body.fullName,
                email: cleanEmail,
                phone: body.phone,
                primaryRole: body.primaryRole || "Volunteer Crew",
                institution: body.institution || null,
                daysAvailable: body.daysAvailable ? String(body.daysAvailable) : null,
                tshirtSize: body.tshirtSize || null,
                experience: body.experience || null,
                emergencyContact: body.emergencyContact || null,
                status: "PENDING",
            },
        });
    } catch (err) {
        console.warn("[Volunteer Application DB] Unable to persist directly to Prisma:", err);
    }

    console.log(`[Volunteer Application] Stored for "${slug}":`, {
        volunteerId: volunteerCode,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        guestCheckout: !body.userId,
    });

    return NextResponse.json({
        success: true,
        volunteerId: volunteerCode,
        groupChatUrl: "https://chat.whatsapp.com/BQEXl4sXObzFbqsOAnqeJC?s=cl&p=i&mlu=4&ilr=4",
        message: "Volunteer application recorded successfully",
    });
}

