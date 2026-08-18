import type { Metadata } from "next";
import "./globals.css";
import "./app/product-app.css";
import { SiteChrome } from "@/components/site-chrome";
import { organizationSchemaJson } from "@/lib/organization-schema";
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
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
        <script
          dangerouslySetInnerHTML={{ __html: organizationSchemaJson }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
