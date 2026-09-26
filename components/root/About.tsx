import Image from "next/image";
import { Sparkles, Tag, Users } from "lucide-react";

import { RedirectButton } from "../essentials/LinkButton";

import "@/styles/root/About.scss";

const STEPS = [
    {
        title: "Create your account",
        copy: "Sign up on the Silo portal as a buyer or a vendor — it takes a minute.",
    },
    {
        title: "Pick a tradefair",
        copy: "Browse upcoming exhibitions and choose the one happening near you.",
    },
    {
        title: "Get your pass or stall",
        copy: "Vendors book a stall online, buyers grab a free entry pass instantly.",
    },
    {
        title: "Show up and trade",
        copy: "Walk in, scan your pass at the gate, and start buying or selling.",
    },
];

export const About = () => {
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
                    <p className="about__kicker">Who we are</p>
                    <blockquote className="about__vision">
                        “We believe every trader deserves a stage, and every buyer deserves a
                        fair price. Silo exists to put both in the same room.”
                    </blockquote>
                    <p className="about__signature">— Shiloh, Founder &amp; CEO</p>
                    <p className="about__lead">
                        Silo Exhibitions links traders to buyers through campus tradefairs —
                        real events, real stalls, real people. We&apos;re building the easiest
                        way for a business to be discovered, and for a shopper to find a
                        better deal.
                    </p>
                </div>
            </div>

            {/* What we do */}
            <div className="about__what">
                <p className="about__kicker about__kicker--center" data-aos="fade-up">
                    What we do
                </p>
                <h3 className="about__title" data-aos="fade-up" data-aos-delay="100">
                    One tradefair, two wins.
                </h3>
                <p className="about__sub" data-aos="fade-up" data-aos-delay="150">
                    We bring sellers and shoppers into the same space, then handle
                    everything in between.
                </p>

                <div className="about__cards">
                    <article className="about__card" data-aos="fade-up" data-aos-delay="200">
                        <span className="about__card-icon">
                            <Tag size={20} />
                        </span>
                        <h4>For buyers</h4>
                        <p>
                            Skip the markup. Buy directly from vendors at tradefair prices you
                            won&apos;t find in stores.
                        </p>
                    </article>

                    <article
                        className="about__card about__card--alt"
                        data-aos="fade-up"
                        data-aos-delay="300"
                    >
                        <span className="about__card-icon">
                            <Users size={20} />
                        </span>
                        <h4>For sellers</h4>
                        <p>
                            Book a stall and put your business in front of thousands of
                            potential customers in a single weekend.
                        </p>
                    </article>
                </div>
            </div>

            {/* How it works */}
            <div className="about__how">
                <p className="about__kicker about__kicker--center" data-aos="fade-up">
                    How it works
                </p>
                <h3 className="about__title" data-aos="fade-up" data-aos-delay="100">
                    Register on the portal in minutes.
                </h3>

                <ol className="about__steps">
                    {STEPS.map((step, i) => (
                        <li key={step.title} data-aos="fade-up" data-aos-delay={200 + i * 100}>
                            <span className="about__step-num">{i + 1}</span>
                            <h4>{step.title}</h4>
                            <p>{step.copy}</p>
                        </li>
                    ))}
                </ol>

                <RedirectButton className="about__cta" href="/register">
                    Register on the portal
                </RedirectButton>
            </div>
        </section>
    );
};