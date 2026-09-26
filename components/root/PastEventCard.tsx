"use client"

import { useState } from "react";
import Image from "next/image";
import { Play, Images } from "lucide-react";

import { PastEvent } from "@/types/event";
import { EventGalleryModal } from "./EventGalleryModal";

export const PastEventCard = ({ event }: { event: PastEvent }) => {
    const [open, setOpen] = useState(false);
    const hasVideo = event.media.some((m) => m.type === "video");

    return (
        <>
            <button
                type="button"
                className="past-event-card"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
            >
                <div className="past-event-card__media">
                    <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        sizes="(max-width: 700px) 100vw, 33vw"
                    />
                    {hasVideo && (
                        <span className="past-event-card__play">
                            <Play size={16} fill="currentColor" />
                        </span>
                    )}
                    {event.media.length > 0 && (
                        <span className="past-event-card__count">
                            <Images size={13} />
                            {event.media.length}
                        </span>
                    )}
                </div>
                <div className="past-event-card__body">
                    <h3>{event.title}</h3>
                    <p>
                        {new Date(event.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}{" "}
                        · {event.location}
                    </p>
                </div>
            </button>

            {open && <EventGalleryModal event={event} onClose={() => setOpen(false)} />}
        </>
    );
};