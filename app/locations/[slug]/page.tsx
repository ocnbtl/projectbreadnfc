import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import {
  curatedSolutions,
  getLocation,
  industries,
  locations,
} from "@/lib/site-data";

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return {
    title: `Review management in ${location.name}, ${location.region}`,
    description: location.intro,
    alternates: { canonical: `/locations/${location.slug}` },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  const related = curatedSolutions.filter((solution) => solution.location === slug);

  return (
    <>
      <PageHero
        title={`Review tools for small businesses in ${location.name}, Ohio.`}
        description={location.intro}
        primary={{ label: "Plan a local pilot", href: "/pilot" }}
        secondary={{ label: "See the dashboard", href: "/dashboard" }}
      >
        <div className="location-hero-card">
          <MapPin size={28} />
          <strong>{location.name}</strong>
          <span>{location.region}</span>
          <p>Founder-supported from Greater Cincinnati</p>
        </div>
      </PageHero>
      <section className="location-context section-shell">
        <div>
          <h2>What shapes the local plan</h2>
          <p>
            This is a starting hypothesis for a pilot, not a claim that every
            {` ${location.name}`} business works the same way.
          </p>
        </div>
        <ul>
          {location.localContext.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="nearby-section section-shell">
        <h2>Nearby areas a pilot may serve</h2>
        <div>
          {location.nearby.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
      {related.length > 0 ? (
        <section className="local-solution section-shell">
          <h2>A more specific guide for {location.name}</h2>
          {related.map((solution) => (
            <Link href={`/solutions/${solution.location}/${solution.industry}`} key={solution.industry}>
              <span><strong>{solution.title}</strong>{solution.description}</span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </section>
      ) : (
        <section className="plain-cta section-shell">
          <div>
            <h2>Choose the customer moment before the hardware.</h2>
            <p>Start with an industry guide, then tailor the placement to the business.</p>
          </div>
          <Link className="button button-primary" href={`/industries/${industries[0].slug}`}>
            Browse industry guidance <ArrowRight size={17} />
          </Link>
        </section>
      )}
    </>
  );
}
