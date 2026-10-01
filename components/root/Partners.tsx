import "@/styles/root/Partners.scss";

// Swap in the real partner names.
const PARTNERS = [
    "Alternative Bank",
    "KIVO",
    "Evans Nigerian LTD",
    "The Creative Syndicate",
    "Vitel Wireless LTD",
];

export const Partners = () => {
    return (
        <section className="partners" data-aos="fade-up">
            <p className="partners__label">Trusted by:</p>

            <div className="partners__track">
                <ul className="partners__strip">
                    {[...PARTNERS, ...PARTNERS].map((name, i) => (
                        <li key={`${name}-${i}`}>{name}</li>
                    ))}
                </ul>
            </div>

            <div className="partners__cta-wrap">
                <a href="#sponsors" className="partners__cta-link">
                    Want to spotlight your brand? <span>Become an Official Sponsor &rarr;</span>
                </a>
            </div>
        </section>
    );
};