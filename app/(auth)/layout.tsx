import React from "react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/auth/AuthLayout.scss";

export const metadata = {
  title: "Authentication | Silo Exhibitions",
  description: "Secure login, registration, and account recovery for Silo Exhibitions.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Left Side: Fluid Silk Inspiration & Brand Quote */}
        <section className="auth-art-panel" aria-label="Visual Brand Inspiration">
          <div className="auth-quote-tag">
            <span className="quote-pill">Wise Words</span>
            <span className="quote-script">a little inspiration ~</span>
            <div className="quote-line" aria-hidden="true" />
          </div>

          <div className="auth-quote-block">
            <h2 className="auth-quote-heading">
              GET<br />
              EVERYTHING<br />
              YOU WANT<span className="accent-dot">.</span>
            </h2>
            <p className="auth-quote-text">
              You can get everything you want if you work hard, trust the process,
              and stick to the plan.
            </p>
          </div>
        </section>

        {/* Right Side: Form Card */}
        <section className="auth-form-panel">
          <header className="auth-brand-header">
            <Link href="/" className="brand-logo-link" title="Return to Silo Exhibitions Home">
              <span className="brand-favicon-wrap" aria-hidden="true">
                <Image
                  src="/favicon.png"
                  alt="Silo Exhibitions Favicon"
                  width={32}
                  height={32}
                  priority
                  className="brand-favicon-img"
                />
              </span>
              <span className="brand-title">Silo Exhibitions</span>
            </Link>
          </header>

          <div className="auth-content-container">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
