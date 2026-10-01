import { NextResponse } from "next/server";
import { getPastEventsPage } from "@/lib/events";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Number(searchParams.get("limit") ?? 12));
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const result = await getPastEventsPage(page, limit);
    return NextResponse.json(result);
}