import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/lib/site-data";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/resources/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const currentIndex = articles.findIndex((item) => item.slug === slug);
  const nextArticle = articles[(currentIndex + 1) % articles.length];

  return (
    <article className="article-page section-shell">
      <Link className="article-back" href="/resources">
        <ArrowLeft size={16} /> All resources
      </Link>
      <header>
        <span>{article.category} · {article.readTime}</span>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <small>Published {article.published} · Scantap editorial</small>
      </header>
      <div className="article-body">
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.points && (
              <ul>
                {section.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
      <aside className="article-next">
        <span>Read next</span>
        <Link href={`/resources/${nextArticle.slug}`}>
          {nextArticle.title} <ArrowRight size={18} />
        </Link>
      </aside>
    </article>
  );
}
