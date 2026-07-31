import type { Metadata } from "next";
import { DirectoryCard } from "@/components/directory-card";
import { PageHero } from "@/components/page-hero";
import { curatedSolutions, locations } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Greater Cincinnati service areas",
  description:
    "Local review tools and practical guidance for businesses in Cincinnati, Mason, and Blue Ash, Ohio.",
};

export default function LocationsPage() {
  return (
    <>
      <PageHero
        title="Local review support, starting close to home."
        description="Scantap is founder-led in Cincinnati. The first location guides focus on nearby communities where local context, in-person support, and a small pilot can actually mean something."
        primary={{ label: "Plan a local pilot", href: "/pilot" }}
        secondary={{ label: "Browse industries", href: "/industries" }}
      />
      <section className="listing-section section-shell">
        <div className="listing-grid listing-grid-three">
          {locations.map((location) => (
            <DirectoryCard
              description={location.intro}
              href={`/locations/${location.slug}`}
              key={location.slug}
              meta="Local guide"
              title={`${location.name}, ${location.region}`}
            />
          ))}
        </div>
      </section>
      <section className="focused-guides section-shell">
        <div className="section-heading">
          <h2>Focused local guides</h2>
          <p>
            These pages combine a real business type with a local operating
            context. Scantap will not publish a mass-produced city-by-industry
            matrix that says the same thing hundreds of ways.
          </p>
        </div>
        <div className="focused-guide-list">
          {curatedSolutions.map((solution) => (
            <DirectoryCard
              description={solution.description}
              href={`/solutions/${solution.location}/${solution.industry}`}
              key={`${solution.location}-${solution.industry}`}
              title={solution.title}
            />
          ))}
        </div>
      </section>
    </>
  );
}
