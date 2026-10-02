"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { SOCIALS, WHATSAPP_URL, PHONE, EMAIL, ADDRESS, FOOTER_SPONSORS } from "./site-contact";

import "@/styles/root/Footer.scss";

const QUICK_LINKS = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Past Exhibitions", href: "/past-exhibitions" },
    { title: "Upcoming Exhibitions", href: "/upcoming-exhibitions" },
    { title: "Contact", href: "/contact" },
];

const GET_INVOLVED_LINKS = [
    { title: "Become a vendor", href: "/upcoming-exhibitions" },
    { title: "Volunteer with us", href: "/upcoming-exhibitions" },
    { title: "Join the waitlist", href: "/upcoming-exhibitions" },
    { title: "Sponsor an event", href: "/contact" },
];

export const Footer = () => {
    const year = new Date().getFullYear();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        quick: false,
        involved: false,
        contact: false,
    });

    const toggleSection = (section: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <footer className="footer">
            {/* ---------- Sponsors slide ---------- */}
            <div className="footer__sponsors">
                <p className="footer__sponsors-label">Our partners &amp; sponsors</p>
                <div className="footer__sponsors-track">
                    <ul className="footer__sponsors-strip">
                        {[...FOOTER_SPONSORS, ...FOOTER_SPONSORS].map((name, i) => (
                            <li key={`${name}-${i}`}>{name}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ---------- Main grid ---------- */}
            <div className="footer__main">
                <div className="footer__brand">
                    <Image src="/logo-light.png" alt="Silo Exhibitions" width={56} height={56} />
                    <p className="footer__blurb">
                        Silo Exhibitions links traders to buyers through curated campus tradefairs —
                        real stands, real footfall, real sales.
                    </p>
                    <ul className="footer__socials">
                        {SOCIALS.map(({ name, url, icon: Icon }) => (
                            <li key={name}>
                                <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
                                    <Icon size={16} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={`footer__col ${openSections.quick ? "footer__col--open" : ""}`}>
                    <h4>
                        <button
                            type="button"
                            className="footer__accordion-btn"
                            onClick={() => toggleSection("quick")}
                            aria-expanded={openSections.quick}
                            aria-controls="footer-quick-links"
                        >
                            <span>Quick links</span>
                            <ChevronDown className="footer__accordion-chevron" size={16} aria-hidden="true" />
                        </button>
                    </h4>
                    <div
                        id="footer-quick-links"
                        className={`footer__accordion-content ${openSections.quick ? "footer__accordion-content--open" : ""}`}
                    >
                        <div className="footer__accordion-inner">
                            <ul>
                                {QUICK_LINKS.map((l) => (
                                    <li key={l.href}>
                                        <Link href={l.href}>{l.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={`footer__col ${openSections.involved ? "footer__col--open" : ""}`}>
                    <h4>
                        <button
                            type="button"
                            className="footer__accordion-btn"
                            onClick={() => toggleSection("involved")}
                            aria-expanded={openSections.involved}
                            aria-controls="footer-involved-links"
                        >
                            <span>Get involved</span>
                            <ChevronDown className="footer__accordion-chevron" size={16} aria-hidden="true" />
                        </button>
                    </h4>
                    <div
                        id="footer-involved-links"
                        className={`footer__accordion-content ${openSections.involved ? "footer__accordion-content--open" : ""}`}
                    >
                        <div className="footer__accordion-inner">
                            <ul>
                                {GET_INVOLVED_LINKS.map((l) => (
                                    <li key={l.title}>
                                        <Link href={l.href}>{l.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={`footer__col footer__col--contact ${openSections.contact ? "footer__col--open" : ""}`}>
                    <h4>
                        <button
                            type="button"
                            className="footer__accordion-btn"
                            onClick={() => toggleSection("contact")}
                            aria-expanded={openSections.contact}
                            aria-controls="footer-contact-links"
                        >
                            <span>Contact</span>
                            <ChevronDown className="footer__accordion-chevron" size={16} aria-hidden="true" />
                        </button>
                    </h4>
                    <div
                        id="footer-contact-links"
                        className={`footer__accordion-content ${openSections.contact ? "footer__accordion-content--open" : ""}`}
                    >
                        <div className="footer__accordion-inner">
                            <ul className="footer__contact">
                                <li>
                                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                                        WhatsApp us
                                    </a>
                                </li>
                                <li>
                                    <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
                                </li>
                                <li>
                                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                                </li>
                                <li className="footer__address">{ADDRESS}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------- Bottom bar ---------- */}
            <div className="footer__bottom">
                <p>© {year} Silo Exhibitions. All rights reserved.</p>
                <div className="footer__legal">
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
};