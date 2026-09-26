"use client"

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { UpcomingEvent } from "@/types/upcoming-event";
import { UpcomingEventCard } from "./UpcomingEventCard";

import "@/styles/root/UpcomingEvents.scss";

const PAGE_SIZE = 12;

interface Props {
    initialEvents: UpcomingEvent[];
    initialHasMore: boolean;
}

export const UpcomingExhibitionsGrid = ({ initialEvents, initialHasMore }: Props) => {
    const [events, setEvents] = useState(initialEvents);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const res = await fetch(`/api/events/upcoming?page=${nextPage}&limit=${PAGE_SIZE}`);
            if (!res.ok) throw new Error(`Failed to load more events (${res.status})`);

            const data = await res.json();
            setEvents((prev) => [...prev, ...data.events]);
            setHasMore(data.hasMore);
            setPage(nextPage);
        } catch (err) {
            console.error("loadMore:", err);
        } finally {
            setLoading(false);
        }
    };

    if (events.length === 0) {
        return (
            <p className="upcoming-exhibitions__empty">
                New exhibitions will show up here as soon as they&apos;re announced.
            </p>
        );
    }

    return (
        <>
            <div className="upcoming-exhibitions__grid">
                {events.map((event) => (
                    <UpcomingEventCard key={event.id} event={event} />
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    className="upcoming-exhibitions__load-more"
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="upcoming-exhibitions__spinner" />
                            Loading
                        </>
                    ) : (
                        "Load more exhibitions"
                    )}
                </button>
            )}
        </>
    );
};