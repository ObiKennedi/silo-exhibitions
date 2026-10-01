"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import "@/styles/root/EventCountdown.scss";

interface EventCountdownProps {
    targetDate: string | Date;
    title?: string;
    subtitle?: string;
    className?: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isToday: boolean;
}

export const EventCountdown = ({
    targetDate,
    title = "Exhibition Begins In",
    subtitle,
    className = "",
}: EventCountdownProps) => {
    const [mounted, setMounted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
        isToday: false,
    });

    useEffect(() => {
        setMounted(true);

        const calculateTimeLeft = (): TimeLeft => {
            const target = new Date(targetDate).getTime();
            const now = Date.now();
            const diff = target - now;

            if (isNaN(target)) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isToday: false };
            }

            if (diff <= 0) {
                const targetDateObj = new Date(targetDate);
                const nowDateObj = new Date();
                const isSameDay =
                    targetDateObj.getFullYear() === nowDateObj.getFullYear() &&
                    targetDateObj.getMonth() === nowDateObj.getMonth() &&
                    targetDateObj.getDate() === nowDateObj.getDate();

                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: !isSameDay,
                    isToday: isSameDay,
                };
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            return {
                days,
                hours,
                minutes,
                seconds,
                isExpired: false,
                isToday: false,
            };
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    if (!mounted) {
        return (
            <div className={`event-countdown-wrapper ${className}`}>
                <div className="event-countdown is-loading">
                    <div className="event-countdown__header">
                        <span className="event-countdown__badge">
                            <Clock size={13} /> {title}
                        </span>
                    </div>
                    <div className="event-countdown__grid">
                        <div className="event-countdown__unit">
                            <span className="event-countdown__val">--</span>
                            <span className="event-countdown__lbl">Days</span>
                        </div>
                        <span className="event-countdown__sep">:</span>
                        <div className="event-countdown__unit">
                            <span className="event-countdown__val">--</span>
                            <span className="event-countdown__lbl">Hours</span>
                        </div>
                        <span className="event-countdown__sep">:</span>
                        <div className="event-countdown__unit">
                            <span className="event-countdown__val">--</span>
                            <span className="event-countdown__lbl">Mins</span>
                        </div>
                        <span className="event-countdown__sep">:</span>
                        <div className="event-countdown__unit">
                            <span className="event-countdown__val">--</span>
                            <span className="event-countdown__lbl">Secs</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (timeLeft.isToday) {
        return (
            <div className={`event-countdown-wrapper ${className}`}>
                <div className="event-countdown is-live">
                    <div className="event-countdown__live-pulse">
                        <span className="pulse-dot"></span>
                        <strong>HAPPENING TODAY!</strong>
                    </div>
                    <p className="event-countdown__live-sub">
                        The exhibition doors are open. Head to the venue!
                    </p>
                </div>
            </div>
        );
    }

    if (timeLeft.isExpired) {
        return null;
    }

    const format2 = (n: number) => n.toString().padStart(2, "0");

    return (
        <div className={`event-countdown-wrapper ${className}`}>
            <div className="event-countdown">
                <div className="event-countdown__header">
                    <span className="event-countdown__badge">
                        <Clock size={13} className="event-countdown__icon" />
                        <span>{title}</span>
                    </span>
                    {subtitle && <span className="event-countdown__subtitle">{subtitle}</span>}
                </div>

                <div className="event-countdown__grid">
                    <div className="event-countdown__unit">
                        <span className="event-countdown__val">{format2(timeLeft.days)}</span>
                        <span className="event-countdown__lbl">Days</span>
                    </div>
                    <span className="event-countdown__sep">:</span>
                    <div className="event-countdown__unit">
                        <span className="event-countdown__val">{format2(timeLeft.hours)}</span>
                        <span className="event-countdown__lbl">Hours</span>
                    </div>
                    <span className="event-countdown__sep">:</span>
                    <div className="event-countdown__unit">
                        <span className="event-countdown__val">{format2(timeLeft.minutes)}</span>
                        <span className="event-countdown__lbl">Minutes</span>
                    </div>
                    <span className="event-countdown__sep">:</span>
                    <div className="event-countdown__unit">
                        <span className="event-countdown__val is-seconds">{format2(timeLeft.seconds)}</span>
                        <span className="event-countdown__lbl">Seconds</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
