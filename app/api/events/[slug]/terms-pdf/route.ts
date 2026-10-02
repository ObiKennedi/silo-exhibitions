import { NextResponse } from "next/server";
import { getUpcomingEventBySlug } from "@/lib/upcoming-events";
import { generateTermsPdf } from "@/lib/terms-pdf";

export async function GET(
    req: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        if (!slug) {
            return NextResponse.json({ error: "Event slug is required." }, { status: 400 });
        }

        const event = await getUpcomingEventBySlug(slug, { includeDrafts: true });
        if (!event) {
            return NextResponse.json({ error: "Exhibition not found." }, { status: 404 });
        }

        const terms = event.importantTerms
            ? event.importantTerms.split("\n").map((t) => t.trim()).filter(Boolean)
            : [];

        const stalls = (event.stallsConfig || []).map((s) => ({
            title: s.title,
            size: s.size,
            price: s.price,
            description: s.description,
        }));

        const pdfBuffer = generateTermsPdf({
            eventTitle: event.title,
            venue: event.venue,
            startDate: event.startDate,
            endDate: event.endDate,
            terms,
            cashlessPolicy: event.cashlessPolicy,
            stalls,
            slug: event.slug,
        });

        const filename = `silo-${event.slug}-terms-and-stand-plans.pdf`;

        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "public, max-age=60, s-maxage=300",
            },
        });
    } catch (err: any) {
        console.error("[API terms-pdf Error]:", err);
        return NextResponse.json(
            { error: err?.message || "Failed to generate terms PDF." },
            { status: 500 }
        );
    }
}
