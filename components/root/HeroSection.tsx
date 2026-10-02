"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Zap, TrendingUp, ArrowUpRight } from "lucide-react";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { HiSparkles, HiUsers } from "react-icons/hi2";
import AOS from "aos";
import "aos/dist/aos.css";

import { RedirectButton } from "../essentials/LinkButton";

import "@/styles/root/HeroSection.scss";

// Real exhibition photography generated for Silo
const HERO_IMAGES = [
    { src: "/hero/hero1.jpeg", alt: "Exhibitors setting up a stall at a Silo tradefair" },
    { src: "/hero/hero2.jpeg", alt: "A visitor browsing vendor stalls at a Silo exhibition" },
    { src: "/hero/hero3.jpeg", alt: "Crowd walking through a Silo tradefair" },
];

const ROTATE_MS = 6000;

export const Hero = () => {
    const [active, setActive] = useState(0);

    useEffect(() => {
        AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            setActive((prev) => (prev + 1) % HERO_IMAGES.length);
        }, ROTATE_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <section className="hero">
            <div className="hero__copy">
                <p className="hero__kicker" data-aos="fade-down">
                    .... Building businesses
                </p>

                <h1 className="hero__title" data-aos="fade-up" data-aos-delay="100">
                    We help exhibitors
                    <br />
                    <mark>build businesses</mark>
                    <br />
                    that last.
                </h1>

                <p className="hero__sub" data-aos="fade-up" data-aos-delay="200">
                    Welcome to Silo Exhibitions, 
                    Where businesses get seen, customers get connected, 
                    and brands get opportunity to grow.
                </p>

                <div className="hero__cta" data-aos="fade-up" data-aos-delay="300">
                    <RedirectButton className="hero__cta-primary" href="#upcoming-exhibitions">
                        Become a vendor
                    </RedirectButton>
                    <a className="hero__cta-play" href="#about">
                        <span className="hero__play-icon">
                            <Play size={12} fill="currentColor" />
                        </span>
                        See how it works
                    </a>
                </div>

                <ul className="hero__stats" data-aos="fade-up" data-aos-delay="400">
                    <li><b>240+</b> exhibitors</li>
                    <li><b>18+</b> tradefairs hosted</li>
                    <li><b>₦2.4B</b> Revenue generated</li>
                </ul>
            </div>

            <div className="hero__art" data-aos="fade-left" data-aos-delay="200">
                <div className="hero__frame">
                    {HERO_IMAGES.map((img, i) => (
                        <Image
                            key={img.src}
                            src={img.src}
                            alt={img.alt}
                            fill
                            priority={i === 0}
                            sizes="(max-width: 980px) 100vw, 540px"
                            className={`hero__slide ${i === active ? "is-active" : ""}`}
                        />
                    ))}

                    <div className="hero__dots">
                        {HERO_IMAGES.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`hero__dot ${i === active ? "is-active" : ""}`}
                                onClick={() => setActive(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Floating Stat replacing inline SVG with react-icons + lucide-react */}
                <div
                    className="hero__float hero__float--stat hero__float--breathe"
                    data-aos="zoom-in"
                    data-aos-delay="500"
                >
                    <div className="hero__stat-header">
                        <small>Exhibitor growth</small>
                        <span className="hero__stat-pill">
                            <FaArrowTrendUp size={11} className="hero__stat-pill-icon" />
                            +148%
                        </span>
                    </div>
                    <b>10K+</b>
                    <div className="hero__stat-footer">
                        <TrendingUp size={14} className="hero__trend-icon" />
                        <span>Buyers Reached</span>
                    </div>
                </div>

                {/* Floating Offer card */}
                <div
                    className="hero__float hero__float--offer hero__float--wobble"
                    data-aos="zoom-in"
                    data-aos-delay="650"
                >
                    <small>Exhibitor spots</small>
                    <b>Now open</b>
                    <span className="hero__offer-link">
                        Apply to exhibit
                        <ArrowUpRight size={13} className="hero__offer-arrow" />
                    </span>
                </div>

                {/* Circular Badge replacing inline SVG with lucide-react + react-icons */}
                <div className="hero__badge hero__float--breathe-slow" data-aos="zoom-in" data-aos-delay="800">
                    <div className="hero__badge-seal">
                        <div className="hero__badge-ring">
                            <span className="hero__badge-text">
                                REAL VENDORS • REAL GROWTH • REAL EXHIBITIONS •
                            </span>
                        </div>
                        <div className="hero__badge-core">
                            <Zap size={22} className="hero__badge-icon" />
                            <HiSparkles size={12} className="hero__badge-sparkle" />
                        </div>
                        <div className="hero__badge-check">
                            <BsPatchCheckFill size={15} />
                        </div>
                    </div>
                </div>

                {/* Floating People counter with react-icons */}
                <div
                    className="hero__float hero__float--people"
                    data-aos="zoom-in"
                    data-aos-delay="950"
                >
                    <div className="hero__avatars">
                        <i style={{ background: "var(--blue)" }}>AB</i>
                        <i style={{ background: "var(--sky)" }}>TE</i>
                        <i style={{ background: "var(--navy)" }}>CK</i>
                        <i style={{ background: "#5BB3FF" }}>
                            <HiUsers size={12} />
                        </i>
                    </div>
                    <div>
                        <b>500+ businesses</b>
                        <small>built with Silo</small>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const HeroSection = Hero;
export default Hero;