import { absoluteUrl } from "@/lib/seo";

export const company = {
  name: "Dalemans Sitzmöbel und Tische",
  brandName: "Dalemans Stapelstühle & Klapptische",
  organizationId: absoluteUrl("/#organization"),
  websiteId: absoluteUrl("/#website"),
  founded: "1994",
  telephone: "+49 9342 9153-53",
  telephoneHref: "tel:+499342915353",
  email: "info@dalemans.de",
  emailHref: "mailto:info@dalemans.de",
  address: {
    streetAddress: "Bollenwaldstraße 108a",
    postalCode: "63743",
    addressLocality: "Aschaffenburg",
    addressCountry: "DE",
  },
} as const;

export const organizationStructuredData = {
  "@type": "Organization",
  "@id": company.organizationId,
  name: company.name,
  alternateName: company.brandName,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/pictures/Über uns/dalemans_logo1.png"),
  description:
    "Familienunternehmen für Stapelstühle, Klapptische, Raum- und Bestuhlungsplanung sowie langfristige Betreuung flexibler Räume.",
  foundingDate: company.founded,
  telephone: company.telephone,
  email: company.email,
  address: { "@type": "PostalAddress", ...company.address },
  areaServed: "DE",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: company.telephone,
    email: company.email,
    availableLanguage: ["de"],
  },
};
