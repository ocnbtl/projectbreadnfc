import type { Metadata } from "next";
import { DirectoryCard } from "@/components/directory-card";
import { PageHero } from "@/components/page-hero";
import { industries } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Review tools by industry",
  description:
    "See how Scantap NFC review tools fit restaurants, home services, specialty retail, and professional services.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        title="The review moment is different in every kind of business."
        description="A restaurant host stand, a contractor's final walkthrough, and a professional office closeout should not use the same placement plan. Start with the customer moment that already makes sense."
        primary={{ label: "Plan a pilot", href: "/pilot" }}
        secondary={{ label: "Compare products", href: "/products" }}
      />
      <section className="listing-section section-shell">
        <div className="listing-grid">
          {industries.map((industry) => (
            <DirectoryCard
              description={industry.short}
              href={`/industries/${industry.slug}`}
              key={industry.slug}
              meta="Industry guide"
              title={industry.name}
            />
          ))}
        </div>
      </section>
      <section className="content-principle section-shell">
        <h2>Industry guidance should change the plan, not just the headline.</h2>
        <p>
          Each guide focuses on different customer moments, placements, and
          dashboard questions. Scantap will add new industry pages only when
          there is enough firsthand operating knowledge to make them useful.
        </p>
      </section>
    </>
  );
}
