import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { siteUrl } from "@/lib/site-data";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Scantap | NFC review tools for local businesses",
    template: "%s | Scantap",
  },
  description:
    "Scantap helps local businesses earn more Google reviews with NFC and QR products, then manage reviews, replies, locations, and devices from one dashboard.",
  applicationName: "Scantap",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Scantap",
    title: "Scantap | Drive traffic and sales with more five-star reviews",
    description:
      "NFC review products and a straightforward reputation dashboard for local businesses.",
    images: [
      {
        url: "/images/scantap-counter-stand.png",
        width: 1536,
        height: 1150,
        alt: "Scantap NFC and QR counter stand for Google reviews",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scantap | NFC review tools for local businesses",
    description:
      "Make the Google review ask easy while the customer experience is still fresh.",
    images: ["/images/scantap-counter-stand.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Scantap",
    url: siteUrl,
    description:
      "NFC review tools and reputation software for local businesses.",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Greater Cincinnati",
    },
  };

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
