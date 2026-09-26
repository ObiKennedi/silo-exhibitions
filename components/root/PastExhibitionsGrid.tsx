"use client"
// Suggested path: /components/past-exhibitions/PastExhibitionsGrid.tsx

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { PastEvent } from "@/types/event";
import { PastEventCard } from "./PastEventCard";

// Reuses the same .past-event-card styles as the homepage strip.
import "@/styles/root/PastEvents.scss";

const PAGE_SIZE = 12;

interface Props {
    initialEvents: PastEvent[];
    initialHasMore: boolean;
}

export const PastExhibitionsGrid = ({ initialEvents, initialHasMore }: Props) => {
    const [events, setEvents] = useState(initialEvents);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        setLoading(true);
        try {
            const nextPage = page + 1;
            const res = await fetch(`/api/events/past?page=${nextPage}&limit=${PAGE_SIZE}`);
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
            <p className="past-exhibitions__empty">
                Past exhibitions will show up here as soon as they&apos;re published.
            </p>
        );
    }

    return (
        <>
            <div className="past-exhibitions__grid">
                {events.map((event) => (
                    <PastEventCard key={event.id} event={event} />
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    className="past-exhibitions__load-more"
                    onClick={loadMore}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="past-exhibitions__spinner" />
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