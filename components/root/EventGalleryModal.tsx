"use client"

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

import { PastEvent } from "@/types/event";

import "@/styles/root/EventGalleryModal.scss";

interface Props {
    event: PastEvent;
    onClose: () => void;
}

export const EventGalleryModal = ({ event, onClose }: Props) => {
    const [active, setActive] = useState(0);
    const media = event.media;
    const current = media[active];
    const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") setActive((i) => (i + 1) % media.length);
            if (e.key === "ArrowLeft") setActive((i) => (i - 1 + media.length) % media.length);
        };

        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [media.length, onClose]);

    useEffect(() => {
        const thumb = thumbRefs.current[active];
        if (thumb) {
            thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [active]);

    if (!current) return null;

    return (
        <div className="event-modal" role="dialog" aria-modal="true" aria-label={`${event.title} gallery`}>
            <div className="event-modal__backdrop" onClick={onClose} />

            <div className="event-modal__panel">
                <header className="event-modal__head">
                    <div>
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
                    <button type="button" className="event-modal__close" onClick={onClose} aria-label="Close gallery">
                        <X size={20} />
                    </button>
                </header>

                {/* Images row at the top */}
                {media.length > 1 && (
                    <div className="event-modal__thumbs" role="tablist" aria-label="Gallery thumbnails">
                        {media.map((m, i) => (
                            <button
                                type="button"
                                key={m.id}
                                ref={(el) => {
                                    thumbRefs.current[i] = el;
                                }}
                                className={`event-modal__thumb ${i === active ? "is-active" : ""}`}
                                onClick={() => setActive(i)}
                                aria-label={`Show item ${i + 1} of ${media.length}`}
                                aria-selected={i === active}
                            >
                                <Image
                                    src={m.type === "video" ? m.thumbnail ?? m.url : m.url}
                                    alt={m.alt ?? `Thumbnail ${i + 1}`}
                                    fill
                                    sizes="80px"
                                />
                                {m.type === "video" && (
                                    <span className="event-modal__thumb-play">
                                        <Play size={10} fill="currentColor" />
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Big image/media stage displayed below the images at the top */}
                <div className="event-modal__stage">
                    {media.length > 1 && (
                        <button
                            type="button"
                            className="event-modal__nav event-modal__nav--prev"
                            onClick={() => setActive((i) => (i - 1 + media.length) % media.length)}
                            aria-label="Previous"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}

                    {current.type === "video" ? (
                        <video
                            key={current.id}
                            src={current.url}
                            poster={current.thumbnail}
                            controls
                            autoPlay
                            className="event-modal__video"
                        />
                    ) : (
                        <div className="event-modal__image">
                            <Image
                                key={current.id}
                                src={current.url}
                                alt={current.alt ?? event.title}
                                fill
                                sizes="(max-width: 960px) 95vw, 960px"
                                priority
                            />
                        </div>
                    )}

                    {media.length > 1 && (
                        <button
                            type="button"
                            className="event-modal__nav event-modal__nav--next"
                            onClick={() => setActive((i) => (i + 1) % media.length)}
                            aria-label="Next"
                        >
                            <ChevronRight size={20} />
                        </button>
                    )}

                    {media.length > 1 && (
                        <span className="event-modal__counter">
                            {active + 1} / {media.length}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};