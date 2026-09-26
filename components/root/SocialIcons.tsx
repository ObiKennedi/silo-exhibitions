import { FaXTwitter, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";

interface IconProps {
    size?: number;
    className?: string;
}

export const XIcon = ({ size = 18, className }: IconProps) => (
    <FaXTwitter size={size} className={className} aria-hidden="true" />
);

export const FacebookIcon = ({ size = 18, className }: IconProps) => (
    <FaFacebookF size={size} className={className} aria-hidden="true" />
);

export const InstagramIcon = ({ size = 18, className }: IconProps) => (
    <FaInstagram size={size} className={className} aria-hidden="true" />
);

export const TikTokIcon = ({ size = 18, className }: IconProps) => (
    <FaTiktok size={size} className={className} aria-hidden="true" />
);