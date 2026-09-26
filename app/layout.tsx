import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Silo Exhibitions",
  description: "Reach thousands of willing and able buyers for your products or services.",
  icons: "/favicon.png",
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
