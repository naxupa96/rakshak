import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Sans_Gujarati } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-deva",
  display: "swap",
});
const notoGuj = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  variable: "--font-noto-guj",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rakshak — AI Financial Threat Intelligence for Indian Investors",
    template: "%s · Rakshak",
  },
  description:
    "Rakshak analyzes suspicious investment messages, websites and financial claims, then explains the risk with evidence — DETECT, VERIFY, EXPLAIN, PROTECT.",
  applicationName: "Rakshak",
  keywords: ["investor safety", "fraud detection", "SEBI", "financial threat intelligence", "India"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Rakshak — Verify Before You Trust",
    description: "Real-time threat intelligence and fraud prevention for retail investors.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rakshak — AI Financial Threat Intelligence",
    description: "Verify before you trust. Real-time threat detection for Indian retail investors.",
  },
};

export const viewport = {
  themeColor: "#0d0f12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${notoDeva.variable} ${notoGuj.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <AppProviders>
          <SiteNav />
          <main id="content" className="flex-1">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
