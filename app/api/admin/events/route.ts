import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendNewEventBroadcastToAllUsers } from "@/lib/email";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: "desc" },
            include: {
                _count: {
                    select: {
                        vendorApplications: true,
                        volunteerApplications: true,
                        media: true,
                    },
                },
            },
        });
        return NextResponse.json({ success: true, events });
    } catch (err) {
        console.error("[API] Failed to fetch events:", err);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action = "create" } = body;

        // --- CREATE EVENT ---
        if (action === "create") {
            const {
                title,
                tagline,
                slug,
                venue,
                location,
                startDate,
                endDate,
                status = "PUBLISHED",
                registrationStatus = "REGISTRATION_OPEN",
                writeUp,
                coverImageUrl,
                flierUrl,
                cashlessPolicy,
                importantTerms,
                exhibitionPlanDocUrl,
                exhibitionPlanSummary,
                vendorCallDescription,
                whatsappUrl,
                stallsConfig,
                notifyUsers = true,
            } = body;

            if (!title || !slug || !venue) {
                return NextResponse.json(
                    { error: "Title, slug, and venue are required." },
                    { status: 400 }
                );
            }

            const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

            // Check if slug exists
            const existing = await prisma.event.findUnique({ where: { slug: cleanSlug } });
            if (existing) {
                return NextResponse.json(
                    { error: `An exhibition with slug "${cleanSlug}" already exists.` },
                    { status: 400 }
                );
            }

            const created = await prisma.event.create({
                data: {
                    title,
                    tagline: tagline || null,
                    slug: cleanSlug,
                    venue,
                    location: location || venue,
                    startDate: startDate ? new Date(startDate) : new Date(Date.now() + 7 * 86400000),
                    endDate: endDate ? new Date(endDate) : undefined,
                    status: status as any,
                    registrationStatus: (registrationStatus || "REGISTRATION_OPEN") as any,
                    writeUp: writeUp || null,
                    coverImageUrl: coverImageUrl || null,
                    flierUrl: flierUrl || null,
                    cashlessPolicy: cashlessPolicy || null,
                    importantTerms: importantTerms || null,
                    exhibitionPlanDocUrl: exhibitionPlanDocUrl || null,
                    exhibitionPlanSummary: exhibitionPlanSummary || null,
                    vendorCallDescription: vendorCallDescription || null,
                    whatsappUrl: whatsappUrl || null,
                    stallsConfig: stallsConfig !== undefined
                        ? (typeof stallsConfig === "string" ? stallsConfig : JSON.stringify(stallsConfig))
                        : null,
                },
            });

            // Automatically send Resend email to all users if requested
            let broadcastResult = null;
            if (notifyUsers) {
                broadcastResult = await sendNewEventBroadcastToAllUsers({
                    title: created.title,
                    slug: created.slug,
                    venue: created.venue,
                    location: created.location,
                    startDate: created.startDate,
                    endDate: created.endDate,
                    writeUp: created.writeUp,
                });
            }

            try {
                revalidatePath("/");
                revalidatePath("/upcoming-exhibitions");
                revalidatePath(`/${cleanSlug}`);
                revalidatePath(`/${cleanSlug}/apply-vendor`);
            } catch (revErr) {
                console.warn("[API] revalidatePath error:", revErr);
            }

            return NextResponse.json({
                success: true,
                message: "Exhibition created successfully!",
                event: created,
                broadcastResult,
            });
        }

        // --- UPDATE EVENT ---
        if (action === "update") {
            const {
                id,
                title,
                tagline,
                slug,
                venue,
                location,
                startDate,
                endDate,
                status,
                registrationStatus,
                writeUp,
                coverImageUrl,
                flierUrl,
                cashlessPolicy,
                importantTerms,
                exhibitionPlanDocUrl,
                exhibitionPlanSummary,
                vendorCallDescription,
                whatsappUrl,
                stallsConfig,
            } = body;
            if (!id) {
                return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
            }

            const updated = await prisma.event.update({
                where: { id },
                data: {
                    title: title || undefined,
                    tagline: tagline !== undefined ? (tagline || null) : undefined,
                    slug: slug ? slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-") : undefined,
                    venue: venue || undefined,
                    location: location || undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    status: status || undefined,
                    registrationStatus: registrationStatus || undefined,
                    writeUp: writeUp !== undefined ? writeUp : undefined,
                    coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : undefined,
                    flierUrl: flierUrl !== undefined ? flierUrl : undefined,
                    cashlessPolicy: cashlessPolicy !== undefined ? cashlessPolicy : undefined,
                    importantTerms: importantTerms !== undefined ? importantTerms : undefined,
                    exhibitionPlanDocUrl: exhibitionPlanDocUrl !== undefined ? (exhibitionPlanDocUrl || null) : undefined,
                    exhibitionPlanSummary: exhibitionPlanSummary !== undefined ? exhibitionPlanSummary : undefined,
                    vendorCallDescription: vendorCallDescription !== undefined ? vendorCallDescription : undefined,
                    whatsappUrl: whatsappUrl !== undefined ? whatsappUrl : undefined,
                    stallsConfig: stallsConfig !== undefined
                        ? (typeof stallsConfig === "string" ? stallsConfig : JSON.stringify(stallsConfig))
                        : undefined,
                },
            });

            try {
                revalidatePath("/");
                revalidatePath("/upcoming-exhibitions");
                if (updated.slug) {
                    revalidatePath(`/${updated.slug}`);
                    revalidatePath(`/${updated.slug}/apply-vendor`);
                }
            } catch (revErr) {
                console.warn("[API] revalidatePath error:", revErr);
            }

            return NextResponse.json({
                success: true,
                message: "Exhibition updated successfully.",
                event: updated,
            });
        }

        // --- DELETE EVENT ---
        if (action === "delete") {
            const { id } = body;
            if (!id) {
                return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
            }

            const existing = await prisma.event.findUnique({ where: { id } });
            await prisma.event.delete({ where: { id } });

            try {
                revalidatePath("/");
                revalidatePath("/upcoming-exhibitions");
                if (existing?.slug) {
                    revalidatePath(`/${existing.slug}`);
                    revalidatePath(`/${existing.slug}/apply-vendor`);
                }
            } catch (revErr) {
                console.warn("[API] revalidatePath error:", revErr);
            }

            return NextResponse.json({ success: true, message: "Exhibition deleted successfully." });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (err: any) {
        console.error("[API] Error in admin events route:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to process event request." },
            { status: 500 }
        );
    }
}
