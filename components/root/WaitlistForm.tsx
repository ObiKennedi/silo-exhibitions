"use client"
// Suggested path: /components/upcoming-exhibitions/WaitlistForm.tsx

import { useState, FormEvent } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

import { joinWaitlist } from "@/lib/upcoming-events";

export const WaitlistForm = ({ slug }: { slug: string }) => {
    const [email, setEmail] = useState("");
    const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setState("loading");

        const ok = await joinWaitlist(slug, email);
        setState(ok ? "done" : "error");
    };

    if (state === "done") {
        return (
            <p className="waitlist-form__success">
                <CheckCircle2 size={16} /> You&apos;re on the list — we&apos;ll email you updates.
            </p>
        );
    }

    return (
        <form className="waitlist-form" onSubmit={onSubmit}>
            <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="waitlist-form__input"
                aria-label="Email address"
            />
            <button type="submit" className="waitlist-form__submit" disabled={state === "loading"}>
                {state === "loading" ? <Loader2 size={16} className="waitlist-form__spinner" /> : "Join waitlist"}
            </button>
            {state === "error" && (
                <p className="waitlist-form__error">Something went wrong — try again.</p>
            )}
        </form>
    );
};