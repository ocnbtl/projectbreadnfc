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
        title={`Get more Google reviews in ${location.name}, Ohio.`}
        description={location.intro}
        primary={{ label: "Plan your local setup", href: "/pilot" }}
        secondary={{ label: "Try the dashboard", href: "/dashboard" }}
      >
        <div className="location-hero-card">
          <MapPin size={28} />
          <strong>{location.name}</strong>
          <span>{location.region}</span>
          <p>Local, founder-led support</p>
        </div>
      </PageHero>
      <section className="location-context section-shell">
        <div>
          <h2>What matters in {location.name}</h2>
          <p>
            Every business is different, but these are useful starting points
            when you choose a location and customer moment.
          </p>
        </div>
        <ul>
          {location.localContext.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="nearby-section section-shell">
        <h2>Nearby areas we can support</h2>
        <div>
          {location.nearby.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>
      {related.length > 0 ? (
        <section className="local-solution section-shell">
          <h2>See a plan for your kind of business</h2>
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
            <h2>Start with the way your customer experience ends.</h2>
            <p>Choose an industry guide, then match the product to that moment.</p>
          </div>
          <Link className="button button-primary" href={`/industries/${industries[0].slug}`}>
            Browse industries <ArrowRight size={17} />
          </Link>
        </section>
      )}
    </>
  );
}
