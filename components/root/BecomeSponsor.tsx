import React from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import {
    Sparkles,
    Users,
    TrendingUp,
    ShieldCheck,
    ArrowUpRight,
    CheckCircle2,
    MessageCircle,
} from "lucide-react";
import { SPONSOR_WHATSAPP_URL, PHONE } from "./site-contact";

import "@/styles/root/BecomeSponsor.scss";

const SPONSOR_BENEFITS = [
    {
        icon: Users,
        title: "Massive Campus Footfall",
        stat: "10,000+ Turnout",
        desc: "Unrivaled physical access to tens of thousands of vibrant university students, Gen-Z tastemakers, and campus consumers.",
    },
    {
        icon: Sparkles,
        title: "Prime Experiential Booths",
        stat: "VIP Placement",
        desc: "Front-row exhibition placement, custom branded pavilions, on-stage keynote mentions, and dedicated activation hubs.",
    },
    {
        icon: TrendingUp,
        title: "Omnichannel Digital Amplification",
        stat: "50,000+ Reach",
        desc: "Co-branded announcements across Silo social channels, campus influencer networks, email broadcasts, and official event fliers.",
    },
    {
        icon: ShieldCheck,
        title: "Direct Conversion & Sampling",
        stat: "High ROI",
        desc: "Product testing, live sampling, instant app installs, customer lead acquisition, and retail conversion in real time.",
    },
];

const SPONSOR_HIGHLIGHTS = [
    "Custom Brand Activation Stalls",
    "Stage Mentions & Keynote Greetings",
    "VIP Access to Founder's Lounge",
    "Digital Banner Placement on Silo App",
    "Dedicated Event Host Shoutouts",
    "Post-Event Analytics & Brand Reach Report",
];

export const BecomeSponsor = () => {
    return (
        <section className="become-sponsor" id="sponsors" data-aos="fade-up">
            <div className="become-sponsor__glow become-sponsor__glow--blue" aria-hidden="true" />
            <div className="become-sponsor__glow become-sponsor__glow--green" aria-hidden="true" />

            <div className="become-sponsor__inner">
                {/* Header */}
                <div className="become-sponsor__header">
                    <span className="become-sponsor__kicker">
                        Brand Partnerships &amp; Sponsorships ~
                    </span>
                    <h2 className="become-sponsor__title">
                        BECOME A SPONSOR &amp; <mark>AMPLIFY YOUR BRAND</mark> ACROSS CAMPUS
                    </h2>
                    <p className="become-sponsor__sub">
                        Position your organization at the beating heart of university commerce. Partner with Silo Exhibitions
                        to connect directly with ambitious students, vibrant creators, and thriving campus enterprises.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="become-sponsor__grid">
                    {SPONSOR_BENEFITS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="sponsor-card" data-aos="fade-up" data-aos-delay={idx * 80}>
                                <div className="sponsor-card__top">
                                    <div className="sponsor-card__icon">
                                        <Icon size={22} />
                                    </div>
                                    <span className="sponsor-card__stat">{item.stat}</span>
                                </div>
                                <h3 className="sponsor-card__title">{item.title}</h3>
                                <p className="sponsor-card__desc">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* WhatsApp Action Callout Banner */}
                <div className="sponsor-cta-box" data-aos="zoom-in" data-aos-delay="200">
                    <div className="sponsor-cta-box__left">
                        <div className="sponsor-cta-box__badge">
                            <span className="sponsor-cta-box__pulse" />
                            <span>SPONSORSHIP DESK LIVE ON WHATSAPP</span>
                        </div>
                        <h3 className="sponsor-cta-box__heading">
                            Ready to Partner with Silo Exhibitions?
                        </h3>
                        <p className="sponsor-cta-box__text">
                            Our sponsorship coordinators are ready on WhatsApp to share our comprehensive partnership
                            deck, custom stall activation packages, and headline co-branding opportunities.
                        </p>

                        <div className="sponsor-cta-box__perks">
                            {SPONSOR_HIGHLIGHTS.map((perk, i) => (
                                <div key={i} className="sponsor-perk">
                                    <CheckCircle2 size={16} className="sponsor-perk__icon" />
                                    <span>{perk}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sponsor-cta-box__right">
                        <div className="sponsor-chat-card">
                            <div className="sponsor-chat-card__header">
                                <div className="sponsor-chat-card__avatar">
                                    <FaWhatsapp size={22} />
                                </div>
                                <div>
                                    <h4>Silo Partnerships Lead</h4>
                                    <small>Official WhatsApp Business ({PHONE})</small>
                                </div>
                            </div>

                            <p className="sponsor-chat-card__message">
                                “Hello! We’d love to discuss sponsorship tiers tailored to your brand’s goals and target campus audience.”
                            </p>

                            <Link
                                href={SPONSOR_WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sponsor-whatsapp-btn"
                                id="become-sponsor-whatsapp-btn"
                            >
                                <FaWhatsapp size={24} />
                                <div>
                                    <strong>Become a Sponsor on WhatsApp</strong>
                                    <small>Tap to open direct chat &bull; Quick response</small>
                                </div>
                                <ArrowUpRight size={18} className="sponsor-whatsapp-btn__arrow" />
                            </Link>

                            <div className="sponsor-chat-card__note">
                                <MessageCircle size={14} />
                                <span>Direct inquiries &bull; Bespoke tier deck available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
