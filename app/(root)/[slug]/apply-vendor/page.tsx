import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";

import { getUpcomingEventBySlug } from "@/lib/upcoming-events";
import { StallApplicationForm } from "@/components/root/StallApplicationForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = await getUpcomingEventBySlug(slug);
    if (!event) return {};

    return {
        title: `Book a Vendor Stall | ${event.title}`,
        description: `Apply for an exhibition booth or stall at ${event.title}. Select your stall size, view flexible payment plans and reserve securely.`,
    };
}

export default async function ApplyVendorPage({ params }: Props) {
    const { slug } = await params;
    const event = await getUpcomingEventBySlug(slug);

    if (!event) notFound();

    return (
        <Suspense fallback={<div style={{ padding: "120px 20px", textAlign: "center" }}>Loading stall options...</div>}>
            <StallApplicationForm event={event} />
        </Suspense>
    );
}

