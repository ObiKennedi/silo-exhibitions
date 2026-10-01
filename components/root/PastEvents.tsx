import { getPastEvents } from "@/lib/events";
import { PastEventCard } from "./PastEventCard";
import { RedirectButton } from "../essentials/LinkButton";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

import "@/styles/root/PastEvents.scss";

export const PastEvents = async () => {
    const events = await getPastEvents(6);
    const isEmpty = events.length === 0;

    return (
        <section
            id="past-exhibitions"
            className={`past-events ${isEmpty ? "past-events--empty" : ""}`}
            data-aos="fade-up"
        >
            {isEmpty ? (
                <div className="past-events__empty-bar">
                    <div className="past-events__empty-badge">
                        <ImageIcon size={14} />
                        <span>Past Exhibitions</span>
                    </div>
                    <p className="past-events__empty-text">
                        Photos &amp; vendor highlights from previous tradefairs coming soon.
                    </p>
                    <Link href="/past-exhibitions" className="past-events__empty-cta">
                        Full gallery <ArrowRight size={13} />
                    </Link>
                </div>
            ) : (
                <>
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

                    <div className="past-events__grid">
                        {events.map((event) => (
                            <PastEventCard key={event.id} event={event} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};