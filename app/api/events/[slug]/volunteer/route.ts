import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const body = await req.json();

    if (!body.fullName || !body.email || !body.phone) {
        return NextResponse.json(
            { error: "Full name, email, and phone number are required" },
            { status: 400 }
        );
    }

    console.log(`[Volunteer Application] Stored for "${slug}":`, {
        volunteerId: body.volunteerId,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        primaryRole: body.primaryRole,
        institution: body.institution,
        daysAvailable: body.daysAvailable,
        tshirtSize: body.tshirtSize,
    });

    return NextResponse.json({
        success: true,
        volunteerId: body.volunteerId,
        message: "Volunteer application recorded successfully",
    });
}
