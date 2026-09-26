"use client"
// Suggested path: /components/contact/ContactForm.tsx

import { useState, FormEvent } from "react";
import { FaSpinner, FaCircleCheck } from "react-icons/fa6";

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? "";

type Status = "idle" | "loading" | "done" | "error";

export const ContactForm = () => {
    const [status, setStatus] = useState<Status>("idle");

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");

        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.append("access_key", ACCESS_KEY);

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });

            const result = await res.json();

            if (result.success) {
                setStatus("done");
                form.reset();
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error("ContactForm submit:", err);
            setStatus("error");
        }
    };

    if (status === "done") {
        return (
            <p className="contact-form__success">
                <FaCircleCheck size={18} /> Thanks — your message is in. We&apos;ll get back to you soon.
            </p>
        );
    }

    return (
        <form className="contact-form" onSubmit={onSubmit}>
            {/* Honeypot field — Web3Forms silently drops submissions where this is filled. */}
            <input type="checkbox" name="botcheck" className="contact-form__honeypot" tabIndex={-1} autoComplete="off" />

            <input type="hidden" name="subject" value="New message from silo.events" />

            <div className="contact-form__row">
                <label className="contact-form__field">
                    <span>Name</span>
                    <input type="text" name="name" required placeholder="Your name" />
                </label>
                <label className="contact-form__field">
                    <span>Email</span>
                    <input type="email" name="email" required placeholder="you@email.com" />
                </label>
            </div>

            <label className="contact-form__field">
                <span>Message</span>
                <textarea name="message" required rows={5} placeholder="How can we help?" />
            </label>

            <button type="submit" className="contact-form__submit" disabled={status === "loading"}>
                {status === "loading" ? (
                    <>
                        <FaSpinner size={16} className="contact-form__spinner" /> Sending
                    </>
                ) : (
                    "Send message"
                )}
            </button>

            {status === "error" && (
                <p className="contact-form__error">Something went wrong — please try again.</p>
            )}
        </form>
    );
};