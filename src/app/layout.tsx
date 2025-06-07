import { TempoInit } from "@/components/tempo-init";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Orbitron, Roboto_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";
import { apiConfig } from "@/config/api";

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
              appId: "${apiConfig.push.oneSignal.appId}",
              safari_web_id: "${apiConfig.push.oneSignal.safariWebId}",
              notifyButton: {
                enable: true,
                size: 'medium',
                theme: 'default',
                position: 'bottom-right',
                offset: {
                  bottom: '20px',
                  right: '20px',
                },
                prenotify: true,
                showCredit: false,
                text: {
                  'tip.state.unsubscribed': 'Subscribe to notifications',
                  'tip.state.subscribed': 'You are subscribed to notifications',
                  'tip.state.blocked': 'You have blocked notifications',
                  'message.prenotify': 'Click to subscribe to notifications',
                  'message.action.subscribed': 'Thanks for subscribing!',
                  'message.action.resubscribed': 'You are now subscribed',
                  'message.action.unsubscribed': 'You will not receive notifications',
                },
                colors: {
                  'circle.background': '#000000',
                  'circle.foreground': 'white',
                  'badge.background': '#00c0f3',
                  'badge.foreground': 'white',
                  'badge.bordercolor': 'white',
                  'pulse.color': 'white',
                  'dialog.button.background.hovering': '#00c0f3',
                  'dialog.button.background.active': '#00a6d4',
                  'dialog.button.background': '#00c0f3',
                  'dialog.button.foreground': 'white',
                },
              },
            });
          });
        `}
      </Script>
      <body
        className={`${orbitron.className} bg-gradient-cyber min-h-screen page-transition`}
      >
        <ErrorBoundary>
          <AppProvider>
            {children}
            <Toaster />
            <TempoInit />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
