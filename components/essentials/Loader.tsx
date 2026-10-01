"use client";

import React from "react";
import Image from "next/image";
import "@/styles/RedirectPage.scss";

export interface LoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  text?: string;
  kicker?: string;
  showLogo?: boolean;
  className?: string;
}

export function Loader({
  size = "md",
  text,
  kicker,
  showLogo = true,
  className = "",
}: LoaderProps) {
  if (size === "fullscreen") {
    return (
      <div className={`redirect-screen ${className}`} role="status" aria-live="polite">
        <div className="redirect-spinner">
          <div className="spinner-ring" />
          <div className="spinner-logo">
            {showLogo ? (
              <Image
                src="/favicon.png"
                alt="Silo Exhibitions"
                width={28}
                height={28}
                priority
                className="spinner-logo-img"
              />
            ) : (
              <span className="spinner-logo-letter">S</span>
            )}
          </div>
        </div>

        <div className="redirect-info">
          {kicker && <span className="redirect-kicker">{kicker}</span>}
          {text ? (
            <h2 className="redirect-title">{text}</h2>
          ) : (
            <h2 className="redirect-title">LOADING...</h2>
          )}
          <p className="redirect-sub">Please hold on a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`silo-loader ${size} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="loader-ring-wrap">
        <div className="spinner-ring" />
        <div className="spinner-logo">
          {showLogo ? (
            <Image
              src="/favicon.png"
              alt="Silo Exhibitions"
              width={22}
              height={22}
              priority
              className="spinner-logo-img"
            />
          ) : (
            <span className="spinner-logo-letter">S</span>
          )}
        </div>
      </div>

      {text && <span className="loader-label">{text}</span>}
    </div>
  );
}

export function RedirectScreen({
  kicker = "taking you there ~",
  title = "REDIRECTING...",
  subtitle = "Setting up your workspace and permissions",
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="redirect-screen" role="status" aria-live="polite">
      <div className="redirect-spinner">
        <div className="spinner-ring" />
        <div className="spinner-logo">
          <Image
            src="/favicon.png"
            alt="Silo Exhibitions"
            width={28}
            height={28}
            priority
            className="spinner-logo-img"
          />
        </div>
      </div>

      <div className="redirect-info">
        {kicker && <span className="redirect-kicker">{kicker}</span>}
        <h2 className="redirect-title">{title}</h2>
        {subtitle && <p className="redirect-sub">{subtitle}</p>}
      </div>
    </div>
  );
}

export default Loader;