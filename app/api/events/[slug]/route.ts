import { NextResponse } from "next/server";
import { UPCOMING_EVENTS } from "@/lib/upcoming-events";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const event = UPCOMING_EVENTS.find((e) => e.slug === slug);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
}