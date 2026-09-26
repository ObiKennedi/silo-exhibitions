import { Metadata } from "next";

import { getPastEventsPage } from "@/lib/events";
import { PastExhibitionsGrid } from "@/components/root/PastExhibitionsGrid";

import "@/styles/root/PastExhibitions.scss";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
    title: "Past Exhibitions | Silo Exhibitions",
    description:
        "Browse photos and videos from every Silo Campus Tradefair and exhibition we've hosted.",
};

export default async function PastExhibitionsPage() {
    const { events, hasMore } = await getPastEventsPage(1, PAGE_SIZE);

    return (
        <main className="past-exhibitions">
            <header className="past-exhibitions__head">
                <p className="past-exhibitions__kicker">Past Exhibitions.</p>
                <h1 className="past-exhibitions__title">
                    Every exhibition <mark>we&apos;ve hosted.</mark>
                </h1>
                <p className="past-exhibitions__sub">
                    Photos and highlight videos from every tradefair — tap any event to open its
                    full gallery.
                </p>
            </header>

            <PastExhibitionsGrid initialEvents={events} initialHasMore={hasMore} />
        </main>
    );
}