import "@/styles/root/Partners.scss";

// Swap in the real partner names.
const PARTNERS = [
    "Partner One",
    "Partner Two",
    "Partner Three",
    "Partner Four",
    "Partner Five",
    "Partner Six",
];

export const Partners = () => {
    return (
        <section className="partners" data-aos="fade-up">
            <p className="partners__label">Trusted by businesses working with</p>

            <div className="partners__track">
                <ul className="partners__strip">
                    {[...PARTNERS, ...PARTNERS].map((name, i) => (
                        <li key={`${name}-${i}`}>{name}</li>
                    ))}
                </ul>
            </div>
        </section>
    );
};