import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/app/globals.css";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";
import ClientLayout from "@/components/layout/ClientLayout";
import ClientLogSetup from "@/components/layout/ClientLogSetup";

const fontSans = FontSans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Quiz",
  description:
    "AI destekli kişiselleştirilmiş sınavlarla öğrenmenizi geliştirin",
  applicationName: "AI Quiz",
  authors: [{ name: "AI Quiz Team" }],
  keywords: [
    "eğitim",
    "sınav",
    "öğrenme",
    "yapay zeka",
    "kişiselleştirilmiş öğrenme",
  ],
  icons: {
    icon: [
      { url: "/favicon.webp", type: "image/webp" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/favicon.webp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="icon" href="/favicon.webp" type="image/webp" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon.webp" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-primary text-primary font-sans antialiased",
          fontSans.className,
        )}
      >
        <ClientLogSetup>
          <Providers>
            <ClientLayout>{children}</ClientLayout>
          </Providers>
        </ClientLogSetup>
      </body>
    </html>
  );
}
