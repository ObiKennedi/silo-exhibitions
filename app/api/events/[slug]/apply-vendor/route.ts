import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const body = await req.json();

    if (!body.businessName || !body.email || !body.phone) {
        return NextResponse.json(
            { error: "Business name, email, and phone are required" },
            { status: 400 }
        );
    }

    console.log(`[Vendor Application] Stored for "${slug}":`, {
        bookingCode: body.bookingCode,
        businessName: body.businessName,
        stallTitle: body.stallTitle,
        planName: body.planName,
        paidAmount: body.paidAmount,
        paymentReference: body.paymentReference,
        isRevenueShare: body.isRevenueShare,
    });

    return NextResponse.json({
        success: true,
        bookingCode: body.bookingCode,
        message: "Vendor stall application recorded successfully",
    });
}
