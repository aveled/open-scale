import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import {
    KIOSK_MODE,
} from '@/data/index';



const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "open scale",
    description: "infrastructure for weight measurement",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${KIOSK_MODE ? 'cursor-none' : ''}`}
        >
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning={true}
            >
                {children}
            </body>
        </html>
    );
}
