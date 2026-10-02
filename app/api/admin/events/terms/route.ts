import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                slug: true,
                title: true,
                venue: true,
                cashlessPolicy: true,
                importantTerms: true,
                status: true,
            },
            orderBy: {
                startDate: "desc",
            },
        });

        return NextResponse.json({ success: true, events });
    } catch (err) {
        console.error("[API] Failed to fetch events for terms management:", err);
        return NextResponse.json(
            { error: "Failed to retrieve events" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Support creating a new event
        if (body.action === "create") {
            const { title, slug, venue, location, startDate, endDate, cashlessPolicy, importantTerms, status } = body;
            if (!title || !slug || !venue) {
                return NextResponse.json(
                    { error: "Title, location slug, and venue are required to create an exhibition" },
                    { status: 400 }
                );
            }

            const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");

            const created = await prisma.event.create({
                data: {
                    title,
                    slug: cleanSlug,
                    venue,
                    location: location || venue,
                    startDate: startDate ? new Date(startDate) : new Date(Date.now() + 7 * 86400000),
                    endDate: endDate ? new Date(endDate) : undefined,
                    status: status || "PUBLISHED",
                    registrationStatus: "REGISTRATION_OPEN",
                    cashlessPolicy: cashlessPolicy || null,
                    importantTerms: importantTerms || null,
                },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    venue: true,
                    cashlessPolicy: true,
                    importantTerms: true,
                    status: true,
                },
            });

            return NextResponse.json({
                success: true,
                message: "Exhibition created successfully with custom terms & policy",
                event: created,
            });
        }

        const { eventId, cashlessPolicy, importantTerms, exhibitionPlanDocUrl } = body;

        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            );
        }

        const updated = await prisma.event.update({
            where: { id: eventId },
            data: {
                cashlessPolicy: cashlessPolicy !== undefined ? cashlessPolicy : undefined,
                importantTerms: importantTerms !== undefined ? importantTerms : undefined,
                exhibitionPlanDocUrl: exhibitionPlanDocUrl !== undefined ? (exhibitionPlanDocUrl || null) : undefined,
            },
            select: {
                id: true,
                slug: true,
                title: true,
                venue: true,
                cashlessPolicy: true,
                importantTerms: true,
                exhibitionPlanDocUrl: true,
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
            console.warn("[API] revalidatePath error in terms:", revErr);
        }

        return NextResponse.json({
            success: true,
            message: "Important terms and policies updated successfully",
            event: updated,
        });
    } catch (err) {
        console.error("[API] Failed to update event terms:", err);
        return NextResponse.json(
            { error: "Failed to update event terms" },
            { status: 500 }
        );
    }
}
