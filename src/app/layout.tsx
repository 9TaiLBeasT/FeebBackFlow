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
      <Script src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        defer
      />
      <Script id="onesignal-init" strategy="afterInteractive">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "38a81c58-0420-4340-90af-03cf1a0322a8",
              safari_web_id: "web.onesignal.auto.1ee85315-99d2-4859-abe2-d0d2d86b4cd7",
              notifyButton: {
                enable: true,
              },
            });
          });
        `}
      </Script>
      <body
        className={`${orbitron.className} bg-gradient-cyber min-h-screen page-transition`}
      >
        {children}
        <Toaster />
        <TempoInit />
      </body>
    </html>
  );
}
