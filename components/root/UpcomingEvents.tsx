import { getUpcomingEvents } from "@/lib/upcoming-events";
import { UpcomingEventCard } from "./UpcomingEventCard";
import { RedirectButton } from "../essentials/LinkButton";
import { EventCountdown } from "./EventCountdown";

import "@/styles/root/UpcomingEvents.scss";

export const UpcomingEvents = async () => {
    const events = await getUpcomingEvents(3);

    return (
        <section id="upcoming-exhibitions" className="upcoming-events" data-aos="fade-up">
            <div className="upcoming-events__head">
                <div>
                    <p className="upcoming-events__kicker">Upcoming Exhibitions.</p>
                    <h2 className="upcoming-events__title">
                        Don&apos;t miss <mark>what's next.</mark>
                    </h2>
                </div>
                <RedirectButton className="upcoming-events__see-more" href="/upcoming-exhibitions">
                    See all exhibitions
                </RedirectButton>
            </div>

            {events.length === 0 ? (
                <p className="upcoming-events__empty">
                    Upcoming exhibitions will appear here as soon as they are announced.
                </p>
            ) : (
                <>
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