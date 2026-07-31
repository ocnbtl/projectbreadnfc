import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, MapPin, MessageSquareText } from "lucide-react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getIndustry, industries } from "@/lib/site-data";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return {
    title: `Google review tools for ${industry.name.toLowerCase()}`,
    description: industry.intro,
    alternates: { canonical: `/industries/${industry.slug}` },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  return (
    <>
      <PageHero
        title={`A better review prompt for ${industry.name.toLowerCase()}.`}
        description={industry.intro}
        primary={{ label: "Build a pilot outline", href: "/pilot" }}
        secondary={{ label: "See product formats", href: "/products" }}
      />
      <section className="industry-detail section-shell">
        <article>
          <MessageSquareText size={25} />
          <h2>Moments that make sense</h2>
          <ul>
            {industry.moments.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <MapPin size={25} />
          <h2>Good places to start</h2>
          <ul>
            {industry.placements.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <BarChart3 size={25} />
          <h2>What the dashboard should answer</h2>
          <ul>
            {industry.dashboard.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>
      <section className="plain-cta section-shell">
        <div>
          <h2>Start with one placement and one weekly routine.</h2>
          <p>
            A smaller pilot makes it easier to tell whether the placement,
            team habit, and dashboard are genuinely useful.
          </p>
        </div>
        <Link className="button button-primary" href="/pilot">
          Plan the first version <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
