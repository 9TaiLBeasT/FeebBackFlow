import { TempoInit } from "@/components/tempo-init";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Orbitron, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tempo - Modern SaaS Starter",
  description: "A modern full-stack starter template powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${orbitron.variable} ${robotoMono.variable}`}
    >
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={`${orbitron.className} bg-gradient-cyber min-h-screen`}>
        {children}
        <Toaster />
        <TempoInit />
      </body>
    </html>
  );
}
