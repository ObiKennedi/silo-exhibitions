import Link from "next/link";
import Image from "next/image";
import { MapPin, CalendarDays } from "lucide-react";

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

    return (
        <Link href={`/upcoming-exhibitions/${event.slug}`} className="upcoming-event-card">
            <div className="upcoming-event-card__media">
                <Image
                    src={event.flier}
                    alt={event.title}
                    fill
                    sizes="(max-width: 700px) 100vw, 33vw"
                />
                <span className={`upcoming-event-card__status ${STATUS_CLASS[event.status]}`}>
                    {event.status}
                </span>
            </div>
            <div className="upcoming-event-card__body">
                <h3>{event.title}</h3>
                <p>
                    <CalendarDays size={13} /> {dateLabel}
                    <span className="upcoming-event-card__dot">·</span>
                    <MapPin size={13} /> {event.venue}
                </p>
            </div>
        </Link>
    );
};