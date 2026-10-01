"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import "@/styles/root/BackToTop.scss";

export const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            // Show button after scrolling down 280px
            if (currentScrollY > 280) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            if (scrollHeight > 0) {
                const progress = Math.min(100, Math.max(0, (currentScrollY / scrollHeight) * 100));
                setScrollProgress(progress);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Calculate SVG circle progress
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

    return (
        <button
            type="button"
            className={`back-to-top ${isVisible ? "is-visible" : ""}`}
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
        >
            <svg className="back-to-top__ring" width="48" height="48" viewBox="0 0 48 48">
                <circle
                    className="back-to-top__ring-bg"
                    cx="24"
                    cy="24"
                    r={radius}
                />
                <circle
                    className="back-to-top__ring-progress"
                    cx="24"
                    cy="24"
                    r={radius}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                    }}
                />
            </svg>
            <span className="back-to-top__icon">
                <ArrowUp size={20} strokeWidth={2.5} />
            </span>
        </button>
    );
};
