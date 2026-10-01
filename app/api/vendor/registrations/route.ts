import { NextResponse } from "next/server";
import { getUserVendorRegistrations, normalizeEmail } from "@/lib/vendor-registrations";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!email && !userId) {
        return NextResponse.json(
            { error: "Email or userId is required to fetch registrations" },
            { status: 400 }
        );
    }

    try {
        const registrations = await getUserVendorRegistrations(
            userId || null,
            email ? normalizeEmail(email) : null
        );

        return NextResponse.json({
            success: true,
            total: registrations.length,
            registrations,
        });
    } catch (err) {
        console.error("[API] Failed to fetch vendor registrations:", err);
        return NextResponse.json(
            { error: "Failed to retrieve vendor registrations" },
            { status: 500 }
        );
    }
}
