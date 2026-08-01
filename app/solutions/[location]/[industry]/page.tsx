import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import {
  curatedSolutions,
  getIndustry,
  getLocation,
} from "@/lib/site-data";

export function generateStaticParams() {
  return curatedSolutions.map((solution) => ({
    location: solution.location,
    industry: solution.industry,
  }));
}

function getSolution(location: string, industry: string) {
  return curatedSolutions.find(
    (solution) =>
      solution.location === location && solution.industry === industry,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; industry: string }>;
}): Promise<Metadata> {
  const { location, industry } = await params;
  const solution = getSolution(location, industry);
  if (!solution) return {};
  return {
    title: solution.title,
    description: solution.description,
    alternates: { canonical: `/solutions/${location}/${industry}` },
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ location: string; industry: string }>;
}) {
  const { location: locationSlug, industry: industrySlug } = await params;
  const solution = getSolution(locationSlug, industrySlug);
  const location = getLocation(locationSlug);
  const industry = getIndustry(industrySlug);
  if (!solution || !location || !industry) notFound();

  return (
    <>
      <PageHero
        title={solution.title}
        description={solution.description}
        primary={{ label: "Plan your first setup", href: "/pilot" }}
        secondary={{ label: `About ${location.name}`, href: `/locations/${location.slug}` }}
      />
      <section className="solution-context section-shell">
        <div>
          <MapPin size={25} />
          <h2>Why this setup fits {location.name}</h2>
        </div>
        <p>{solution.localAngle}</p>
      </section>
      <section className="solution-plan section-shell">
        <div>
          <h2>Start with this setup</h2>
          <p>
            Keep the first version simple, watch how customers use it, and
            adjust the placement from real activity.
          </p>
        </div>
        <ol>
          {solution.plan.map((item, index) => (
            <li key={item}><span>{index + 1}</span>{item}</li>
          ))}
        </ol>
      </section>
      <section className="solution-links section-shell">
        <Link href={`/industries/${industry.slug}`}>
          <Check size={18} />
          <span><strong>{industry.name} guidance</strong>Customer moments, placements, and dashboard questions</span>
          <ArrowRight size={17} />
        </Link>
        <Link href={`/locations/${location.slug}`}>
          <Check size={18} />
          <span><strong>{location.name} service area</strong>Local context and nearby communities</span>
          <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
