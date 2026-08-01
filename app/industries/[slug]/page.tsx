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
        title={`Get more reviews without slowing down your ${industry.name.toLowerCase()} team.`}
        description={industry.intro}
        primary={{ label: "Plan your first setup", href: "/pilot" }}
        secondary={{ label: "Compare the products", href: "/products" }}
      />
      <section className="industry-detail section-shell">
        <article>
          <MessageSquareText size={25} />
          <h2>When to ask</h2>
          <ul>
            {industry.moments.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <MapPin size={25} />
          <h2>Where to place it</h2>
          <ul>
            {industry.placements.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article>
          <BarChart3 size={25} />
          <h2>What to watch</h2>
          <ul>
            {industry.dashboard.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>
      <section className="plain-cta section-shell">
        <div>
          <h2>Start small enough to see what works.</h2>
          <p>
            One or two placements are usually enough to learn whether customers
            notice the prompt and whether the dashboard saves your team time.
          </p>
        </div>
        <Link className="button button-primary" href="/pilot">
          Plan your setup <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
