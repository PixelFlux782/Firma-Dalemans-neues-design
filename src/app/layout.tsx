import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  absoluteUrl,
  defaultDescription,
  defaultOgImage,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "Stapelstühle",
    "Klapptische",
    "Gemeindestühle",
    "Bankettmöbel",
    "Transportwagen",
    "Kirchenstühle",
    "Gemeindemobiliar",
    "Dalemans",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: absoluteUrl("/"),
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: absoluteUrl(defaultOgImage),
        width: 1200,
        height: 630,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [absoluteUrl(defaultOgImage)],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-premium-ink px-4 py-3 text-sm font-medium text-white transition focus:translate-y-0"
        >
          Zum Hauptinhalt
        </a>
        <Header />
        <main id="main-content" className="min-h-screen pb-24 pt-6 md:py-10 lg:py-12">
          <div className="container-premium">{children}</div>
        </main>
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-premium-beige/70 bg-premium-canvas/95 px-4 py-3 shadow-premium-lg backdrop-blur-md md:hidden">
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:+499342915353" className="btn-primary px-4 py-3 text-center text-xs">
              Anrufen
            </a>
            <a href="mailto:info@dalemans.de" className="btn-secondary px-4 py-3 text-center text-xs">
              E-Mail
            </a>
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
