import type { Metadata } from "next";
import { DirectoryCard } from "@/components/directory-card";
import { PageHero } from "@/components/page-hero";
import { articles } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Review management resources",
  description:
    "Practical guides to review requests, NFC tag placement, reputation dashboard metrics, and honest local-business review practices.",
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        title="Practical answers for the parts of review management that get awkward."
        description="Short guides for choosing the moment, placing the hardware, reading the dashboard, and keeping the review request honest."
        primary={{ label: "Read the latest guide", href: `/resources/${articles[0].slug}` }}
        secondary={{ label: "Explore the dashboard", href: "/dashboard" }}
      />
      <section className="listing-section section-shell">
        <div className="resource-grid">
          {articles.map((article) => (
            <DirectoryCard
              description={article.description}
              href={`/resources/${article.slug}`}
              key={article.slug}
              meta={`${article.category} · ${article.readTime}`}
              title={article.title}
            />
          ))}
        </div>
      </section>
      <section className="editorial-note section-shell">
        <h2>Written for the person who has to use it.</h2>
        <p>
          Scantap resources are written to help an owner or manager make a
          better decision. When a recommendation depends on a platform policy,
          supplier test, or operating result, the page should say so plainly.
        </p>
      </section>
    </>
  );
}
