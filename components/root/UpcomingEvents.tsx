import { getUpcomingEvents } from "@/lib/upcoming-events";
import { UpcomingEventCard } from "./UpcomingEventCard";
import { RedirectButton } from "../essentials/LinkButton";
import { EventCountdown } from "./EventCountdown";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

import "@/styles/root/UpcomingEvents.scss";

export const UpcomingEvents = async () => {
    const events = await getUpcomingEvents(3);
    const isEmpty = events.length === 0;

    return (
        <section
            id="upcoming-exhibitions"
            className={`upcoming-events ${isEmpty ? "upcoming-events--empty" : ""}`}
            data-aos="fade-up"
        >
            {isEmpty ? (
                <div className="upcoming-events__empty-bar">
                    <div className="upcoming-events__empty-badge">
                        <Calendar size={14} />
                        <span>Upcoming Exhibitions</span>
                    </div>
                    <p className="upcoming-events__empty-text">
                        Next tradefair dates dropping soon. Stay tuned!
                    </p>
                    <Link href="/upcoming-exhibitions" className="upcoming-events__empty-cta">
                        View schedule <ArrowRight size={13} />
                    </Link>
                </div>
            ) : (
                <>
                    <div className="upcoming-events__head">
                        <div>
                            <p className="upcoming-events__kicker">Upcoming Exhibitions.</p>
                        </div>
                        <RedirectButton className="upcoming-events__see-more" href="/upcoming-exhibitions">
                            See all exhibitions
                        </RedirectButton>
                    </div>

                    <div style={{ marginBottom: 28, maxWidth: 540 }}>
                        <EventCountdown
                            targetDate={events[0].startDate}
                            title={`Next Exhibition Countdown`}
                            subtitle={`${events[0].title} • ${events[0].venue}`}
                        />
                    </div>
                    <div className="upcoming-events__grid">
                        {events.map((event) => (
                            <UpcomingEventCard key={event.id} event={event} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};