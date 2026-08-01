import type { Metadata } from "next";
import { DirectoryCard } from "@/components/directory-card";
import { PageHero } from "@/components/page-hero";
import { curatedSolutions, locations } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Greater Cincinnati service areas",
  description: "Local review tools and practical guidance for businesses in Cincinnati, Mason, and Blue Ash, Ohio.",
};

export default function LocationsPage() {
  return (
    <>
      <PageHero
        title="Local review support for Greater Cincinnati businesses."
        description="Scantap is based in Cincinnati. We are starting nearby so product setup, placement advice, and early support can be personal instead of passed through a ticket queue."
        primary={{ label: "Plan a local setup", href: "/pilot" }}
        secondary={{ label: "Choose your industry", href: "/industries" }}
      />
      <section className="listing-section section-shell">
        <div className="listing-grid listing-grid-three">
          {locations.map((location) => (
            <DirectoryCard description={location.intro} href={`/locations/${location.slug}`} key={location.slug} meta="Local guide" title={`${location.name}, ${location.region}`} />
          ))}
        </div>
      </section>
      <section className="focused-guides section-shell">
        <div className="section-heading">
          <h2>Local plans for specific types of business</h2>
          <p>These guides combine the local market with a real customer workflow, so the advice goes beyond swapping a city name into the headline.</p>
        </div>
        <div className="focused-guide-list">
          {curatedSolutions.map((solution) => (
            <DirectoryCard description={solution.description} href={`/solutions/${solution.location}/${solution.industry}`} key={`${solution.location}-${solution.industry}`} title={solution.title} />
          ))}
        </div>
      </section>
    </>
  );
}
