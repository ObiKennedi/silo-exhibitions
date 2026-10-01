import { NextResponse } from "next/server";
import { getUpcomingEventsPage } from "@/lib/upcoming-events";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 6));
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const result = await getUpcomingEventsPage(page, limit);
    return NextResponse.json(result);
}