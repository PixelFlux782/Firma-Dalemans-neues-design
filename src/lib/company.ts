import { absoluteUrl } from "@/lib/seo";

export const company = {
  name: "Dalemans Sitzmöbel und Tische",
  legalName: "Stefan Dalemans – Dalemans Sitzmöbel und Tische",
  brandName: "Dalemans Stapelstühle & Klapptische",
  organizationId: absoluteUrl("/#organization"),
  websiteId: absoluteUrl("/#website"),
  founded: "1994",
  telephone: "+49 9342 9153-53",
  telephoneHref: "tel:+499342915353",
  mobile: "+49 170 5555331",
  mobileHref: "tel:+491705555331",
  vatId: "DE161952944",
  email: "info@dalemans.de",
  emailHref: "mailto:info@dalemans.de",
  logoPath: "/images/branding/dalemans-logo.webp",
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
  legalName: company.legalName,
  alternateName: company.brandName,
  url: absoluteUrl("/"),
  logo: absoluteUrl(company.logoPath),
  description:
    "Familienunternehmen für Stapelstühle, Klapptische, Raum- und Bestuhlungsplanung sowie langfristige Betreuung flexibler Räume.",
  foundingDate: company.founded,
  telephone: company.telephone,
  email: company.email,
  vatID: company.vatId,
  address: { "@type": "PostalAddress", ...company.address },
  areaServed: "DE",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: [company.telephone, company.mobile],
    email: company.email,
    availableLanguage: ["de"],
  },
};
