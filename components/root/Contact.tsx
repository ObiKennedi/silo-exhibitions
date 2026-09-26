import {
    FaWhatsapp,
    FaPhone,
    FaEnvelope,
    FaLocationDot,
} from "react-icons/fa6";

import { XIcon, FacebookIcon, InstagramIcon, TikTokIcon } from "./SocialIcons";
import { ContactForm } from "./ContactForm";

import "@/styles/contact/Contact.scss";

// Swap these for the real handles / numbers / address.
const SOCIALS = [
    { name: "X", url: "https://x.com/silo_exhibitions", icon: XIcon },
    { name: "Facebook", url: "https://facebook.com/siloexhibitions", icon: FacebookIcon },
    { name: "TikTok", url: "https://tiktok.com/@siloexhibitions", icon: TikTokIcon },
    { name: "Instagram", url: "https://instagram.com/siloexhibitions", icon: InstagramIcon },
];

const WHATSAPP_URL = "https://wa.me/2348000000000";
const PHONE = "+234 800 000 0000";
const EMAIL = "hello@silo.events";
const ADDRESS = "12 Tetlow Road, Owerri, Imo State, Nigeria";

export const Contact = () => {
    return (
        <section className="contact" id="contact" data-aos="fade-up">
            <div className="contact__head">
                <p className="contact__kicker">Contact Us.</p>
                <h2 className="contact__title">
                    Let&apos;s <mark>talk business.</mark>
                </h2>
                <p className="contact__sub">
                    Questions about a stall, a partnership, or just want to say hi — reach us any way that&apos;s easiest for you.
                </p>

                <ul className="contact__socials">
                    {SOCIALS.map(({ name, url, icon: Icon }) => (
                        <li key={name}>
                            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>
                                <Icon size={18} />
                            </a>
                        </li>
                    ))}
                </ul>

                <ul className="contact__details">
                    <li>
                        <span className="contact__icon">
                            <FaWhatsapp size={20} />
                        </span>
                        <div>
                            <b>WhatsApp</b>
                            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                                Chat with us
                            </a>
                        </div>
                    </li>

                    <li>
                        <span className="contact__icon">
                            <FaPhone size={17} />
                        </span>
                        <div>
                            <b>Phone</b>
                            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
                        </div>
                    </li>

                    <li>
                        <span className="contact__icon">
                            <FaEnvelope size={17} />
                        </span>
                        <div>
                            <b>Email</b>
                            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                        </div>
                    </li>

                    <li>
                        <span className="contact__icon">
                            <FaLocationDot size={18} />
                        </span>
                        <div>
                            <b>Address</b>
                            <span>{ADDRESS}</span>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="contact__form-wrap" data-aos="fade-left" data-aos-delay="150">
                <ContactForm />
            </div>
        </section>
    );
};