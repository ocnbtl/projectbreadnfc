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
    "Scantap gives customers a direct path to your Google review page and gives your business a clearer way to follow what happens next.",
  applicationName: "Scantap",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Scantap",
    title: "Scantap | Make the next good customer moment easier to share",
    description:
      "NFC review tools and a focused reputation dashboard for local businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scantap | NFC review tools for local businesses",
    description:
      "A direct review path and a clearer way to follow the signal.",
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
