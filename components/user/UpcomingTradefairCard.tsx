"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, ArrowRight, Store, Check, HeartHandshake } from "lucide-react";
import { UpcomingEvent } from "@/types/upcoming-event";

interface UpcomingTradefairCardProps {
  event: UpcomingEvent;
  isRegistered?: boolean;
  onViewRegisteredPass?: () => void;
}

export function UpcomingTradefairCard({
  event,
  isRegistered = false,
  onViewRegisteredPass,
}: UpcomingTradefairCardProps) {
  const imageSrc = event.flier || event.coverImageUrl || "/hero/hero1.jpeg";

  const dateLabel = event.startDate
    ? new Date(event.startDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Dates TBD";

  const statusClass =
    event.status === "Registration open"
      ? "ud-event-card__status-badge--open"
      : event.status === "Coming soon"
      ? "ud-event-card__status-badge--soon"
      : "ud-event-card__status-badge--full";

  const canApplyVendor = event.status === "Registration open" && event.vendorCall?.enabled;
  const canVolunteer = event.volunteerCall?.enabled;

  return (
    <article className="ud-event-card">
      {/* If current user is registered for this event */}
      {isRegistered && (
        <div className="ud-event-card__registered-ribbon" title="You have an active registration for this event">
          <Check size={13} /> Registered
        </div>
      )}

      {/* Visual Image */}
      <div className="ud-event-card__media">
        <Image
          src={imageSrc}
          alt={event.title}
          fill
          sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="ud-event-card__image"
        />
        <span className={`ud-event-card__status-badge ${statusClass}`}>
          {event.status}
        </span>
      </div>

      {/* Body */}
      <div className="ud-event-card__body">
        <span className="ud-event-card__date-pill">
          <CalendarDays size={14} /> {dateLabel}
        </span>

        <h3 className="ud-event-card__title">
          <Link href={`/${event.slug}`}>
            {event.title}
          </Link>
        </h3>

        <div className="ud-event-card__venue">
          <MapPin size={14} color="var(--blue, #0015F8)" />
          <span>{event.venue}</span>
        </div>

        {event.writeUp && (
          <p className="ud-event-card__desc">
            {event.writeUp}
          </p>
        )}

        {/* Foot Actions */}
        <div className="ud-event-card__foot">
          {isRegistered ? (
            <button
              type="button"
              className="ud-btn ud-btn--success ud-btn--sm"
              onClick={onViewRegisteredPass}
            >
              <Check size={14} />
              View Your Pass
            </button>
          ) : canApplyVendor ? (
            <Link
              href={`/${event.slug}/apply-vendor`}
              className="ud-btn ud-btn--primary ud-btn--sm"
            >
              <Store size={14} />
              Book a Stand
            </Link>
          ) : (
            <span style={{ fontSize: "12px", color: "var(--muted, #5B6485)", fontWeight: 500 }}>
              {event.status}
            </span>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {canVolunteer && !isRegistered && (
              <Link
                href={`/${event.slug}/volunteer`}
                className="ud-btn ud-btn--outline ud-btn--sm"
                title="Apply as volunteer crew member"
              >
                <HeartHandshake size={14} />
                Crew
              </Link>
            )}

            <Link
              href={`/${event.slug}`}
              className="ud-btn ud-btn--secondary ud-btn--sm"
            >
              <span>Explore</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
