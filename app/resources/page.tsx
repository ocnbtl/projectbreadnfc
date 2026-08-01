import type { Metadata } from "next";
import { DirectoryCard } from "@/components/directory-card";
import { PageHero } from "@/components/page-hero";
import { articles } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Review management blog",
  description: "Practical guides to review requests, NFC tag placement, reputation dashboard metrics, and local-business review practices.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        title="Straight answers for getting and managing more customer reviews."
        description="Learn when to ask, where to place the product, what to watch in the dashboard, and how to keep the process comfortable for customers and staff."
        primary={{ label: "Read the latest article", href: `/resources/${articles[0].slug}` }}
        secondary={{ label: "Try the dashboard", href: "/dashboard" }}
      />
      <section className="listing-section section-shell">
        <div className="resource-grid">
          {articles.map((article) => (
            <DirectoryCard description={article.description} href={`/resources/${article.slug}`} key={article.slug} meta={`${article.category} · ${article.readTime}`} title={article.title} />
          ))}
        </div>
      </section>
      <section className="editorial-note section-shell">
        <h2>Advice you can use during a real workday.</h2>
        <p>Every article should help an owner or manager make one better decision. When advice depends on a platform policy, supplier test, or live result, we will say that clearly.</p>
      </section>
    </>
  );
}
