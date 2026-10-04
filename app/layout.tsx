import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://siloexhibitions.com.ng"),
  title: {
    default: "Silo Exhibitions — Nigeria's Premier Campus & Commercial Trade Fair",
    template: "%s | Silo Exhibitions",
  },
  description: "Reach thousands of willing and able buyers for your products or services. Book exhibition stands, apply for vendor spots, and grow your brand.",
  icons: "/favicon.png",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://siloexhibitions.com.ng",
    siteName: "Silo Exhibitions",
    title: "Silo Exhibitions — Premier Trade Fairs & Business Exhibitions",
    description: "Reach thousands of willing and able buyers for your products or services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
