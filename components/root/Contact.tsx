import {
    FaWhatsapp,
    FaPhone,
    FaEnvelope,
    FaLocationDot,
} from "react-icons/fa6";

import { SOCIALS, WHATSAPP_URL, PHONE, EMAIL, ADDRESS } from "./site-contact";
import { ContactForm } from "./ContactForm";

import "@/styles/contact/Contact.scss";

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