import type { Metadata } from "next";
import { DirectoryCard } from "@/components/directory-card";
import { PageHero } from "@/components/page-hero";
import { industries } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Review tools by industry",
  description: "See how Scantap fits restaurants, home services, specialty retail, and professional offices.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        title="Where should you ask for a review? It depends on how the job ends."
        description="A restaurant checkout, a contractor's final walkthrough, and a salon front desk each need a different setup. Find the customer moment first, then choose the product that fits it."
        primary={{ label: "Find your starting point", href: "/pilot" }}
        secondary={{ label: "See the products", href: "/products" }}
      />
      <section className="listing-section section-shell">
        <div className="listing-grid">
          {industries.map((industry) => (
            <DirectoryCard description={industry.short} href={`/industries/${industry.slug}`} key={industry.slug} meta="Industry guide" title={industry.name} />
          ))}
        </div>
      </section>
      <section className="content-principle section-shell">
        <h2>Useful advice should change where you place the product.</h2>
        <p>Each guide covers the best time to ask, the placement most likely to get noticed, and the dashboard information worth checking afterward.</p>
      </section>
    </>
  );
}
