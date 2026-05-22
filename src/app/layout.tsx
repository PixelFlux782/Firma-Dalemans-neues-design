import "./globals.css";
import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Header />
        <main className="min-h-screen py-8 md:py-12">
          <div className="container-premium">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}

