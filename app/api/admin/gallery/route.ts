import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const media = await prisma.eventMedia.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        });
        return NextResponse.json({ success: true, media });
    } catch (err) {
        console.error("[API] Failed to fetch gallery media:", err);
        return NextResponse.json({ error: "Failed to fetch gallery media" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action = "add" } = body;

        if (action === "add") {
            const { eventId, url, type = "IMAGE", caption, alt, order = 0 } = body;

            if (!eventId || !url) {
                return NextResponse.json(
                    { error: "Event and media URL are required." },
                    { status: 400 }
                );
            }

            const media = await prisma.eventMedia.create({
                data: {
                    eventId,
                    url,
                    type: type === "VIDEO" ? "VIDEO" : "IMAGE",
                    caption: caption || null,
                    alt: alt || caption || "Exhibition media",
                    order: Number(order) || 0,
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                        },
                    },
                },
            });

            return NextResponse.json({
                success: true,
                message: "Media added to gallery successfully!",
                media,
            });
        }

        if (action === "delete") {
            const { id } = body;
            if (!id) {
                return NextResponse.json({ error: "Media ID is required." }, { status: 400 });
            }

            await prisma.eventMedia.delete({ where: { id } });
            return NextResponse.json({ success: true, message: "Media deleted successfully." });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (err: any) {
        console.error("[API] Error in admin gallery route:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to process gallery request." },
            { status: 500 }
        );
    }
}
