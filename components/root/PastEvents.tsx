import { getPastEvents } from "@/lib/events";
import { PastEventCard } from "./PastEventCard";
import { RedirectButton } from "../essentials/LinkButton";

import "@/styles/root/PastEvents.scss";

export const PastEvents = async () => {
    const events = await getPastEvents(6);

    return (
        <section id="past-exhibitions" className="past-events" data-aos="fade-up">
            <div className="past-events__head">
                <div>
                    <p className="past-events__kicker">Past Events.</p>
                    <h2 className="past-events__title">
                        See what happened <mark>last time.</mark>
                    </h2>
                </div>
                <RedirectButton className="past-events__see-more" href="/past-exhibitions">
                    See full gallery
                </RedirectButton>
            </div>

            {events.length === 0 ? (
                <p className="past-events__empty">
                    Past events will show up here as soon as they&apos;re published.
                </p>
            ) : (
                <div className="past-events__grid">
                    {events.map((event) => (
                        <PastEventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </section>
    );
};