import { NextResponse } from "next/server";
import { getUpcomingEventBySlug } from "@/lib/upcoming-events";
import { getPastEventBySlug } from "@/lib/events";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const event = (await getUpcomingEventBySlug(slug)) || (await getPastEventBySlug(slug));

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
}