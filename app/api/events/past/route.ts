import { NextResponse } from "next/server";
import { PLACEHOLDER_EVENTS } from "@/lib/events";
// import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limit = Number(searchParams.get("limit") ?? 12);

    if (pageParam !== null) {
        const page = Math.max(1, Number(pageParam) || 1);
        const start = (page - 1) * limit;
        const total = PLACEHOLDER_EVENTS.length;
        const events = PLACEHOLDER_EVENTS.slice(start, start + limit);
        const hasMore = start + limit < total;

        return NextResponse.json({
            events,
            hasMore,
            total,
        });
    }

    const events = PLACEHOLDER_EVENTS.slice(0, limit);
    return NextResponse.json(events);
}