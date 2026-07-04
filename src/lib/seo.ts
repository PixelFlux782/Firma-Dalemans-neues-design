import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://stapelstuhl-klapptisch.de";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;
export const siteName = "DLMNS Stapelstühle & Klapptische";
export const defaultTitle = "DLMNS Stapelstühle & Klapptische | Ausstattung für Gemeinden und Säle";
export const defaultDescription =
  "DLMNS Stapelstühle & Klapptische bietet robuste Stapelstühle, Klapptische, Gemeindestühle, Transportwagen, Zubehör und Beratung für Gemeinden, Säle und flexible Räume.";
export const defaultOgImage = "/pictures/Produkte/Stühle/1021c-01.jpg";

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

