import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const { email } = (await req.json()) as { email?: string };

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    console.log(`Waitlist join for "${slug}":`, email);

    return NextResponse.json({ success: true });
}