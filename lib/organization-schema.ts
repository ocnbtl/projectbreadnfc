import { siteUrl } from "@/lib/site-data";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Scantap",
  url: siteUrl,
  description: "NFC review tools and reputation software for local businesses.",
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Greater Cincinnati",
  },
};

export const organizationSchemaJson = JSON.stringify(organizationSchema).replaceAll(
  "<",
  "\\u003c",
);
