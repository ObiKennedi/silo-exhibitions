"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Gift, Zap, Ticket, ArrowRight, CheckCircle2 } from "lucide-react";

import { RedirectButton } from "../essentials/LinkButton";

import "@/styles/root/About.scss";

const GIFT_VOUCHERS = [
    {
        tag: "VENDOR BONUS",
        value: "₦15,000",
        label: "Exhibition Credit",
        desc: "Direct discount voucher automatically applied toward your first campus stall booking.",
        badge: "INSTANT VOUCHER",
        icon: Gift,
        theme: "gold",
    },
    {
        tag: "BUYER PASS",
        value: "FREE VIP",
        label: "Fast-Track Pass",
        desc: "Complimentary digital entry pass with instant gate scanning for upcoming campus tradefairs.",
        badge: "100% FREE",
        icon: Ticket,
        theme: "blue",
    },
    {
        tag: "EXHIBITOR PERK",
        value: "PRIORITY",
        label: "Prime Stall Access",
        desc: "Early-bird privileges to lock in high-footfall corner booth spaces before general opening.",
        badge: "EXCLUSIVE",
        icon: Zap,
        theme: "cyan",
    },
];

export const About = () => {
    const [isBoxOpen, setIsBoxOpen] = useState(false);

    return (
        <section className="about" id="about">
            {/* Who we are */}
            <div className="about__who">
                <div className="about__who-media" data-aos="zoom-in">
                    <span className="about__blob" aria-hidden="true" />
                    <div className="about__photo-frame">
                        <Image
                            src="/team/pic.png"
                            alt="Shiloh, Founder and CEO of Silo Exhibitions"
                            fill
                            sizes="(max-width: 980px) 260px, 320px"
                        />
                    </div>
                    <span className="about__photo-badge">
                        <Sparkles size={14} />
                        Founder &amp; CEO
                    </span>
                </div>

                <div className="about__who-copy" data-aos="fade-up" data-aos-delay="100">
                    <blockquote className="about__vision">
                        “We believe every trader deserves a stage, and every buyer deserves a
                        fair price. Silo exists to put both in the same room.”
                    </blockquote>
                    <p className="about__signature">— Shiloh, Founder &amp; CEO</p>
                    <p className="about__kicker">Who we are</p>
                    <p className="about__lead">
                        Silo Exhibitions links traders to buyers through campus tradefairs —
                        real events, real stalls, real people. We&apos;re building the easiest
                        way for a business to be discovered, and for a shopper to find a
                        better deal.
                    </p>
                </div>
            </div>

            {/* Temu-Style Bouncy Gift & Reward Section */}
            <div className="about__gift" data-aos="fade-up">
                <div className={`about__gift-card ${isBoxOpen ? "is-unboxed" : ""}`}>
                    {/* Floating festive celebration confetti */}
                    <div className="about__gift-confetti-bg" aria-hidden="true">
                        <span className="confetti c1" />
                        <span className="confetti c2" />
                        <span className="confetti c3" />
                        <span className="confetti c4" />
                        <span className="confetti c5" />
                        <span className="confetti c6" />
                    </div>

                    {/* Central Interactive Bouncy Temu Gift Box */}
                    <div
                        className={`about__temu-stage ${isBoxOpen ? "is-opened" : ""}`}
                        onClick={() => setIsBoxOpen((prev) => !prev)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setIsBoxOpen((prev) => !prev);
                            }
                        }}
                        aria-label="Interactive mystery gift box. Click to unbox your welcome reward."
                    >
                        {/* Golden Rotating Aura */}
                        <div className="about__temu-aura" />

                        {/* Floating reward sparkle particles */}
                        <span className="about__temu-particle p1">🎁</span>
                        <span className="about__temu-particle p2">✨</span>
                        <span className="about__temu-particle p3">⭐</span>
                        <span className="about__temu-particle p4">🎉</span>
                        <span className="about__temu-particle p5">💎</span>

                        {/* Interactive Click Hint */}
                        <div className="about__temu-hint">
                            <span className="about__temu-hint-pulse" />
                            {isBoxOpen ? "🎉 UNBOXED! CLICK TO RE-WRAP" : "👉 CLICK TO UNBOX GIFT! 👈"}
                        </div>

                        {/* 3D-Styled Bouncy Gift Box */}
                        <div className="about__temu-box">
                            <div className="about__temu-lid">
                                <div className="about__temu-bow">
                                    <div className="bow-loop left" />
                                    <div className="bow-knot" />
                                    <div className="bow-loop right" />
                                    <div className="bow-ribbon left" />
                                    <div className="bow-ribbon right" />
                                </div>
                                <div className="about__temu-lid-top" />
                            </div>
                            <div className="about__temu-body">
                                <div className="about__temu-ribbon-v" />
                                <div className="about__temu-ribbon-h" />
                                <div className="about__temu-sparkle-shine" />
                                <span className="about__temu-tag">100% FREE</span>
                            </div>
                        </div>
                    </div>

                    {/* Tag Badge */}
                    <div className="about__gift-badge">
                        <span className="about__gift-tag">
                            <Sparkles size={14} className="about__gift-sparkle-spin" />
                            SPECIAL WELCOME BONUS • 100% FREE REWARD
                        </span>
                    </div>

                    {/* Section Title */}
                    <h3 className="about__title about__gift-title">
                        Sign up and <mark>receive a gift!</mark>
                    </h3>

                    <p className="about__sub about__gift-sub">
                        Create your free Silo account today and instantly unbox your welcome reward pack — including vendor credits, VIP fast-track exhibition passes, and priority booth privileges.
                    </p>

                    {/* Temu-Style Voucher Cards */}
                    <div className="about__gift-vouchers">
                        {GIFT_VOUCHERS.map((voucher, i) => {
                            const IconComponent = voucher.icon;
                            return (
                                <div
                                    key={voucher.label}
                                    className={`about__gift-voucher theme-${voucher.theme}`}
                                    data-aos="zoom-in"
                                    data-aos-delay={150 + i * 100}
                                >
                                    <div className="about__gift-voucher-notch top" />
                                    <div className="about__gift-voucher-notch bottom" />

                                    <div className="about__gift-voucher-head">
                                        <span className="about__gift-voucher-tag">{voucher.tag}</span>
                                        <span className="about__gift-voucher-pill">{voucher.badge}</span>
                                    </div>

                                    <div className="about__gift-voucher-value">
                                        <b>{voucher.value}</b>
                                        <span>{voucher.label}</span>
                                    </div>

                                    <p className="about__gift-voucher-desc">{voucher.desc}</p>

                                    <div className="about__gift-voucher-footer">
                                        <span className="about__gift-voucher-icon">
                                            <IconComponent size={16} />
                                        </span>
                                        <span className="about__gift-voucher-status">
                                            <CheckCircle2 size={13} />
                                            Unlocked with Sign Up
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bouncy Temu-Style Call to Action */}
                    <div className="about__gift-action">
                        <RedirectButton className="about__gift-cta about__gift-cta--temu" href="/register">
                            <span className="about__gift-cta-gift-icon">🎁</span>
                            <span className="about__gift-cta-text">Sign Up &amp; Claim Your Free Gift</span>
                            <ArrowRight size={18} className="about__gift-cta-arrow" />
                        </RedirectButton>

                        <div className="about__gift-social-proof">
                            <span className="proof-dot" />
                            <p><b>500+ traders &amp; buyers</b> claimed their welcome gift this month • 100% Free</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};