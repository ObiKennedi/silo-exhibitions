import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import "@/styles/root/WhatsAppButton.scss";

interface WhatsAppButtonProps {
    url: string;
    variant?: "default" | "floating";
    label?: string;
    message?: string;
    className?: string;
}

export const WhatsAppButton = ({
    url,
    variant = "default",
    label = "Chat on WhatsApp",
    message = "Chat with us",
    className = "",
}: WhatsAppButtonProps) => {
    if (!url) return null;

    if (variant === "floating") {
        return (
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`event-whatsapp-floating-wrap ${className}`.trim()}
                aria-label={message || "Chat on WhatsApp"}
            >
                {message && (
                    <span className="event-whatsapp-bubble">
                        <span className="event-whatsapp-bubble__pulse" />
                        <span className="event-whatsapp-bubble__text">{message}</span>
                    </span>
                )}
                <span className="event-whatsapp-floating">
                    <FaWhatsapp size={28} />
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`event-whatsapp-btn ${className}`.trim()}
        >
            <FaWhatsapp size={18} />
            <span>{label}</span>
        </Link>
    );
};