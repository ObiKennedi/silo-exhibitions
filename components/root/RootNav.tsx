"use client"

import { useState, useEffect, useCallback } from "react";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { RedirectButton } from "../essentials/LinkButton";
import Image from "next/image";
import logo from "@/public/logo.png";
import logoLight from "@/public/logo-light.png";

import "@/styles/root/RootNav.scss";

const NavLinks = [
    {
        title: "Home",
        href: "/",
    },
    {
        title: "About",
        href: "#about",
    },
    {
        title: "Past Exhibitions",
        href: "#past-exhibitions",
    },
    {
        title: "Upcoming Exhibitions",
        href: "#upcoming-exhibitions",
    },
    {
        title: "Contact",
        href: "#contact",
    },
];

export const RootNav = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Prevent body scrolling when mobile drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Close on Escape key and on desktop resize (>900px)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        const handleResize = () => {
            if (window.innerWidth > 980) {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const closeMenu = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <>
            <header className={`${isScrolled ? "scrolled" : ""} ${isOpen ? "menu-open" : ""} root-nav`}>
                <a href="/" className="logo" onClick={closeMenu}>
                    <Image 
                        src={isScrolled ? logoLight : logo}
                        alt="Silo Exhibitions"
                        priority
                    />
                </a>

                <nav className={`${isScrolled ? "scrolled" : ""} nav-links`}>
                    <ul className="nav-links">
                        {NavLinks.map((link) => (
                            <li key={link.href}>
                                <a href={link.href}>{link.title}</a>
                            </li>
                        ))}
                    </ul>
                    <RedirectButton 
                        className="auth-link"
                        href="/register"
                    >
                        Get Started
                    </RedirectButton>
                </nav>

                <button 
                    className={`nav-toggle ${isOpen ? "active" : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </header>

            {/* Mobile Glassmorphic Drawer Backdrop */}
            <div 
                className={`mobile-backdrop ${isOpen ? "open" : ""}`}
                onClick={closeMenu}
                aria-hidden="true"
            />

            {/* Mobile Glassmorphic Drawer */}
            <aside 
                className={`mobile-drawer ${isOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
            >
                <div className="drawer-header">
                    <a href="/" className="drawer-logo" onClick={closeMenu}>
                        <Image 
                            src={logoLight}
                            alt="Silo Exhibitions"
                            priority
                        />
                    </a>
                    <button 
                        className="drawer-close"
                        onClick={closeMenu}
                        aria-label="Close navigation"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="drawer-content">
                    <nav className="drawer-nav">
                        <ul className={`drawer-links ${isOpen ? "open" : ""}`}>
                            {NavLinks.map((link, index) => (
                                <li 
                                    key={link.href}
                                    style={{ "--item-index": index } as React.CSSProperties}
                                >
                                    <a 
                                        href={link.href}
                                        onClick={closeMenu}
                                        className="drawer-link"
                                    >
                                        <span className="drawer-link-num">0{index + 1}</span>
                                        <span className="drawer-link-text">{link.title}</span>
                                        <ArrowRight size={16} className="drawer-link-arrow" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="drawer-cta-wrapper">
                        <RedirectButton 
                            className="drawer-auth-link"
                            href="/register"
                            onClick={closeMenu}
                        >
                            <span>Get Started</span>
                            <ArrowRight size={16} />
                        </RedirectButton>

                        <a 
                            href="#upcoming-exhibitions"
                            className="drawer-secondary-link"
                            onClick={closeMenu}
                        >
                            <Sparkles size={14} />
                            <span>Explore Upcoming Tradefairs</span>
                        </a>
                    </div>
                </div>

                <div className="drawer-footer">
                    <p className="drawer-footer-tagline">Building Businesses That Last</p>
                    <a href="mailto:hello@siloexhibitions.com" className="drawer-footer-email">
                        hello@siloexhibitions.com
                    </a>
                </div>
            </aside>
        </>
    );
};