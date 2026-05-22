import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://stapelstuhl-klapptisch.de";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;
export const siteName = "Dalemans";
export const defaultTitle = "Dalemans | Stapelstühle, Klapptische und Sonderlösungen";
export const defaultDescription =
  "Dalemans bietet Stapelstühle, Klapptische, Gemeindestühle, Bankettmöbel sowie Transportwagen und Zubehör für Gemeinden, Säle und Veranstaltungsräume.";
export const defaultOgImage = "/pictures/Über uns/main_carousel_01.jpg";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = defaultOgImage,
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url,
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

