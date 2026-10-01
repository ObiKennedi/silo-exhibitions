import { notFound } from "next/navigation";
import { Metadata } from "next";

import { getUpcomingEventBySlug } from "@/lib/upcoming-events";
import { VolunteerApplicationForm } from "@/components/root/VolunteerApplicationForm";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = await getUpcomingEventBySlug(slug);
    if (!event) return {};

    return {
        title: `Join the Crew | Volunteer at ${event.title}`,
        description: `Apply to volunteer at ${event.title}. Gain event management leadership experience, network with entrepreneurs, and get official crew perks.`,
    };
}

export default async function VolunteerPage({ params }: Props) {
    const { slug } = await params;
    const event = await getUpcomingEventBySlug(slug);

    if (!event) notFound();

    return <VolunteerApplicationForm event={event} />;
}
