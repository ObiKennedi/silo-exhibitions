import Link from "next/link";
import Image from "next/image";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";

import { UpcomingEvent } from "@/types/upcoming-event";

const STATUS_CLASS: Record<UpcomingEvent["status"], string> = {
    "Registration open": "is-open",
    "Coming soon": "is-soon",
    "Sold out": "is-full",
};

export const UpcomingEventCard = ({ event }: { event: UpcomingEvent }) => {
    const dateLabel = new Date(event.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });

    const imageSrc =
        event.flier && event.flier.trim().length > 0
            ? event.flier
            : event.coverImageUrl && event.coverImageUrl.trim().length > 0
            ? event.coverImageUrl
            : "/events/silo-campus-tradefair-2026/flier.jpg";

    const vendorApplyUrl = event.vendorCall?.applyUrl || `/${event.slug}/apply-vendor`;

    return (
        <div className="upcoming-event-card">
            <Link href={`/${event.slug}`} className="upcoming-event-card__media-link">
                <div className="upcoming-event-card__media">
                    <Image
                        src={imageSrc}
                        alt={event.title}
                        fill
                        sizes="(max-width: 700px) 100vw, 33vw"
                    />
                    <span className={`upcoming-event-card__status ${STATUS_CLASS[event.status]}`}>
                        {event.status}
                    </span>
                </div>
            </Link>
            <div className="upcoming-event-card__body">
                <Link href={`/${event.slug}`} className="upcoming-event-card__title-link">
                    <h3>{event.title}</h3>
                </Link>
                <p>
                    <CalendarDays size={13} /> {dateLabel}
                    <span className="upcoming-event-card__dot">·</span>
                    <MapPin size={13} /> {event.venue}
                </p>

                <div className="upcoming-event-card__footer">
                    <Link
                        href={vendorApplyUrl}
                        className="upcoming-event-card__vendor-btn"
                    >
                        <span>Become a vendor</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};