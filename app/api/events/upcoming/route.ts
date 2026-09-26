import { NextResponse } from "next/server";
import { UpcomingEvent } from "@/types/upcoming-event";
import { UPCOMING_EVENTS } from "@/lib/upcoming-events";
// import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 6);
    const page = Number(searchParams.get("page") ?? 1);
    const start = (page - 1) * limit;

    const total = UPCOMING_EVENTS.length;
    const events = UPCOMING_EVENTS.slice(start, start + limit);
    const hasMore = start + events.length < total;

    return NextResponse.json({ events, hasMore, total });
}

export async function POST(req: Request) {
    const body = (await req.json()) as Omit<UpcomingEvent, "id">;

    const event: UpcomingEvent = { id: `evt_${Date.now()}`, ...body };
    UPCOMING_EVENTS.unshift(event);

    return NextResponse.json(event, { status: 201 });
}