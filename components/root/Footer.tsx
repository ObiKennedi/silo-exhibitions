import Link from "next/link";
import Image from "next/image";

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
                    <p className="footer__tagline">Building Businesses.</p>
                    <p className="footer__blurb">
                        Silo Exhibitions links traders to buyers through curated campus tradefairs —
                        real stalls, real footfall, real sales.
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

                <div className="footer__col">
                    <h4>Quick links</h4>
                    <ul>
                        {QUICK_LINKS.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href}>{l.title}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer__col">
                    <h4>Get involved</h4>
                    <ul>
                        {GET_INVOLVED_LINKS.map((l) => (
                            <li key={l.title}>
                                <Link href={l.href}>{l.title}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer__col">
                    <h4>Contact</h4>
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