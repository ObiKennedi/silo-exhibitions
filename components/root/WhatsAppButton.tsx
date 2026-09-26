import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";

interface WhatsAppButtonProps {
    url: string;
    variant?: "default" | "floating";
    label?: string;
    className?: string;
}

export const WhatsAppButton = ({
    url,
    variant = "default",
    label = "Chat on WhatsApp",
    className = "",
}: WhatsAppButtonProps) => {
    if (!url) return null;

    if (variant === "floating") {
        return (
            <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`event-whatsapp-floating ${className}`.trim()}
                aria-label="Chat on WhatsApp"
            >
                <FaWhatsapp size={28} />
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